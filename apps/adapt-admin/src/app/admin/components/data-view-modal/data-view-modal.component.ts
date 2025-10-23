import {
  Component,
  HostListener,
  OnDestroy,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  computed, effect, Signal,
} from '@angular/core';
import { FullPageModalComponent } from '../full-page-modal/full-page-modal.component';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  catchError,
  combineLatest,
  debounceTime,
  filter,
  firstValueFrom,
  last,
  map,
  Observable,
  of,
  pairwise,
  repeat,
  skipWhile,
  startWith,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {
  DataSetQueueStatus,
  DataSource,
  DataView,
  IDataCollectionTemplate,
  IReport,
  NewDataViewInput,
  PageMode,
  sleep,
} from '@adapt/types';
import { StepsIndicatorComponent } from '../steps-indicator/steps-indicator.component';
import { uniqueNameValidator } from '../../../util';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { FileValidation, validate } from '@adapt/validation';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { ChangeDetectorRef, AfterContentChecked } from '@angular/core';

import * as xlsx from 'xlsx';
import { ModalComponent, AlertService } from '@adapt/adapt-shared-component-lib';
import { Idle } from '@ng-idle/core';
import { UserService } from '../../../auth/services/user/user.service';
import { ConfirmModalComponent } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/components/confirm-modal/confirm-modal.component';
import { LocationStrategy } from '@angular/common';
import { PagesContentService } from '@adapt-apps/adapt-admin/src/app/auth/services/content/pages-content.service';
import {
  PageSectionContentText,
  PageContentText,
  SectionQuestionContentText,
} from '@adapt-apps/adapt-admin/src/app/admin/models/admin-content-text.model';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'adapt-data-view-modal',
  templateUrl: './data-view-modal.component.html',
  styleUrls: ['./data-view-modal.component.scss'],
})
export class DataViewModalComponent implements OnInit, OnDestroy, AfterContentChecked {
  PageMode = PageMode;
  FileControlState = FileControlState;
  //getFormErrors = getFormErrors;
  Validators = Validators;

  @ViewChild(FullPageModalComponent) modal!: FullPageModalComponent;
  @ViewChild('previewModal') previewModal!: ModalComponent;
  @ViewChild('confirmModal') confirmModal!: ModalComponent;
  @ViewChild('duplicateModal') duplicateModal!: ModalComponent;
  @ViewChild(ConfirmModalComponent) confirmCloseModal!: ConfirmModalComponent;

  @ViewChild(StepsIndicatorComponent) stepsIndicator!: StepsIndicatorComponent;

  @Output() closed = new EventEmitter<DataView | undefined>();

  public baseDataViewForm: FormGroup;

  public currentStep = 0;
  public saving = false;
  public saved = false;
  public showPreviewModal = false;

  public opened = false;

  public duplicate?: DataView;
  public duplicateTemplate?: IDataCollectionTemplate;

  public currentDataView?: DataView;

  public dataViews: Observable<DataView[]>;
  public dataSources: Observable<DataSource[]>;
  public reports: Observable<IReport[]>;

  public mode = PageMode.CREATE;

  public fileControlStates: FileControlState[] = [];
  public fileUploadPercentage: number[] = [];

  // public modalHeaders = [
  //   'Step 1: Define data collection',
  //   'Step 2: Load data',
  //   'Step 3: Data collection summary',
  //   'Step 4: Name your data collection',
  // ];

  public refreshReasonOptions = [
    { value: 'quality', label: 'Data Quality' },
    { value: 'corrupted', label: 'Data/File is corrupted' },
    { value: 'update', label: 'Data needs to be updated' },
    { value: 'down', label: 'System is down / cannot collect for certain period of time' },
    { value: 'other', label: 'Other' },
  ];

  public typeOptions: Observable<{label: any, value: any}[]>; //  = this.data.getTemplates('DataCollection').pipe(map((result => result.map((temp: any) => ({label: temp.name,  value: temp.id.replace("ID#", "")})))))

