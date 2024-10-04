import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Observable, Subscription, catchError, finalize, firstValueFrom, map, switchMap, tap } from 'rxjs';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyValue } from '@angular/common';
import { AlertService } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/services/alert.service';
import { DataSource, DataSourceType, NewDataSetInput, QueryDataSourceOutput, SQLJoinType, hash } from '@adapt/types';
import * as USWDS from '@uswds/uswds/js';
import { getFormErrors, uniqueNameValidator } from '../../../util';
const { comboBox } = USWDS;

@Component({
  selector: 'adapt-create-dataset',
  templateUrl: './create-dataset.component.html',
  styleUrls: ['./create-dataset.component.scss'],
})
export class CreateDatasetComponent implements OnDestroy {
  public dataSetFormGroup: FormGroup;

  public dataSetQueryTestObservable?: Observable<QueryDataSourceOutput>;

  public querySucceeded = false;

  public testLoading = false;

  public submitLoading = false;

  public dataSourceList: Observable<DataSource[]>;

  public dataSourceTableLookupPromises = new Map<string, Promise<any[]>>();

  public dataSourcePreviewPromises = new Map<string, Promise<QueryDataSourceOutput>>();

  public dataSourceColumnPromises = new Map<string, Promise<string[]>>();

  public enterQuery = false;

  public subscriptions: Subscription[] = [];

  public dataSourceSQLQuery: boolean[] = [];

  public dataSourceShowPreview: boolean[] = [];

  public sqlJoins = [
    { label: 'Matched Pairs', value: SQLJoinType.INNER_JOIN },
    { label: 'All from the left, matched from the right', value: SQLJoinType.LEFT_JOIN },
    { label: 'All from the right, matched from the left', value: SQLJoinType.RIGHT_JOIN },
    { label: 'All from both, with NULLs if no match', value: SQLJoinType.FULL },
  ];

  private previewValidator = (array: AbstractControl): Promise<ValidationErrors | null> => {
    const promises = [];

    for (const control of (array as FormArray).controls) {
      const dataSource = control.get('dataSource')?.value;
      const table = control.get('table')?.value;
      const query = control.get('query')?.value;
      const previewRan = control.get('previewRan')?.value;

      if (previewRan === null) {
        promises.push(Promise.reject(null));
        break;
      }

      const comboID = this.createComboID(dataSource['dataSourceID'], table, query);

      const promise = this.dataSourcePreviewPromises.get(comboID)?.then((result) => {
        if (result.total <= 0) {
          return Promise.reject(null);
        }

        return result;
      });

      promises.push(promise);
    }

    return Promise.all(promises)
      .then(() => null)
      .catch(() => ({ missingPreviews: true }));
  };

