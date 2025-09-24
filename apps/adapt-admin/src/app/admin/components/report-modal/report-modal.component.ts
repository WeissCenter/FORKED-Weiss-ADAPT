import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  computed,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { StepsIndicatorComponent } from '../steps-indicator/steps-indicator.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, firstValueFrom, map, Observable, startWith, Subscription, switchMap, take } from 'rxjs';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { CreateReportInput, DataSetQueueStatus, DataView, IRenderedTemplate, ITemplate, PageMode } from '@adapt/types';
import { FullPageModalComponent } from '../full-page-modal/full-page-modal.component';
import { getFormErrors, uniqueNameValidator } from '../../../util';
import { ModalComponent } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/components/modal/modal.component';
import { AlertService } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Idle } from '@ng-idle/core';
import { UserService } from '../../../auth/services/user/user.service';
import { TemplateService } from '../../../services/template.service';
import { LocationStrategy } from '@angular/common';
import { PagesContentService } from '@adapt-apps/adapt-admin/src/app/auth/services/content/pages-content.service';
import slugify from 'slugify';
import { NGXLogger } from 'ngx-logger';
import { QuestionOptionContentText } from '@adapt-apps/adapt-admin/src/app/admin/models/admin-content-text.model';
@Component({
  selector: 'adapt-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss'],
})
export class ReportModalComponent implements OnInit, OnDestroy, AfterContentChecked {
  @ViewChild(StepsIndicatorComponent) stepsIndicator!: StepsIndicatorComponent;
  @ViewChild(FullPageModalComponent) modal!: FullPageModalComponent;
  @ViewChild('previewModal') previewModal!: ModalComponent;
  @ViewChild('confirmCloseModal') confirmCloseModal!: ModalComponent;
  public saving = false;
  public saved = false;
  public failed = false;
  public slugPattern = new RegExp('[-a-z0-9]');

  public reportTemplates = [
    { label: 'Child Count and Educational Environments', value: 'childCount-multiple' },
    { label: 'Child Count and Educational Environments Spanish', value: 'childCount-multiple-es-MX' },
    { label: 'Child Count and Settings', value: 'childCountAndSettings' },
    { label: 'Exiting', value: 'exiting' },
  ];

  public currentStep = 0;

  public reportFormGroup: FormGroup;

  public dataViews: Observable<DataView[]>;
  public filteredDataViews$: Observable<DataView[]>;

  public subscriptions: Subscription[] = [];

  public currentReportTemplate?: ITemplate;
  public currentDataViewIndex = 0;

  public showPreview = false;

  public previewOpened = false;

  public savedReport = '';

  public reportTemplatesAsync: Observable<{ label: string; value: ITemplate }[]>; //this.data.getTemplates('ReportTemplate').pipe(map((result => result.map((temp: any) => ({label: temp.title,  value: temp})))));
  public filteredReportTemplates$: Observable<{ label: string; value: ITemplate }[]>;

  $pageContent = this.pagesContentService.getPageContentSignal('reports');
  $pageSections = computed(() => this.$pageContent()?.sections);

  @HostListener('window:beforeunload')
  beforeUnload(event: any) {
    if (this.reportFormGroup.dirty) {
      event.returnValue = 'You have unsaved changes!';
    }
  }