  //
  // [
  //   // {value: '', label: 'Select'},
  //   { value: 'childCount', label: 'IDEA Child Count and Educational Environments' },
  //   { value: 'childCountAndSettings', label: 'IDEA Child Count and Settings' },
  //   { value: 'assessment', label: 'IDEA Assessment' },
  //   { value: 'exiting', label: 'Children with Disabilities (IDEA) Exiting' },
  //   { value: 'exitingPartC', label: 'Infants and Toddlers with Disabilities (IDEA Part C) Exiting' },\
  //   // { value: 'disputeResolution', label: 'IDEA Dispute Resolution Part B' },
  // ];

  public sourceOptions = [
    { value: 'collection', label: 'By uploading data files' },
    { value: 'database', label: 'By connecting to a database' },
  ];

  public sourceValueNameMap: Record<string, string> = {
    collection: 'by File Upload',
    database: 'by Database connection',
  };

  public changes: Record<string, { label: string; previousValue: string; changedValue: string }> = {};

  public currentTemplate?: IDataCollectionTemplate;

  public currentPreview?: Observable<any[]>;

  public currentPreviewIndex = -1;

  private subscriptions: Subscription[] = [];

  private instanceSubscriptions: Subscription[] = [];

  public editJustificationForm: FormGroup;

  public currentFileRequests: Subscription[][] = [];

  public reloadData = false;

  // Input signal
  $pageContentSignal: Signal<PageContentText|null>; // = this.pagesContentService.getPageContentSignal('data', 'en');
  //$pageSectionsSignal: Signal<PageSectionContentText[]|undefined>;  //  = computed(() => this.$pageContentSignal()?.sections);
  pageContent: PageContentText|null;
  pageSections:PageSectionContentText[]|undefined;
  pageContentLoaded: boolean = false;


  @HostListener('window:beforeunload')
  beforeUnload(event: any) {
    if (this.baseDataViewForm.dirty) {
      event.returnValue = 'You have unsaved changes!';
    }
  }

  constructor(
    private logger: NGXLogger,
    private fb: FormBuilder,
    private data: AdaptDataService,
    private location: LocationStrategy,
    private alert: AlertService,
    private idle: Idle,
    private user: UserService,
    public pagesContentService: PagesContentService,
    private cdRef: ChangeDetectorRef
  ) {

    this.logger.debug('Inside data-view-modal component constructor');

    this.initializeComponentSignals();
  }

  ngOnInit() {
    this.logger.debug('Inside data-view-modal component ngOnInit');

    this.typeOptions = this.data.getTemplates('DataCollection').pipe(map((result => result.map((temp: any) => ({label: temp.name,  value: temp.id.replace("ID#", "")})))))

    this.createDataViewForm();

    this.location.onPopState((event) => {
      if (event.type === 'popstate') this.internalClose();
    });

    this.dataSources = this.data.getDataSources();
    this.dataViews = this.data.getDataViews();
    this.reports = this.data.getReports();

    this.initializeFormValueChangeListeners();
  }

  private createDataViewForm() {
    this.logger.debug('Inside data-view-modal component createDataViewForm');

    this.baseDataViewForm = this.fb.group({
      type: this.fb.control('', [Validators.required]),
      source: this.fb.control('collection', [Validators.required]),
      database: this.fb.control('', [Validators.required]),
      typeFields: this.fb.group({}),
      files: this.fb.array([]),
      name: this.fb.control('', [Validators.required]),
      description: this.fb.control('', [Validators.required]),
    });

    this.name.setAsyncValidators([uniqueNameValidator('DataView', this.data, this.mode)]);
    this.name.disable({ emitEvent: false });
    this.description.disable({ emitEvent: false });
    this.database.disable({ emitEvent: false });

    this.editJustificationForm = this.fb.group({
      reason: this.fb.control('', [Validators.required]),
      justification: this.fb.control(''),
    });
  }

