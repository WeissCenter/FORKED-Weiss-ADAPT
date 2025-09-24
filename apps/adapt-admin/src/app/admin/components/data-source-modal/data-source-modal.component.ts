import { DataSource, DataSourceConnectionInfo, IDataSource, PageMode } from '@adapt/types';
import { Component, EventEmitter, HostListener, OnDestroy, Output, ViewChild } from '@angular/core';
import { StepsIndicatorComponent } from '../steps-indicator/steps-indicator.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FullPageModalComponent } from '../full-page-modal/full-page-modal.component';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { AlertService } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/services/alert.service';
import { ModalComponent } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/components/modal/modal.component';
import { Subscription } from 'rxjs';
import { getFormErrors } from '../../../util';
import { Router } from '@angular/router';
import { Idle } from '@ng-idle/core';
import { UserService } from '../../../auth/services/user/user.service';
import { IdleStates } from '../../../auth/auth-model';
import { ConfirmModalComponent } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'adapt-data-source-modal',
  templateUrl: './data-source-modal.component.html',
  styleUrls: ['./data-source-modal.component.scss'],
})
export class DataSourceModalComponent implements OnDestroy {
  PageMode = PageMode;
  ConnectionTestState = ConnectionTestState;
  @ViewChild(StepsIndicatorComponent) stepsIndicator!: StepsIndicatorComponent;
  @ViewChild(FullPageModalComponent) modal!: FullPageModalComponent;
  @ViewChild('confirmModal') confirmModal!: ModalComponent;

  @ViewChild(ConfirmModalComponent) confirmCloseModal!: ConfirmModalComponent;

  @Output() save = new EventEmitter<DataSource>();

  public editJustificationForm: FormGroup;
  public currentDataSource?: DataSource;
  public connectionTestState = ConnectionTestState.READY;
  public mode = PageMode.CREATE;
  public currentStep = 0;
  public opened = false;
  public subscriptions: Subscription[] = [];

  public editPassword = false;

  public createModeModalHeaders = [
    'Step 1: Define data source',
    'Step 2: Define soure connection',
    'Step 3: Data Source Summary',
  ];

  public editModeModalHeaders = [
    'Step 1: Define data source',
    'Step 2: Define soure connection',
    'Step 3: Impact analysis',
    'Step 4: Data Source Summary',
  ];

  public sourceTypeOptions = [{ label: 'Microsoft SQL Server', value: 'mssql' }];

  public refreshReasonOptions = [
    { value: 'quality', label: 'Data Quality' },
    { value: 'corrupted', label: 'Data/File is corrupted' },
    { value: 'update', label: 'Data needs to be updated' },
    { value: 'down', label: 'System is down / cannot collect for certain period of time' },
    { value: 'other', label: 'Other' },
  ];

  public dataSourceForm: FormGroup;

  @HostListener('window:beforeunload')
  beforeUnload(event: any) {
    if (this.dataSourceForm.dirty && this.user.idleState !== IdleStates.TIMED_OUT) {
      event.returnValue = 'You have unsaved changes!';
    }
  }

  public dataViews = this.data.getDataViews();
  public reports = this.data.getReports();

