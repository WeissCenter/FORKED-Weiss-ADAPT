import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { AlertService } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/services/alert.service';
import { Observable, catchError, firstValueFrom, from, of, repeat, skipWhile, switchMap, take } from 'rxjs';
import * as xlsx from 'xlsx';
import { DataSource, DataSourceType } from '@adapt/types';
import { NotificationsService } from '../../../services/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { getFormErrors, uniqueNameValidator } from '../../../util';
import { HttpErrorResponse } from '@angular/common/http';
import { FileValidation, validate } from '@adapt/validation';

function fileSizeValidator(maxSize: number) {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const fileSize = control.value?.size !== undefined ? control.value.size : 0;
    if (fileSize > maxSize) {
      return { fileSizeExceeded: true };
    }
    return null;
  };
}

function validateFile(service: AdaptDataService) {
  return async (control: AbstractControl): Promise<any> => {
    // return null

    const file = control.value as File;

    const root = control.parent as FormGroup;

    const fileSpec = root.get('fileSpec')?.value;

    if (!fileSpec || fileSpec === 'default') {
      return null;
    }

    const validationJson = await firstValueFrom(service.getValidationJSON(fileSpec));

    return fileValidate(file, validationJson);
  };
}

function fileValidate(file: File, validationJson: FileValidation) {
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);

  return new Promise((resolve, reject) => {
    fileReader.onload = (e: any) => {
      const bufferArray = e?.target.result;
      const wb = xlsx.read(bufferArray, { type: 'buffer' });

      const errors = validate(wb, validationJson);

      if (errors.length) {
        return resolve(errors);
      }

      resolve([]);
    };

    fileReader.onerror = reject;
  });
}

@Component({
  selector: 'adapt-upload-data',
  templateUrl: './upload-data.component.html',
  styleUrls: ['./upload-data.component.scss'],
})
export class UploadDataComponent {
  getFormErrors = getFormErrors;
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

  public uploadDataFormGroup: FormGroup;

  public isSecret = false;

  public uploadFailed = false;

  public dataPreview: Observable<
    { [sheet: string]: { headers: string[]; total: number; data: any[] } } | { error: string }
  >;