  private initializeFormValueChangeListeners() {
    this.logger.debug('Inside data-view-modal initializeFormValueChangeListeners');

    const typeChanges = this.type.valueChanges
      .pipe(startWith(this.type.value), pairwise())
      .subscribe(this.onTypeChange.bind(this));

    const sourceSub = this.source.valueChanges.subscribe((source) => {
      if (source === 'database') {
        this.database.enable();
        this.files.disable();
        return;
      }

      this.database.disable();
      // this.files.enable();
    });

    /*
    The switchMap operator in Angular, part of the RxJS library, is a powerful higher-order observable operator used for transforming a stream of values from one observable into a stream from another, with a key feature: cancellation of previous inner observables.

    How it Works:
      - Source Observable Emission: When the source observable (the one switchMap is piped to) emits a value, switchMap takes that value and uses it to create a new "inner" observable.
      - Subscription and Emission: switchMap then subscribes to this newly created inner observable and starts emitting its values.
      - Cancellation on New Emission: If the source observable emits another value before the current inner observable completes, switchMap automatically unsubscribes from the previous inner observable and subscribes to a new inner observable created from the latest source value. This effectively cancels any ongoing operations from the previous inner observable.

    Key Characteristics and Use Cases:
      - Cancellation Effect: This is the defining characteristic of switchMap. It prioritizes the latest emission from the source observable, abandoning any ongoing work from previous inner observables. This is crucial for scenarios where only the most recent operation matters.

     */
    const duplicateCheckSub = this.typeFields.valueChanges.pipe(switchMap((value) =>
          this.dataViews.pipe(
            switchMap((views) => {
              const dataView = views.find((view) => {
                const fields = Object.keys(value);

                const condition =
                  view.dataViewID !== this.currentDataView?.dataViewID &&
                  this.source.value === view.dataViewType &&
                  view.data.id === this.currentTemplate?.id &&
                  fields.every((field) => view.data.fields.some((viewfield) => viewfield.value === value[field]));

                if (this.source.value === 'database') {
                  return condition && this.database.value === view.data.dataSource;
                }

                return condition;
              });

              if (!dataView) {
                return of([undefined, undefined]);
              }

              return this.data
                .getDataCollectionTemplate(dataView.data.id)
                .pipe(map((template) => [dataView, template]));
            })
          )
        )
      )
      .subscribe(([dataView, template]: any[]) => {
        this.duplicate = dataView;
        this.duplicateTemplate = template;
      });

    const justificationReasonSub = this.reason.valueChanges.subscribe((val) => {
      val === 'other' ? this.justification.addValidators(Validators.required) : this.justification.clearValidators();
    });

    const timeOutSub = this.idle.onTimeout.subscribe(() => {
      if (!this.baseDataViewForm.dirty) return;

      const data = this.getSaveInput();

      switch (this.mode) {
        case PageMode.CREATE: {
          this.user.userInactivitySave({
            action: 'CREATION',
            type: 'DataView',
            body: { ...data, page: this.stepsIndicator.step },
          });
          break;
        }
        case PageMode.EDIT: {
          this.user.userInactivitySave({
            action: 'EDIT',
            type: 'DataView',
            body: { dataViewID: this.currentDataView?.dataViewID, page: this.stepsIndicator.step, ...data },
          });
          break;
        }
      }
    });

    this.subscriptions.push(typeChanges, sourceSub, duplicateCheckSub, justificationReasonSub, timeOutSub);
  }