  public originalOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  };

  constructor(
    private fb: FormBuilder,
    private data: AdaptDataService,
    private route: ActivatedRoute,
    private alert: AlertService,
    private router: Router
  ) {
    this.dataSetFormGroup = this.fb.group({
      name: this.fb.control('', [Validators.required], [uniqueNameValidator('DataSet', this.data)]),
      description: this.fb.control('', []),
      // 'query': this.fb.control('', [Validators.required]),
      dataSources: this.fb.array([], [Validators.required], [this.previewValidator]),
      dataSourceRelationships: this.fb.array([]),
    });

    if ('clone' in window.history.state) {
      this.dataSetFormGroup.patchValue(window.history.state['clone']);
    }

    this.dataSourceList = this.data.getDataSources();

    const sourcesSub = this.dataSources.valueChanges.subscribe((sources) => {
      if (sources.length <= 1) {
        return;
      }

      const toAdd = sources.filter(
        (source: any) =>
          this.dataSourceRelationships.controls.findIndex((ctl) => ctl.get('dataSource')?.value === source['id']) === -1
      );

      const toRemove = this.dataSourceRelationships.controls.filter(
        (ctl) => sources.findIndex((source: any) => ctl.get('dataSource')?.value === source['id']) === -1
      );

      toAdd.forEach((item: any) => this.addDataSourceRelationship(item));

      for (const remove of toRemove) {
        const idx = this.dataSourceRelationships.controls.findIndex(
          (ctl) => ctl.get('id')?.value === remove.get('id')?.value
        );

        this.dataSourceRelationships.removeAt(idx);
      }

      this.dataSourceRelationships.at(this.dataSourceRelationships.length - 1).disable(); // disable the last one in the list
    });

    this.addDataSource();

    this.subscriptions.push(sourcesSub);
  }

  public get name() {
    return this.dataSetFormGroup.get('name');
  }

  public get query() {
    return this.dataSetFormGroup.get('query');
  }

  public get description() {
    return this.dataSetFormGroup.get('description');
  }

  public get dataSources() {
    return this.dataSetFormGroup.get('dataSources') as FormArray;
  }

  public get dataSourceRelationships() {
    return this.dataSetFormGroup.get('dataSourceRelationships') as FormArray;
  }

  public dataSource(idx: number) {
    return this.dataSources.controls[idx];
  }

  public testQuery() {
    const query = this.query?.value;

    if (!query) {
      return;
    }

    this.testLoading = true;
    this.dataSetQueryTestObservable = this.data
      .queryDataSource(this.route.parent?.snapshot.params['dataSourceID'], { query })
      .pipe(
        tap(() => {
          this.testLoading = false;
          this.querySucceeded = true;
        })
      )
      .pipe(
        catchError(({ error }) => {
          this.querySucceeded = false;
          this.testLoading = false;
          this.alert.add({ type: 'error', title: 'Query Failed', body: error?.err?.originalError?.info?.message });
          return [];
        })
      );
  }

  public submit() {
    if (this.dataSetFormGroup.invalid) {
      return;
    }

    const formResult = this.dataSetFormGroup.value;

    const reducedForm: NewDataSetInput = {
      name: formResult.name,
      description: formResult.description,
      dataSources: formResult.dataSources.map((source: any) => ({
        dataSource: source.dataSource['dataSourceID'],
        table: source?.table?.['TABLE_NAME'],
        schema: source?.table?.['TABLE_SCHEMA'],
        query: source.query,
      })),
      dataSourceRelationships: (formResult.dataSourceRelationships || []).map((relationship: any) => ({
        joinType: relationship.joinType,
        fromField: relationship.fromField,
        toField: relationship.toField,
      })),
    };

    this.submitLoading = true;
    this.data
      .createDataSet(reducedForm)
      .pipe(
        catchError(({ error }) => {
          this.alert.add({ type: 'error', title: 'Data View Creation Failed', body: error.err });
          this.submitLoading = false;
          throw new Error();
        })
      )
      .subscribe((result) => {
        this.alert.add({
          type: 'success',
          title: 'Data View Created',
          body: `Dataset ${this.name?.value} was created`,
        });
        this.submitLoading = false;
        this.router.navigate(['../', result.data.dataSetID], { relativeTo: this.route });
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  public addDataSourceRelationship({ dataSource, query, table }: any) {
    const relation = this.fb.group({
      id: this.fb.control(crypto.randomUUID()),
      dataSourceName: this.fb.control(dataSource.name),
      dataSourceID: this.fb.control(dataSource.dataSourceID),
      dataSourceTable: this.fb.control(table),
      dataSourceQuery: this.fb.control(query),
      joinType: this.fb.control('', [Validators.required]),
      fromField: this.fb.control('', [Validators.required]),
      toField: this.fb.control('', [Validators.required]),
    });

    this.dataSourceRelationships.push(relation);
  }

  public addDataSource() {
    const dataSource = this.fb.group({
      id: this.fb.control(crypto.randomUUID(), [Validators.required]),
      dataSource: this.fb.control('', [Validators.required]),
      previewRan: this.fb.control(null),
      table: this.fb.control('', [Validators.required]),
      query: this.fb.control({ value: '', disabled: true }, [Validators.required]),
    });

    // register lookup?

    const sourceSub = dataSource.get('dataSource')!.valueChanges.subscribe((dtSource: any) => {
      const data = dtSource as DataSource;

      if (!data.dataSourceID || this.dataSourceTableLookupPromises.has(data.dataSourceID)) {
        return;
      }

      if (data.sourceType === DataSourceType.FILE) {
        // this.dataSourceTableLookupPromises.set(data.dataSourceID,  this.getFile(data.dataSourceID))
        dataSource.get('table')?.disable();
        dataSource.get('query')?.disable();
      } else if (data.sourceType === DataSourceType.SQL) {
        this.dataSourceTableLookupPromises.set(
          data.dataSourceID,
          this.getTablesAndViewsForSQLSource(data.dataSourceID)
        );
        dataSource.get('table')?.enable();
        dataSource.get('query')?.disable();
      }
    });

    const tableSub = dataSource.get('table')!.valueChanges.subscribe((table) => {
      dataSource.get('previewRan')?.setValue(null);

      const idx = this.dataSources.controls.findIndex((ctl) => ctl.get('id')?.value === dataSource.get('id')?.value);

      this.dataSourceShowPreview[idx] = false;
    });

    this.subscriptions.push(sourceSub, tableSub);
    this.dataSources?.push(dataSource);
  }

  private getTablesAndViewsForSQLSource(dataSource: string) {
    return firstValueFrom(
      this.data
        .queryDataSource(dataSource, {
          query:
            "SELECT TABLE_NAME, TABLE_SCHEMA FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' UNION SELECT TABLE_NAME, TABLE_SCHEMA FROM INFORMATION_SCHEMA.VIEWS",
        })
        .pipe(map((result) => result.result as string[]))
    );
  }

  private getFile(dataSource: string) {
    return firstValueFrom(this.data.queryDataSource(dataSource, { limit: 10 }));
  }

  public removeDataSource(index: number) {
    this.dataSources.removeAt(index);
    this.dataSourceShowPreview[index] = false;
  }

  public reset(index: number) {
    const control = this.dataSources.at(index);

    const id = control.get('dataSource')?.value;

    if (id) {
      this.dataSourceTableLookupPromises.delete(id);
    }

    control.reset();
    setTimeout(() => comboBox.on(document.body), 1000);
  }

  public hidePreview(index: number) {
    this.dataSourceShowPreview[index] = false;
  }

  public getColumns(control: AbstractControl) {
    const dataSource = control.get('dataSourceID')?.value;
    const table = control.get('dataSourceTable')?.value ?? '';
    const query = control.get('dataSourceQuery')?.value ?? '';
    const comboID = this.createComboID(dataSource, table, query);

    return this.dataSourceColumnPromises.get(comboID);
  }

  public preview(index: number) {
    const control = this.dataSources.at(index);

    this.dataSourceShowPreview[index] = true;

    const dataSource = control.get('dataSource')?.value;
    const table = control.get('table')?.value;
    const query = control.get('query')?.value;

    const comboID = this.createComboID(dataSource['dataSourceID'], table, query);

    if (!query && table) {
      const promise = firstValueFrom(
        this.data.queryDataSource(dataSource.dataSourceID, {
          query: `SELECT TOP 10 * FROM ${table['TABLE_SCHEMA']}.${table['TABLE_NAME']}`,
          limit: 10,
        })
      ).then((result) => {
        control.get('previewRan')?.setValue(true);
        control.updateValueAndValidity();
        return result;
      });

      this.dataSourcePreviewPromises.set(comboID, promise);

      this.dataSourceColumnPromises.set(
        comboID,
        promise.then((result) => Object.keys(result.result[0]))
      );
    }

    if (!table && query) {
      const promise = firstValueFrom(this.data.queryDataSource(dataSource.dataSourceID, { query, limit: 5 })).then(
        (result) => {
          control.get('previewRan')?.setValue(true);
          control.updateValueAndValidity();
          return result;
        }
      );

      this.dataSourcePreviewPromises.set(comboID, promise);

      this.dataSourceColumnPromises.set(
        comboID,
        promise.then((result) => Object.keys(result.result[0]))
      );
    }

    if (!table && !query) {
      const promise = this.getFile(dataSource.dataSourceID)!.then((result) => {
        control.get('previewRan')?.setValue(true);
        control.updateValueAndValidity();
        return result;
      }) as Promise<any>;

      this.dataSourcePreviewPromises.set(comboID, promise!);

      this.dataSourceColumnPromises.set(
        comboID,
        promise.then((result) => Object.keys(result.result[0]))
      );
    }
  }

  public getPreviewPromise(index: number) {
    const control = this.dataSources.at(index);

    const dataSource = control.get('dataSource')?.value;
    const table = control.get('table')?.value;
    const query = control.get('query')?.value;

    const comboID = this.createComboID(dataSource['dataSourceID'], table, query);

    return this.dataSourcePreviewPromises.get(comboID);
  }

  private createComboID(dataSource: any, table: any, query: any) {
    let comboID = `${dataSource}_${table?.['TABLE_NAME'] || table}`;

    if (query) {
      comboID = `${dataSource}_${hash(query)}`;
    }
    return comboID;
  }

  public sqlQueryMode(index: number) {
    this.dataSourceSQLQuery[index] = true;
    const control = this.dataSources.at(index);
    control.get('table')?.reset();
    control.get('query')?.enable();
    control.get('table')?.disable();
  }

  public listMode(index: number) {
    this.dataSourceSQLQuery[index] = false;
    const control = this.dataSources.at(index);
    control.get('query')?.reset();
    control.get('query')?.disable();
    control.get('table')?.enable();
  }

  //DEBUG
}