  constructor(
    private logger: NGXLogger,
    private fb: FormBuilder,
    //private route: ActivatedRoute,
    public data: AdaptDataService,
    private idle: Idle,
    private cdRef: ChangeDetectorRef,
    private user: UserService,
    //private template: TemplateService,
    private alert: AlertService,
    private location: LocationStrategy,
    private router: Router,
    public pagesContentService: PagesContentService
  ) {
    this.logger.debug('Inside ReportModalComponent constructor');

    this.reportFormGroup = this.fb.group({
      //reportingLevel: this.fb.control('', [Validators.required]),
      dataView: this.fb.control('', [Validators.required]),
      template: this.fb.control('', [Validators.required]),
      visibility: this.fb.control('internal', [Validators.required]),
      title: this.fb.control('', [Validators.required], [uniqueNameValidator('Report', this.data, PageMode.CREATE)]),
      slug: this.fb.control(
        '',
        [Validators.required],
        [uniqueNameValidator('Report', this.data, PageMode.CREATE, 'slug')]
      ),
      description: this.fb.control('', [Validators.required]),
      preview: this.fb.control(undefined, [Validators.required]),
    });

    this.title.disable();
    this.description.disable();
    this.preview.disable();
    this.slug.disable();

    this.location.onPopState((event) => {
      if (event.type === 'popstate') this.cancel();
    });

    this.dataViews = this.data
      .getDataViews()
      .pipe(map((views) => views.filter((view) => view.status === DataSetQueueStatus.AVAILABLE)));

    this.logger.debug('dataViews: ', this.dataViews);

    this.reportTemplatesAsync = this.data
      .getTemplates<ITemplate>('ReportTemplate')
      .pipe(map((result) => result.map((temp: ITemplate) => ({ label: temp.title, value: temp }))));

    this.idle.onTimeout.subscribe(() => {
      if (this.reportFormGroup.dirty) {
        this.user.userInactivitySave({
          action: 'CREATION',
          type: 'Report',
          body: { page: this.currentStep || this.stepsIndicator.step, ...this.reportFormGroup.getRawValue() },
        });
      }
    });

    // get the dropdown options for the question: What data view do you want to use?

    this.filteredDataViews$ = this.dataViews; //this.filterDataViews('');  // 'SEA (State Education Agency)'

    // this.filteredDataViews$ = this.reportingLevel.valueChanges.pipe(
    //   startWith(this.reportingLevel.value),
    //   switchMap((selectedReportingLevel: QuestionOptionContentText) =>
    //
    //       this.filterDataViews(selectedReportingLevel.label)
    //
    //   )
    // );

    this.filteredReportTemplates$ = this.reportTemplatesAsync; //this.filterReportTemplates('');

    // this.filteredReportTemplates$ = this.reportingLevel.valueChanges.pipe(
    //   startWith(this.reportingLevel.value),
    //   switchMap((selectedReportingLevel: QuestionOptionContentText) =>
    //     this.filterReportTemplates(selectedReportingLevel.label)
    //   )
    // );

    this.logger.debug('filteredReportTemplates$: ', this.filteredReportTemplates$);

    const dataViewSub = this.dataView.valueChanges.subscribe((val) => {
      this.preview.setValue(undefined);
      this.preview.markAsPristine();
    });

    this.subscriptions.push(dataViewSub);

    this.idle.onTimeout.subscribe(() => {
      if (this.reportFormGroup.dirty) {
        this.user.userInactivitySave({
          action: 'CREATION',
          type: 'Report',
          body: { page: this.currentStep || this.stepsIndicator.step, ...this.reportFormGroup.getRawValue() },
        });
      }
    });
  }

  ngOnInit() {
    // Can update these variables with dynamical content pulled from the database if needed
    // console.log('Inside report-modal component ngOnInit');
  }

  private filterDataViews(reportingLevelLabel: string): Observable<DataView[]> {
    this.logger.debug('Inside filteredDataViews, reportingLevelLabel: ', reportingLevelLabel);

    return this.dataViews.pipe(
      map((items) => {
        const filtered = items.filter((item) => {
          const rl = item.data.fields.find((f) => f.id === 'reportingLevel');
          return rl?.label === reportingLevelLabel || rl === undefined;
        }); // Filtered created as const so that we can sort it before returning it

        this.logger.debug('filtered: ', filtered);

        return filtered
          .slice() // Using slice() to avoid mutating the source array
          .sort((a, b) => b.updated! - a.updated!); // Sorted in descending order by 'updated' field before returning
      })
    );
  }

  private filterReportTemplates(reportingLevelLabel: string): Observable<{ label: string; value: ITemplate }[]> {
    this.logger.debug('Inside filterReportTemplates, reportingLevelLabel: ', reportingLevelLabel);

    return this.reportTemplatesAsync.pipe(
      map((items) => {
        this.logger.debug('Inside filteredReportTemplates, reportingLevelLabel: ', reportingLevelLabel);

        const filtered = items.filter(
          (item) =>
            item.value.reportingLevels === undefined || item.value.reportingLevels?.includes(reportingLevelLabel)
        );

        this.logger.debug('filtered: ', filtered);
        return filtered;
      })
    );
  }

  public next() {
    if (this.currentStep > 0) this.reportFormGroup.markAllAsTouched();

    if (this.reportFormGroup.invalid || this.reportFormGroup.pending) {
      return;
    }

    this.stepsIndicator.next();

    // based on the post step do something
    this.handleNextStep();
  }

  private handleNextStep() {
    switch (this.currentStep) {
      case 0: {
        // DETAIL
        this.title.disable();
        this.description.disable();
        this.preview.disable();
        break;
      }
      case 1: {
        // LOAD
        this.title.enable();

        this.description.enable();

        this.title.markAsUntouched();
        this.description.markAsUntouched();
        this.preview.enable();

        if (this.audience.value === 'external') {
          this.slug.enable();
          this.slug.markAsUntouched();
        }

        break;
      }
      case 3: {
        break;
      }
    }
  }