  private initializeComponentSignals() {
    this.logger.debug('Inside data-view-modal initializeComponentSignals');

    this.$pageContentSignal = this.pagesContentService.getPageContentSignal('data', 'en');
    //this.$pageSectionsSignal = computed(() => this.$pageContentSignal()?.sections);

    // after we got a signal that the pageContent was loaded
    effect(() => {

      this.logger.debug('$pageContentSignal retrieved');
      this.pageContent = this.$pageContentSignal();

      this.logger.debug('pageContent: ', this.pageContent);

      if (this.pageContent){

        this.logger.debug('Have page content');

        this.pageSections = this.pageContent.sections;

        if (!this.pageContent.title){
          this.logger.error('Invalid page title');
        }

        if (!(this.pageContent.sections && this.pageContent?.sections?.length > 0)){
          this.logger.error('Invalid page sections');
        }
        else {
          this.logger.debug('Have page sections');
          this.pageContentLoaded = true;
        }
      }
      else {
        this.logger.debug('NO page content');
        this.pageContentLoaded = false;
      }

    });

    // after we got a signal that the pageSections was updated
    // effect(() => {
    //
    //   this.logger.debug('$pageSectionsSignal retrieved');
    //
    //   this.pageSections = this.$pageSectionsSignal();
    //   //this.pageContentLoaded = true;
    //
    //   this.logger.debug('pageSections: ', this.pageSections);
    // });
  }
  public async onFileChange(index: number, file: File | null) {
    this.fileUploadPercentage[index] = 0;

    if (file === undefined) {
      this.currentFileRequests[index]?.forEach((sub) => sub.unsubscribe());
      this.currentFileRequests[index] = [];
    }

    if (file === null) {
      return;
    }

    this.fileControlStates[index] = file === undefined ? FileControlState.EMPTY : FileControlState.UPLOAD_PREP;
    /*
        Logic here is to implicitly create a data view whenever a file upload to started then create s3 upload url to the staging area.
        Allows the user to come back and finish the process later if they need / want.
      */

    if (!this.currentDataView) {
      await this.initDataView();
    }
    console.log('currentDataView: ', this.currentDataView);

    this.currentDataView!.data.files[index].location = file?.name ?? '';

    if (!(file instanceof File) || this.files.controls[index].invalid) {
      return;
    }

    const fileID = this.currentTemplate?.files[index].id ?? crypto.randomUUID();

    const presignedURL = await this.data.getDataViewUploadURLPromise({
      dataViewID: this.currentDataView!.dataViewID,
      fileID,
      filename: file.name,
    });

    this.fileControlStates[index] = FileControlState.UPLOADING;
    const request = this.handleFileUploadAndEvents(presignedURL, file, index).subscribe({
      next: async () => {
        this.saved = false;
        this.saving = true;

        const editSub = this.data.editDataView(this.currentDataView!, 'implicit file change upload').subscribe({
          next: async () => {
            this.saved = true;
            this.saving = false;

            this.fileControlStates[index] = FileControlState.VALIDATION;

            await sleep(3000); // ensure the s3 event updates the object

            this.handleServerFileValidation(index);
          },
        });

        this.currentFileRequests[index].push(editSub);
      },
      error: () => {
        this.fileControlStates[index] = FileControlState.UPLOAD_FAILED;
      },
    });

    if (!this.currentFileRequests[index]?.length) this.currentFileRequests[index] = [];

    this.currentFileRequests[index].push(request);
  }

  private async initDataView() {
    this.saved = false;
    this.saving = true;
    // create the data view?
    const defaultInput: NewDataViewInput = this.getSaveInput();

    this.currentDataView = await firstValueFrom(this.data.createDataView(defaultInput));
    this.saving = false;
    this.saved = true;
  }

  private getSaveInput() {
    const defaultInput: NewDataViewInput = {
      name: this.name.value || (this.currentTemplate?.name ?? ''),
      description: this.description.value || (this.currentTemplate?.dataViewDescription ?? ''),
      dataViewType: this.source.value || 'collection',
      data: {
        id: crypto.randomUUID(),
        dataSource: this.database.value,
        fields: [],
        files: [],
      },
    };

    if (this.currentTemplate) {
      for (const [index, field] of Object.keys(this.typeFields.controls).entries()) {

        const typeField = this.typeFields.get(field);

        const templateField = this.currentTemplate.fields[index].options.find(option => option.value === typeField?.value)

        defaultInput.data.fields.push({ id: field, label: templateField.label ?? '', value: typeField?.value });
      }

      for (const [index, file] of this.currentTemplate.files.entries()) {
        defaultInput.data.files.push({ id: file.id, database: file.database, dataParse: file.dataParse, location: '' });
      }

      defaultInput.data.id = this.currentTemplate.id.split('#')[1];
    }
    return defaultInput;
  }

  private handleServerFileValidation(index: number) {
    if (this.fileControlStates[index] === FileControlState.EMPTY) return;

    return this.data
      .validateFile(this.currentDataView!.dataViewID, this.currentDataView!.data.files[index].id)
      .pipe(
        repeat({ delay: 2000 }),
        skipWhile((res) => res.status === 202),
        take(1)
      )
      .subscribe({
        next: () => {
          this.fileControlStates[index] = FileControlState.VALID;
        },
        error: ({ error: { err } }: HttpErrorResponse) => {
          this.files.controls[index].setErrors({ validateFiles: err });
        },
      });
  }

  private handleFileUploadAndEvents(presignedURL: string, file: File, index: number) {
    return this.data.uploadFile(presignedURL, file).pipe(
      map((event) => this.getEventMessage(event)),
      tap((message) => (this.fileUploadPercentage[index] = message)),
      last()
    );
  }