  constructor(
    private fb: FormBuilder,
    private idle: Idle,
    private user: UserService,
    private data: AdaptDataService,
    private alert: AlertService,
    private router: Router
  ) {
    this.dataSourceForm = this.fb.group({
      type: this.fb.control('mssql', [Validators.required]),
      name: this.fb.control('', [Validators.required]),
      description: this.fb.control('', [Validators.required]),
      address: this.fb.control('', [Validators.required]),
      port: this.fb.control('', [Validators.required]),
      database: this.fb.control('', [Validators.required]),
      username: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required]),
    });

    this.editJustificationForm = fb.group({
      reason: this.fb.control('', [Validators.required]),
      justification: this.fb.control(''),
    });

    const justificationReasonSub = this.reason.valueChanges.subscribe((val) => {
      val === 'other' ? this.justification.addValidators(Validators.required) : this.justification.clearValidators();
    });

    const timeOutSub = this.idle.onTimeout.subscribe(() => {
      if (!this.dataSourceForm.dirty) return;

      switch (this.mode) {
        case PageMode.CREATE: {
          this.user.userInactivitySave({
            action: 'CREATION',
            type: 'DataSource',
            body: { ...this.dataSourceForm.getRawValue(), page: this.stepsIndicator.step },
          });
          break;
        }
        case PageMode.EDIT: {
          this.user.userInactivitySave({
            action: 'EDIT',
            type: 'DataSource',
            body: {
              dataSourceID: this.currentDataSource?.dataSourceID,
              page: this.stepsIndicator.step,
              ...this.dataSourceForm.getRawValue(),
            },
          });
          break;
        }
      }
    });

    this.subscriptions.push(justificationReasonSub, timeOutSub);

    this.address.disable();
    this.port.disable();
    this.database.disable();
    this.username.disable();
    this.password.disable();
  }

  public open(
    dataSource?: DataSource | (DataSource & DataSourceConnectionInfo),
    mode = PageMode.CREATE,
    page = 0,
    dirty = false
  ) {
    this.opened = true;
    this.mode = mode;

    if (dataSource) {
      this.currentDataSource = dataSource;

      if (!dirty) {
        this.dataSourceForm.patchValue({
          name: dataSource?.name,
          description: dataSource?.description,
          address: dataSource.path,
          type: (dataSource as DataSourceConnectionInfo).type,
          port: (dataSource as DataSourceConnectionInfo).port,
          database: (dataSource as DataSourceConnectionInfo).database,
          username: (dataSource as DataSourceConnectionInfo).username,
          password: '',
        });
      }

      if (this.mode === PageMode.EDIT) {
        this.data.getDataSource(dataSource.dataSourceID as string, true).subscribe({
          next: (result) => {
            const connectionInfo = result as DataSourceConnectionInfo;
            const dataSource = result as DataSource;

            let patch = {
              type: connectionInfo.type,
              port: connectionInfo.port,
              database: connectionInfo.database,
              username: connectionInfo.username,
              password: '',
            };

            if (dirty) {
              patch = Object.assign(patch, {
                name: dataSource?.name,
                description: dataSource?.description,
                address: dataSource.path,
                password: '',
              });
            }

            this.dataSourceForm.patchValue(patch);
          },

          error: () => {
            this.alert.add({
              type: 'error',
              title: 'Failed to load data source',
              body: 'data source connection information failed to load, please try again later',
            });
            this.internalClose();
          },
        });
      }
    }

    this.modal.open();
    this.stepsIndicator.setStep(page);
    this.currentStep = page;

    this.handleCurrentStep();
  }

  private handleCurrentStep() {
    switch (this.currentStep) {
      case 1: {
        this.type.disable();
        this.name.disable();
        this.description.disable();

        this.dataSourceForm.markAsUntouched();

        this.address.enable();
        this.port.enable();
        this.database.enable();
        this.username.enable();
        this.password.enable();
        break;
      }
      case 2: {
        this.connectionTestState = ConnectionTestState.READY;
        break;
      }
    }
  }

  public reset() {
    this.currentStep = 0;
    this.dataSourceForm.reset(undefined, { emitEvent: false });
    this.dataSourceForm.markAsPristine();
    this.dataSourceForm.enable();
    this.address.disable();
    this.confirmCloseModal.close();
    this.confirmModal.close();
    this.port.disable();
    this.database.disable();
    this.username.disable();
    this.password.disable();
    this.connectionTestState = ConnectionTestState.READY;
    this.opened = false;
    this.editPassword = false;
  }

  public confirmEdits() {
    if (this.editJustificationForm.invalid) {
      return;
    }

    this.confirmModal.close();
    this.doSave(true, true);
  }

  public async doSave(close = false, confirmed = false) {
    if (this.dataSourceForm.invalid) return;

    if (!confirmed && this.mode === PageMode.EDIT) {
      this.confirmModal.open();
      return;
    }

    const body = {
      name: this.name.value,
      description: this.description.value,
      path: this.address.value,
      connectionInfo: {
        type: this.type.value,
        database: this.database.value,
        port: this.port.value,
        username: this.username.value,
        password: this.password.value,
      },
    };

    if (!this.password.value.length) {
      delete body.connectionInfo.password;
    }

    if (this.mode === PageMode.EDIT && this.currentDataSource) {
      const editedDataSource = await this.data.editDataSourcePromise(
        this.currentDataSource.dataSourceID as string,
        body
      );
      this.save.emit(editedDataSource);
    } else if (this.mode === PageMode.CREATE) {
      const newDataSource = await this.data.createDataSourcePromise(body);
      this.save.emit(newDataSource);
    }

    if (close) {
      this.modal.close();
    }

    this.reset();
  }

  public next() {
    this.dataSourceForm.markAllAsTouched();
    if (
      this.dataSourceForm.invalid ||
      (this.currentStep === 1 && this.editPassword && this.connectionTestState !== ConnectionTestState.SUCCESS)
    ) {
      return;
    }

    this.stepsIndicator.next();

    this.handleCurrentStep();
  }

  public previous() {
    this.stepsIndicator.prev();

    switch (this.currentStep) {
      case 0: {
        this.type.enable();
        this.name.enable();
        this.description.enable();

        this.address.disable();
        this.port.disable();
        this.database.disable();
        this.username.disable();
        this.password.disable();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  public internalClose() {
    this.modal.close();
    this.confirmCloseModal.close();
    this.reset();
  }

  public createDataView() {
    this.internalClose();
    this.router.navigate(['/admin', 'data-management'], {
      state: { dataSource: this.currentDataSource?.dataSourceID },
    });
  }

  public testConnection() {
    this.connectionTestState = ConnectionTestState.READY;
    this.data
      .testDBConnection({
        url: this.address.value,
        type: this.type?.value,
        port: this.port?.value,
        database: this.database.value,
        username: this.username.value,
        password: this.password.value,
      })
      .subscribe({
        next: () => (this.connectionTestState = ConnectionTestState.SUCCESS),
        error: () => (this.connectionTestState = ConnectionTestState.FAILED),
      });
  }

  public editPasswordToggle() {
    this.editPassword = !this.editPassword;

    this.editPassword ? this.password.enable() : this.password.disable();
  }

  get type() {
    return this.dataSourceForm.get('type') as FormControl;
  }

  get name() {
    return this.dataSourceForm.get('name') as FormControl;
  }

  get description() {
    return this.dataSourceForm.get('description') as FormControl;
  }

  get address() {
    return this.dataSourceForm.get('address') as FormControl;
  }

  get port() {
    return this.dataSourceForm.get('port') as FormControl;
  }

  get database() {
    return this.dataSourceForm.get('database') as FormControl;
  }

  get username() {
    return this.dataSourceForm.get('username') as FormControl;
  }

  get password() {
    return this.dataSourceForm.get('password') as FormControl;
  }

  get reason() {
    return this.editJustificationForm.get('reason') as FormControl;
  }

  get justification() {
    return this.editJustificationForm.get('justification') as FormControl;
  }
}

enum ConnectionTestState {
  READY,
  SUCCESS,
  FAILED,
}