  public open(dataView?: DataView, report?: Report, page = 0) {
    if (!this.modal) return;
    this.modal.open();

    if (dataView) {
      this.dataView.setValue(dataView);
    }

    if (report) {
      this.reportFormGroup.patchValue(report);
    }

    this.audience.setValue('internal');

    const templateSub = this.reportTemplate.valueChanges.subscribe(async (template) => {
      this.preview.setValue(undefined);
      this.preview.markAsPristine();
      const setFields = (template: ITemplate) => {
        if (!this.title.dirty) this.title.setValue(template.title);
        if (!this.description.dirty) this.description.setValue(template.description);

        if (!this.slug.dirty)
          this.slug.setValue(
            slugify(template.title, {
              strict: true,
              lower: true,
              trim: true,
            })
          );

        this.currentReportTemplate = template;
      };

      setFields(template);
    });

    this.subscriptions.push(templateSub);
    this.stepsIndicator.setStep(page);
    this.handleNextStep();
  }

  ngAfterContentChecked() {
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  public previous() {
    this.stepsIndicator.prev();

    switch (this.currentStep) {
      case 0: {
        // DETAIL
        this.title.disable();
        this.description.disable();
        this.preview.disable();
        break;
      }
      case 1: {
        // LOAD
        this.title.enable();
        this.preview.enable();
        this.description.enable();
        this.title.markAsUntouched();
        this.preview.markAsUntouched();
        this.description.markAsUntouched();
        break;
      }
      case 3: {
        break;
      }
    }
  }

  public cancel() {
    this.currentStep = 0;
    this.modal.close();
    this.reset();
  }

  public viewReport() {
    this.modal.close();
    this.reset();

    this.router.navigate(['admin', 'reports', this.savedReport]).then(() => window.location.reload());
  }

  public generatePreview() {
    this.previewModal.open();
    this.preview.markAsTouched();
    this.showPreview = true;
    this.previewOpened = true;
  }

  public reset() {
    this.currentDataViewIndex = -1;
    this.currentStep = 0;
    this.saving = false;
    this.saved = false;
    this.showPreview = false;
    this.confirmCloseModal.close();
    this.title.disable();
    this.description.disable();
    this.preview.disable();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.reportFormGroup.reset();
    this.reportFormGroup.markAsPristine();
  }

  public save(close = false, view = false) {
    this.reportFormGroup.markAllAsTouched();
    if (this.reportFormGroup.invalid) {
      return;
    }

    this.saving = true;

    const report = this.reportFormGroup.getRawValue();

    if (this.currentReportTemplate) {
      this.currentReportTemplate.title = this.title.value;
      this.currentReportTemplate.description = this.description.value;
    }

    const newReportItem: CreateReportInput = {
      name: this.title.value,
      visibility: report.visibility,
      dataViews: report.dataViews,
      dataView: this.dataView.value.dataViewID,
      template: this.currentReportTemplate!,
      slug: this.slug.value,
      //  reportingLevel: this.reportingLevel.value.value,
    };

    this.data
      .createReport(newReportItem)
      .pipe(
        catchError((err) => {
          this.saved = false;
          this.saving = false;
          this.failed = true;
          throw false;
        })
      )
      .subscribe((result) => {
        this.saved = true;
        this.saving = false;
        this.failed = false;
        this.savedReport = result;

        if (close) {
          this.reset();
          view ? this.viewReport() : this.modal.close();
        }
      });
  }

  public onReportPreviewEvent(event: boolean) {
    console.log(event);
    this.preview.setValue(event);

    !event ? this.preview.setErrors({ invalidPreview: true }) : this.preview.setErrors(null);
  }

  // public get reportingLevel() {
  //   return this.reportFormGroup.get('reportingLevel') as FormControl;
  // }

  public get dataView() {
    return this.reportFormGroup.get('dataView') as FormControl;
  }
  public get reportTemplate() {
    return this.reportFormGroup.get('template') as FormControl;
  }
  public get audience() {
    return this.reportFormGroup.get('visibility') as FormControl;
  }
  public get title() {
    return this.reportFormGroup.get('title') as FormControl;
  }
  public get description() {
    return this.reportFormGroup.get('description') as FormControl;
  }
  public get slug() {
    return this.reportFormGroup.get('slug') as FormControl;
  }
  public get preview() {
    return this.reportFormGroup.get('preview') as FormControl;
  }
}