  public async onTypeChange([prev, next]: [string, string]) {

    this.logger.debug('Inside data-view-modal component onTypeChange, prev: ', prev, ', next: ', next);
    const { value } = this.type;

    if (prev !== next) {
      this.logger.debug('remove all type fields controls');
      Object.keys(this.typeFields.controls).forEach((key) => this.typeFields.removeControl(key));

      this.files.clear({ emitEvent: false });
    }

    //dev-AdaptTemplates
    this.currentTemplate = await firstValueFrom(this.data.getTemplate('DataCollection', value));

    this.logger.debug('currentTemplate: ', this.currentTemplate);

    // need to remove the reporting level field from the template to support ticket WEISS-1343
    this.currentTemplate!.fields = this.currentTemplate!.fields.filter((field) => field.id !== 'reportingLevel');

    for (const [index, file] of this.currentTemplate!.files.entries()) {
      if (this.fileControlStates[index] >= 0) continue;
      this.fileControlStates[index] = FileControlState.EMPTY;
    }

    this.setName();
    this.description.setValue(this.currentTemplate?.dataViewDescription);

    for (const field of this.currentTemplate!.fields) {
      const control = this.fb.control(field.default);

      if (field.required) {
        control.addValidators(Validators.required);
      }

      this.logger.debug('add type field control: ', field.id);
      this.typeFields.addControl(field.id, control, { emitEvent: false });
    }

    for (const [index, file] of this.currentTemplate!.files.entries()) {
      const control = this.fb.control(null, [Validators.required], [this.validateFile(index)]);

      this.files.push(control, { emitEvent: false });

      const sub = combineLatest([control.valueChanges, control.statusChanges])
        .pipe(
          filter(([value, status]) => status === 'VALID'),
          debounceTime(300),
          map(([value, status]) => value)
        )
        .subscribe(this.onFileChange.bind(this, index));

      this.instanceSubscriptions.push(sub);
    }

    this.files.disable({ emitEvent: false });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.instanceSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngAfterContentChecked() {
    this.cdRef.detectChanges();
  }

  public next() {
    this.logger.debug('Inside data-view-modal component next');

    this.baseDataViewForm.markAllAsTouched();

    // based on the current step do something
    this.handleCurrentStepNext();

    this.stepsIndicator.next();
  }

  private handleCurrentStepNext(delta = 0) {
    switch (this.currentStep) {
      case 0 + delta: {
        // LOAD is next

        if (this.baseDataViewForm.invalid) return;

        if (this.source.value === 'collection') {
          this.files.enable({ emitEvent: false });
          this.files.markAsUntouched();
        }

        break;
      }
      case 2 + delta: {
        if (!this.name.dirty && this.mode === PageMode.CREATE) {
          this.setName();
        }

        this.name.enable();
        this.description.enable();
        break;
      }
    }
  }

  private setName() {
    this.name.setValue(this.currentTemplate?.name);
    for (const value of Object.values(this.typeFields.value)) {
      if (!(value as string)?.length) continue;
      this.name.setValue(this.name.value + ` - ${value}`);
    }



    this.name.setValue(
      this.name.value +
        ` - ${this.pageContent?.actions?.[this.source.value] ?? this.sourceValueNameMap[this.source.value]} - ${new Date().toLocaleDateString(undefined, {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        })}`
    );
  }

  public previous() {
    this.logger.debug('Inside data-view-modal component previous');

    this.stepsIndicator.prev();

    // based on the step manage the form controls
    switch (this.currentStep) {
      case 0: {
        // DETAIL
        this.files.disable();
        break;
      }
      case 1: {
        // LOAD
        if (this.source.value === 'collection') {
          this.files.enable({ emitEvent: false });
          this.files.markAsUntouched();
        }
        break;
      }
      case 2: {
        this.name.disable({ emitEvent: false });
        this.description.disable({ emitEvent: false });
        break;
      }
    }
  }

  public showFileAccordion(index: number) {
    const fileTemplate = this.currentTemplate?.files[index];

    if (!fileTemplate?.conditions?.length) {
      return true;
    }

    const conditions = fileTemplate.conditions;

    let result = true;

    for (const condition of conditions) {
      const fieldValue = this.typeFields.get(condition.field)?.value;

      switch (condition.operation) {
        case 'neq': {
          if (fieldValue === condition.value) result = false;
          break;
        }
        case 'eq': {
          if (fieldValue !== condition.value) result = false;
          break;
        }
        case 'contains': {
          if ((condition.value as string[]).every((val) => val !== fieldValue)) result = false;
          break;
        }
      }
    }

    if (!result) {
      const fileField = this.files.controls[index];
      fileField.disable();
    }

    return result;
  }

  public async doSave(close = false, confirmed = false, startDataPull = false) {
    if (!confirmed && this.mode === PageMode.EDIT && Object.keys(this.changes).length > 0) {
      this.confirmModal.open();
      return;
    }

    if (this.name.invalid || this.description.invalid) {
      return;
    }

    this.saved = false;
    this.saving = true;

    if (!this.currentDataView) {
      await this.initDataView();
    } else {
      this.currentDataView!.name = this.name.value;
      this.currentDataView!.description = this.description.value;

      this.currentDataView = await this.data.editDataViewPromise(
        this.currentDataView!,
        `${this.reason.value} : ${this.justification.value}`
      );
    }

    this.saving = false;
    this.saved = true;

    if(startDataPull && this.currentDataView?.status !== DataSetQueueStatus.MISSING_DATA && !this.baseDataViewForm.invalid){

    const name = this.name.value;

    this.data
      .doDataPull(this.currentDataView!.dataViewID)
      .pipe(
        catchError((err) => {
          this.alert.add({
            type: 'error',
            title: 'Data View Save Failed',
            body: `Data View Save for ${name} failed: ${err}`,
          });
          return err;
        })
      )
      .subscribe(() => {
        this.alert.add({
          type: 'success',
          title: 'Data View Save Complete',
          body: `Data View ${name} has been saved successfully. You will receive a notification when data view is ready for use.`,
        });
      });

    }

    if (close) {
      this.closed.emit(this.currentDataView);
      this.modal.close();
      this.reset();
      this.opened = false;
    }
  }

  public async internalClose(cancel = false, globalClose = false) {
    this.logger.debug('Inside data-view-modal component internalClose');
    if (this.baseDataViewForm.dirty && !globalClose) {
      return this.confirmCloseModal.open();
    } else {
      this.modal.close();
    }

    if (cancel && this.currentDataView) await firstValueFrom(this.data.deleteDataView(this.currentDataView.dataViewID));

    this.reset();
  }

  public reset() {
    this.currentPreviewIndex = -1;
    this.currentStep = 0;
    this.saving = false;
    this.saved = false;
    this.showPreviewModal = false;
    this.currentDataView = undefined;
    this.currentTemplate = undefined;
    this.currentPreview = undefined;
    this.baseDataViewForm.reset(undefined, { emitEvent: false });
    this.files.disable();
    this.files.clear();
    this.name.disable();
    this.description.disable();
    this.database.disable();
    this.baseDataViewForm.markAsPristine();
    this.confirmCloseModal.close();
    this.editJustificationForm.reset();
    this.editJustificationForm.markAsPristine();
    this.mode = PageMode.CREATE;
    this.fileControlStates = [];
    this.confirmModal.close();
    this.changes = {};
    this.instanceSubscriptions.forEach((sub) => sub.unsubscribe());
    this.name.setAsyncValidators([uniqueNameValidator('DataView', this.data, this.mode)]);

    //   this.ngOnDestroy()
  }

  public confirmEdits() {
    if (this.editJustificationForm.invalid) {
      return;
    }

    const hasFileChanges = Object.keys(this.changes).findIndex((change) => change.startsWith('files-')) !== -1;

    this.confirmModal.close();
    this.doSave(true, true, hasFileChanges || this.reloadData);
  }

  reportingYear: string;

  public async open(dataView?: DataView, viewMode = false, pageIndex = 0, dataSource = '') {
    this.logger.debug('Inside data-view-modal component open');
    if (!this.modal) return;


    this.opened = true;

    if (dataView) {
      this.mode = viewMode ? PageMode.VIEW : PageMode.EDIT;

      this.name.setAsyncValidators([uniqueNameValidator('DataView', this.data, this.mode)]);

      this.currentDataView = dataView;

      // Set reporting year as bespoke value to fit properly in expected template
      if (this.currentDataView.data.fields) {
        this.currentDataView.data.fields.forEach((field) => {
          if (field.id === 'reportingYear') {
            this.reportingYear = field.value;
          }
        });
      }

      if (this.currentDataView.dataViewType === 'collection') {
        for (const [index, file] of this.currentDataView.data.files.entries()) {
          this.fileControlStates[index] = !file.location.length ? FileControlState.EMPTY : FileControlState.VALID;
        }
      }

      this.type.setValue(dataView?.data?.id || (dataView as any).type);

      await sleep(100);

      const patchedValue = {
        source: dataView.dataViewType,
        database: dataView.data.dataSource,
        files: dataView.data.files.map((file) => new File([], file.location)),
        typeFields: dataView.data.fields.reduce((accum, val) => Object.assign(accum, { [val.id]: val.value, label: val.label }), {}),
        name: dataView.name,
        description: dataView.description,
      };

      this.baseDataViewForm.patchValue(patchedValue, { emitEvent: false });

      const editModeGeneralChangesSub = this.baseDataViewForm.valueChanges
        .pipe(debounceTime(250), startWith(patchedValue), pairwise())
        .subscribe(this.onEditModeChanges.bind(this));

      this.instanceSubscriptions.push(editModeGeneralChangesSub);
    }

    // this.currentStep = pageIndex;

    this.modal.open();
    this.stepsIndicator.setStep(pageIndex);
    this.reloadData = pageIndex === 1;


    this.handleCurrentStepNext(1);

    requestAnimationFrame(() => {
      this.source.setValue(dataView?.dataViewType || 'database');

    })



  }

  public close() {
    this.logger.debug('Inside data-view-modal component close');
    if (!this.modal) return;
    this.modal.close();
    this.opened = false;
  }

  public async showPreview(index: number) {
    this.logger.debug('Inside data-view-modal component showPreview, index: ', index);

    if (!this.currentDataView) {
      await this.initDataView();
    }

    this.currentPreviewIndex = index;

    this.currentPreview = this.data.previewData(this.currentDataView!.dataViewID) as Observable<any[]>;

    this.previewModal.open();
  }

  private validateFile(index: number, validationCache: Map<string, Promise<FileValidation>> = new Map()) {
    return async (control: AbstractControl): Promise<any> => {
      // return null

      const file = control.value as File;

      const collection = this.type.value;

      if (!collection) {
        return null;
      }

      if (!(file instanceof File)) {
        return null;
      }

      const fileSpec = this.currentTemplate?.files[index].validation;

      if (!fileSpec) {
        return null;
      }

      if (!validationCache.has(fileSpec)) {
        validationCache.set(fileSpec, firstValueFrom(this.data.getValidationJSON(fileSpec)));
      }

      const validationJson = (await validationCache.get(fileSpec)) as FileValidation;

      const validationErrors: any = (await this.fileValidate(file, validationJson)) as any[];

      if (validationErrors?.length) {
        return { validateFiles: validationErrors };
      }

      return null;
    };
  }

  public getDetailLabel(content: SectionQuestionContentText[] = [], id?: string) {
    return content.find(question => question.id === id)?.label;
  }

  private getEventMessage(event: HttpEvent<any>) {
    switch (event.type) {
      case HttpEventType.UploadProgress: {
        const percentDone = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
        return percentDone;
      }
      case HttpEventType.Response: {
        return 100;
      }
    }

    return 0;
  }

  private fileValidate(file: File, validationJson: FileValidation) {
    if (this.mode !== PageMode.CREATE) return null;
    const fileReader = new FileReader();
    fileReader.readAsText(file);

    return new Promise((resolve, reject) => {
      fileReader.onload = (e: any) => {
        const bufferArray = e?.target.result;

        let toValidate: string | xlsx.WorkBook = '';

        if (file.name.endsWith('.html')) {
          toValidate = bufferArray;
        } else if (file.name.endsWith('.csv')) {
          toValidate = xlsx.read(bufferArray, { type: 'string' });
        }

        const errors = validate(toValidate, validationJson, this.typeFields.getRawValue());

        if (errors.length) {
          return resolve(errors);
        }

        resolve([]);
      };

      fileReader.onerror = reject;
    });
  }

  public getPreviewHeaders(index = this.currentPreviewIndex) {
    if (this.source.value === 'database') {
      return [];
    }

    return this.currentTemplate?.files?.[index]?.previewHeaders || [];
  }

  // public getTypeLabel(value: string) {
  //   return this.typeOptions.find((opt) => opt.value === value)?.label || value;
  // }

  public onEditModeChanges([prev, current]: any) {
    this.logger.debug('Inside data-view-modal component onEditModeChanges');

    if (this.mode !== PageMode.EDIT) return;

    // type: this.fb.control('', [Validators.required]),
    // source: this.fb.control('collection', [Validators.required]),
    // database: this.fb.control('', [Validators.required]),
    // typeFields: this.fb.group({}),
    // files: this.fb.array([]),
    // name: this.fb.control('', [Validators.required]),
    // description: this.fb.control('', [Validators.required]),

    const isValidChange = (field: string) =>
      current[field]?.length && prev[field]?.length && prev[field] !== current[field];

    if (this.type.dirty && isValidChange('type')) {
      this.changes['type'] = { label: 'Type of Data:', changedValue: current['type'], previousValue: current['type'] };
    }

    if (this.database.dirty && isValidChange('database')) {
      this.changes['database'] = {
        label: 'Database:',
        changedValue: current['database'],
        previousValue: prev['database'],
      };
    }

    if (this.source.dirty && isValidChange('source')) {
      this.changes['source'] = {
        label: 'Data Source:',
        changedValue: current['source'],
        previousValue: prev['source'],
      };
    }

    if (this.name.dirty && isValidChange('name')) {
      this.changes['name'] = { label: 'Name:', changedValue: current['name'], previousValue: prev['name'] };
    }

    if (this.description.dirty && isValidChange('description')) {
      this.changes['description'] = {
        label: 'Description:',
        changedValue: current['description'],
        previousValue: prev['description'],
      };
    }

    for (const [index, control] of this.files.controls.entries()) {
      if (control.dirty) {
        this.changes[`files-${index}`] = {
          label: 'File Change:',
          changedValue: control?.value?.name || 'Missing data',
          previousValue: prev['files']?.[index]?.name,
        };
      }
    }

    if (this.typeFields.dirty) {
      for (const [index, key] of Object.keys(prev['typeFields']).entries()) {
        const prevFields = prev['typeFields'];
        const currentFields = current['typeFields'];

        if (prevFields[key] !== currentFields[key]) {
          this.changes[`typeFields-${key}`] = {
            label: `"${this.currentTemplate?.fields[index].label}" Changed`,
            changedValue: currentFields[key],
            previousValue: prevFields[key],
          };
        }
      }
    }
  }

  public viewCollection() {
    this.reset();
    this.duplicateModal.close();
    this.open(this.duplicate, true);
    this.duplicate = undefined;
  }

  public openDuplicatePreview() {
    this.logger.debug('Inside data-view-modal component openDuplicatePreview');

    if (!this.duplicateModal) return;

    this.duplicateModal.open();
  }

  public closeDuplicatePreview() {
    if (!this.duplicateModal) return;

    this.duplicateModal.close();
  }

  get type() {
    return this.baseDataViewForm.get('type') as FormControl;
  }
  get source() {
    return this.baseDataViewForm.get('source') as FormControl;
  }
  get typeFields() {
    return this.baseDataViewForm.get('typeFields') as FormGroup;
  }
  get files() {
    return this.baseDataViewForm.get('files') as FormArray;
  }
  get name() {
    return this.baseDataViewForm.get('name') as FormControl;
  }
  get description() {
    return this.baseDataViewForm.get('description') as FormControl;
  }
  get database() {
    return this.baseDataViewForm.get('database') as FormControl;
  }
  get justification() {
    return this.editJustificationForm.get('justification') as FormControl;
  }
  get reason() {
    return this.editJustificationForm.get('reason') as FormControl;
  }
}

enum FileControlState {
  EMPTY,
  UPLOAD_PREP,
  UPLOADING,
  UPLOAD_FAILED,
  VALIDATION,
  VALDATION_FAILED,
  VALID,
}
