import {
  QueryDataSourceOutput,
  DataSource,
  SQLJoinType,
  NewDataSetInput,
  DataSourceType,
  hash,
  PageMode,
  DataSet,
  DataSetOperation,
} from '@adapt/types';
import { KeyValue } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl, ValidationErrors, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { comboBox } from '@uswds/uswds/js';
import { Observable, Subscription, tap, catchError, firstValueFrom, map, switchMap, zip, filter } from 'rxjs';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { AlertService } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/services/alert.service';
import { getFormErrors, uniqueNameValidator } from '../../../util';
import { UserService } from '../../../auth/services/user/user.service';
import { RoleService } from '../../../auth/services/role/role.service';
import { AdaptDataViewService } from '@adapt-apps/adapt-admin/src/app/services/adapt-data-view.service';

@Component({
  selector: 'adapt-data-set',
  standalone: false,
  templateUrl: './data-set.component.html',
  styleUrls: ['./data-set.component.scss'],
})
export class DataSetComponent implements OnDestroy {
  getFormErrors = getFormErrors;

  PageMode = PageMode;

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

  public mode = PageMode.VIEW;

  public $dataViewPreview?: Observable<any>;

  public showDataPreview = false;

  public dataWasSaved = false;

  private previewValidator = (array: AbstractControl): Promise<ValidationErrors | null> => {
    if (!array.dirty) {
      return Promise.resolve(null);
    }

    if (this.mode === PageMode.VIEW) {
      return Promise.resolve(null);
    }

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
    private adaptDataViewService: AdaptDataViewService,
    private route: ActivatedRoute,
    public role: RoleService,
    private alert: AlertService,
    private router: Router
  ) {
    this.dataSetFormGroup = this.fb.group({
      dataSetID: this.fb.control(''),
      name: this.fb.control('', [Validators.required]),
      description: this.fb.control('', []),
      // 'query': this.fb.control('', [Validators.required]),
      dataSources: this.fb.array([], [Validators.required], [this.previewValidator]),
      dataSourceRelationships: this.fb.array([]),
    });

    this.dataSourceList = this.data.getDataSources();

    const sourcesSub = this.dataSources.valueChanges.subscribe((sources) => {
      if (sources.length <= 1 || this.mode === PageMode.VIEW) {
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

      this.dataSourceRelationships.at(this.dataSourceRelationships.length - 1)?.disable(); // disable the last one in the list
    });

    if ('dataSource' in window.history.state) {
      const source = window.history.state['dataSource'];

      const sub = this.dataSourceList.subscribe((data) => {
        const found = data.find((ds) => ds.dataSourceID === source);

        this.addDataSource({ id: source, dataSource: found, query: '', table: '' });
      });

      this.subscriptions.push(sub);
    } else {
      this.addDataSource();
    }

    this.subscriptions.push(sourcesSub);

    const dataSub = this.route.data
      .pipe(
        tap((data: any) => {
          const url = this.route.snapshot?.url?.[1]?.path;

          if (!data['dataSetResolver']) {
            this.mode = PageMode.CREATE;
          } else if (url === 'edit') {
            this.mode = PageMode.EDIT;
          } else if (url === 'view') {
            this.mode = PageMode.VIEW;
          }

          this.name?.setAsyncValidators([uniqueNameValidator('DataSet', this.data, this.mode)]);
        }),
        filter((data: any) => !!data['dataSetResolver']),
        switchMap((data: any) => {
          const dataSet = data['dataSetResolver'] as any;

          return zip(
            dataSet.dataSources.map((source: any) =>
              this.data.getDataSource(source.dataSource).pipe(map((dbSource) => ({ ...source, dataSource: dbSource })))
            )
          ).pipe(map((result) => ({ ...dataSet, dataSources: result })));
        })
      )

      .subscribe((data) => {
        if (!data) {
          return;
        }
        this.dataSetFormGroup.patchValue(data);

        this.dataWasSaved = !!data.lastPull?.length;

        (this.dataSetFormGroup.get('dataSources') as FormArray).controls = [];

        for (const ds of data.dataSources) {
          const idx = this.addDataSource({
            dataSource: ds.dataSource,
            previewRan: true,
            table: { TABLE_SCHEMA: ds.schema, TABLE_NAME: ds.table },
          }) as number;

          const dataSource = this.dataSource(idx);
          this.dataSourceTableLookupPromises.set(
            ds.dataSource,
            this.getTablesAndViewsForSQLSource(ds.dataSource.dataSourceID)
          );

          if (this.mode !== PageMode.VIEW) {
            dataSource.get('table')?.enable();
            dataSource.get('query')?.disable();
          }

          const comboID = this.createComboID(ds.dataSource.dataSourceID, ds.table, ds.query);

          const promise = firstValueFrom(
            this.data.queryDataSource(ds.dataSource.dataSourceID, {
              query: `SELECT TOP 10 * FROM ${ds.schema}.${ds.table}`,
              limit: 10,
            })
          );

          this.dataSourceColumnPromises.set(
            comboID,
            promise.then((result) => Object.keys(result.result[0]))
          );
        }

        (this.dataSetFormGroup.get('dataSourceRelationships') as FormArray).controls = [];

        const relationships = data.dataSourceRelationships;

        for (let i = 0; i <= relationships.length; i++) {
          // i ===  relationships.length - 1 ? i - 1 : i
          const relationship = relationships[i === relationships.length ? i - 1 : i];

          let prev = 0;

          if (i === 1) {
            prev = i;
          } else {
            prev = Math.max(0, i - 1);
          }

          const ds = data.dataSources[prev];

          this.addDataSourceRelationship({ ...ds, ...relationship }, i === relationships.length);
        }

        if (this.mode === PageMode.VIEW) {
          this.dataSetFormGroup.disable();
        }
      });

    this.subscriptions.push(dataSub);
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

    const reducedForm: NewDataSetInput = this.reduceDataSetForm(formResult);

    this.submitLoading = true;
    this.data
      .createDataSet(reducedForm)
      .pipe(
        catchError(({ error }) => {
          this.alert.add({
            type: 'error',
            title: `Data View ${this.mode === PageMode.EDIT ? 'Save' : 'Creation'} failed`,
            body: error.err,
          });
          this.submitLoading = false;
          throw new Error();
        })
      )
      .subscribe((result) => {
        this.alert.add({
          type: 'success',
          title: `Data View ${this.mode === PageMode.EDIT ? 'Saved' : 'Created'}`,
          body: `Dataset ${this.name?.value} was created`,
        });
        this.submitLoading = false;
        this.router.navigate(['../', result.data.dataSetID], { relativeTo: this.route });
      });
  }

  private reduceDataSetForm(formResult: any): NewDataSetInput {
    return {
      name: formResult.name,
      dataSetID: formResult.dataSetID,
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
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  public addDataSourceRelationship({ dataSource, query, table, fromField, toField, joinType }: any, disabled = false) {
    const relation = this.fb.group({
      id: this.fb.control(crypto.randomUUID()),
      dataSourceName: this.fb.control(dataSource.name),
      dataSourceID: this.fb.control(dataSource.dataSourceID),
      dataSourceTable: this.fb.control(table),
      dataSourceQuery: this.fb.control(query),
      joinType: this.fb.control(joinType || '', [Validators.required]),
      fromField: this.fb.control(fromField || '', [Validators.required]),
      toField: this.fb.control(toField || '', [Validators.required]),
    });

    if (disabled) {
      relation.disable();
    }

    this.dataSourceRelationships.push(relation);
  }

  public addDataSource(value?: any) {
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

      if (!data?.dataSourceID || this.dataSourceTableLookupPromises.has(data.dataSourceID)) {
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

    if (value) {
      dataSource.patchValue(value);
    }

    this.subscriptions.push(sourceSub, tableSub);
    this.dataSources?.push(dataSource);

    return this.dataSources.length - 1;
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

    this.dataSourceRelationships.removeAt(Math.max(0, index - 1));
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
    let comboID = dataSource;

    if (table) {
      comboID = `${dataSource}_${table?.['TABLE_NAME'] || table}`;
    }

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

  public showDataViewPreview() {
    if (!this.$dataViewPreview) {
      const previewOperation: DataSetOperation = {
        id: `${this.dataSetID!.value}-preview`,
        function: 'SELECT',
        arguments: [
          {
            field: 'columns',
            value: ['*'],
            array: true,
          },
          {
            field: 'limit',
            type: 'number',
            value: '10',
          },
          {
            field: 'order',
            type: 'string',
          },
        ],
      };

      this.$dataViewPreview = this.data.getDataFromDataView(this.dataSetID!.value, '', [previewOperation], {
        required: false,
        sensitiveColumns: [],
        frequencyColumns: [],
      });
    }

    this.showDataPreview = !this.showDataPreview;
  }

  public startDataPull() {
    if (!this.dataSetID) {
      return;
    }
    this.adaptDataViewService.doDataPull(this.dataSetID.value).pipe(
        catchError((err) => {
          this.alert.add({
            type: 'error',
            title: 'Data Save Error',
            body: `Data Save for ${this.name?.value} failed to start: ${err}`,
          });
          return err;
        })
      )
      .subscribe(() => {
        this.alert.add({
          type: 'success',
          title: 'Data Save Started',
          body: `Data Save for ${this.name?.value} started. You will receive a notification when the save is complete.`,
        });
      });
  }

  // form fields

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

  public get dataSetID() {
    return this.dataSetFormGroup.get('dataSetID');
  }
}