  constructor(
    private fb: FormBuilder,
    private data: AdaptDataService,
    private alert: AlertService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.uploadDataFormGroup = this.fb.group({
      name: this.fb.control(
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s]*$/)],
        [uniqueNameValidator('DataSource', this.data)]
      ),
      description: this.fb.control(''),
      type: this.fb.control('', [Validators.required]),
      fileSpec: this.fb.control('default', []),
      path: this.fb.control(
        '',
        [Validators.required, fileSizeValidator(this.MAX_FILE_SIZE)],
        [validateFile(this.data)]
      ),
      connectionInfo: this.fb.group({
        type: this.fb.control('', [Validators.required]),
        port: this.fb.control('', [Validators.required]),
        database: this.fb.control('', [Validators.required]),
        //'secret': this.fb.control('', [Validators.required]),
        username: this.fb.control('', [Validators.required]),
        password: this.fb.control('', [Validators.required]),
      }),
    });

    // setup preview

    this.dataPreview = this.path!.valueChanges.pipe(
      switchMap((value: File) => {
        if (this.type?.value !== 'file' || !value || value.size >= this.MAX_FILE_SIZE) {
          return of(null);
        }

        return from(
          value.arrayBuffer().then((result) => {
            const workbook = xlsx.read(result);

            return workbook.SheetNames.reduce((accum, val) => {
              const sheetJSON = xlsx.utils.sheet_to_json(workbook.Sheets[val], { header: 1 });

              const headers = sheetJSON.shift();

              return Object.assign(accum, {
                [val]: { headers, total: sheetJSON.length, data: sheetJSON.slice(0, 10) },
              }) as any;
            }, {}) as any;
          })
        );
      })
    ).pipe(
      catchError((err) => {
        return of({ error: 'failed to do preview: ' + JSON.stringify(err.message) });
      })
    );

    this.type?.valueChanges.subscribe((change) => {
      if (change === 'sql') {
        this.connectionInfo.enable();
      }

      if (change === 'file') {
        this.connectionInfo.disable();
      }
    });
  }

  get description() {
    return this.uploadDataFormGroup.get('description');
  }

  get port() {
    return this.uploadDataFormGroup.get('port');
  }
  get name() {
    return this.uploadDataFormGroup.get('name');
  }
  get type() {
    return this.uploadDataFormGroup.get('type');
  }

  get path() {
    return this.uploadDataFormGroup.get('path');
  }

  get connectionInfo() {
    return this.uploadDataFormGroup.get('connectionInfo') as FormGroup;
  }

  get connectionInfo_type() {
    return this.connectionInfo.get('type');
  }

  get connectionInfo_database() {
    return this.connectionInfo.get('database');
  }

  get connectionInfo_username() {
    return this.connectionInfo.get('username');
  }

  get connectionInfo_password() {
    return this.connectionInfo.get('password');
  }

  get connectionInfo_secret() {
    return this.connectionInfo.get('secret');
  }

  get connectionInfo_port() {
    return this.connectionInfo.get('port');
  }

  public useSecret() {
    this.isSecret = !this.isSecret;

    if (this.isSecret) {
      this.connectionInfo_password?.disable();
      this.connectionInfo_username?.disable();
      this.connectionInfo_secret?.enable();
    } else {
      this.connectionInfo_password?.enable();
      this.connectionInfo_username?.enable();
      this.connectionInfo_secret?.disable();
    }
  }

  public testConnection() {
    this.data.testDBConnection({ url: this.path?.value, ...this.connectionInfo.getRawValue() }).subscribe(() => {
      this.alert.add({ type: 'success', title: 'Connection Successful', body: 'Data Source connection successful' });
    });
  }

  public async onSubmit() {
    if (this.uploadDataFormGroup.invalid) {
      return;
    }

    const result = this.uploadDataFormGroup.value;

    const file = result.path;

    if (result.type === DataSourceType.FILE) {
      result.path = result.path.name;
    }

    try {
      const createResult = await firstValueFrom(this.data.createDataSource(result));

      if (result.type === DataSourceType.FILE) {
        await this.handleFileProcess(createResult, file);

        return;
      }

      this.alert.add({
        type: 'success',
        title: 'Data Source Created',
        body: `Datasource ${createResult.dataSourceID} was created`,
      });

      this.router.navigate(['../', createResult.dataSourceID], { relativeTo: this.route });
    } catch (err: any) {
      if (err instanceof Error) {
        this.alert.add({
          type: 'error',
          title: 'Data Source Creation Failed',
          body: `Failed to Create Data Source: ${err.message}`,
        });
        return;
      }

      this.alert.add({
        type: 'error',
        title: 'Data Source Creation Failed',
        body: `Failed to Create Data Source: Unknown Error`,
      });
    }
  }

  private async handleFileProcess(createResult: DataSource | { dataSourceID: string; uploadURL: string }, file: any) {
    await this.handleFileUpload(createResult, file);

    this.data
      .validateFile(createResult.dataSourceID!)
      .pipe(
        repeat({ delay: 1000 }),
        skipWhile((res) => res.status === 202),
        take(1)
      )
      .subscribe({
        next: () => {
          this.alert.add({
            type: 'success',
            title: 'Data Source Created',
            body: `Datasource ${createResult.dataSourceID} was created`,
          });

          this.router.navigate(['../', createResult.dataSourceID], { relativeTo: this.route });
        },
        error: ({ error: { err } }: HttpErrorResponse) => {
          console.log('error', err);
          this.alert.add({
            type: 'error',
            title: 'Data Source File Upload Invalid',
            body: `File Upload was invalid for chosen file specification`,
          });
          this.path?.setErrors({ validateFile: err });
        },
      });
  }

  private async handleFileUpload(createResult: DataSource | { dataSourceID: string; uploadURL: string }, file: any) {
    try {
      const fileUploadResult = createResult as { dataSourceID: string; uploadURL: string };

      const url = fileUploadResult.uploadURL;

      const uploadResult = await fetch(url, { method: 'PUT', body: file });

      if (!uploadResult.ok) {
        throw new Error(await uploadResult.json());
      }

      this.alert.add({ type: 'success', title: 'Data Source File Uploaded', body: 'Upload success' });
    } catch (err: any) {
      if (createResult.dataSourceID) {
        await firstValueFrom(this.data.deleteDataSource(createResult.dataSourceID));
      }

      if (err instanceof TypeError) {
        this.alert.add({
          type: 'error',
          title: 'Data Source File Upload Fail',
          body: `Failed to upload file: Unknown Error`,
        });
        return;
      }

      this.alert.add({
        type: 'error',
        title: 'Data Source File Upload Fail',
        body: `Failed to upload file: ${err.err}`,
      });

      throw new Error('Upload Fail');
    }
  }
}
