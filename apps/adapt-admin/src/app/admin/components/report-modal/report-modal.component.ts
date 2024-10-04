import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { StepsIndicatorComponent } from '../steps-indicator/steps-indicator.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, firstValueFrom, map, Observable, Subscription } from 'rxjs';
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

@Component({
  selector: 'adapt-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss'],
})
export class ReportModalComponent implements OnDestroy {
  @ViewChild(StepsIndicatorComponent) stepsIndicator!: StepsIndicatorComponent;
  @ViewChild(FullPageModalComponent) modal!: FullPageModalComponent;
  @ViewChild('previewModal') previewModal!: ModalComponent;
  @ViewChild('confirmCloseModal') confirmCloseModal!: ModalComponent;
  public saving = false;
  public saved = false;
  public failed = false;

  public modalHeaders = [
    'Step 1: Template and Data Configuration',
    'Step 2: Name and Preview Report',
    'Step 3: Report creation summary',
  ];

  public radioSelectItems = [
    { label: 'Internal use only', value: 'internal' },
    { label: 'External public view', value: 'external' },
  ];

  public reportTemplates = [
    { label: 'Child Count and Educational Environments', value: 'childCount-multiple' },
    { label: 'Child Count and Settings', value: 'childCountAndSettings' },
  ];

  public currentStep = 0;

  public reportFormGroup: FormGroup;

  public dataViews: Observable<DataView[]>;

  private reportTemplateCache = new Map<string, Promise<ITemplate>>();

  public subscriptions: Subscription[] = [];

  public currentReportTemplate?: ITemplate;
  public currentDataViewIndex = 0;

  public showPreview = false;

  public previewOpened = false;

  public savedReport = '';

  @HostListener('window:beforeunload')
  beforeUnload(event: any) {
    if (this.reportFormGroup.dirty) {
      event.returnValue = 'You have unsaved changes!';
    }
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private data: AdaptDataService,
    private idle: Idle,
    private cd: ChangeDetectorRef,
    private user: UserService,
    private template: TemplateService,
    private alert: AlertService,
    private router: Router
  ) {
    this.reportFormGroup = this.fb.group({
      dataView: this.fb.control('', [Validators.required]),
      template: this.fb.control('', [Validators.required]),
      visibility: this.fb.control('internal', [Validators.required]),
      title: this.fb.control('', [Validators.required], [uniqueNameValidator('Report', this.data, PageMode.CREATE)]),
      description: this.fb.control('', [Validators.required]),
      preview: this.fb.control(undefined, [Validators.required]),
    });

    this.title.disable();
    this.description.disable();
    this.preview.disable();

    this.dataViews = this.data
      .getDataViews()
      .pipe(map((views) => views.filter((view) => view.status === DataSetQueueStatus.AVAILABLE)));


      this.idle.onTimeout.subscribe(() => {
        if(this.reportFormGroup.dirty) {
          this.user.userInactivitySave({action: 'CREATION', type: 'Report', body: {page: this.currentStep || this.stepsIndicator.step , ...this.reportFormGroup.getRawValue()}})
        }
      })
    
    const dataViewSub = this.dataView.valueChanges.subscribe((val) => {
      this.preview.setValue(undefined)
      this.preview.markAsPristine()
    })

    this.subscriptions.push(dataViewSub)

      this.idle.onTimeout.subscribe(() => {
        if(this.reportFormGroup.dirty) {
          this.user.userInactivitySave({action: 'CREATION', type: 'Report', body: {page: this.currentStep || this.stepsIndicator.step , ...this.reportFormGroup.getRawValue()}})
        }
      })

  }

  public next() {
  //  debugger;
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

    if(report){
      this.reportFormGroup.patchValue(report)
    }

    this.audience.setValue('internal');

    const templateSub = this.reportTemplate.valueChanges.subscribe(async (template) => {
      this.preview.setValue(undefined)
      this.preview.markAsPristine()
      const setFields = (template: ITemplate) => {
        if (!this.title.dirty) this.title.setValue(template.title);
        if (!this.description.dirty) this.description.setValue(template.description);

        this.currentReportTemplate = template;
      };

      if (this.reportTemplateCache.has(template)) {
        const dbTemplate = (await this.reportTemplateCache.get(template)) as ITemplate;

        setFields(dbTemplate);
      }

      const promise = this.template.getTemplatePromise(template) as Promise<ITemplate>;

      this.reportTemplateCache.set(template, promise);

      setFields(await promise);
    });



    this.subscriptions.push(templateSub);
    this.stepsIndicator.setStep(page);
    this.handleNextStep();
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

    this.router.navigate([this.savedReport], { relativeTo: this.route }).then(() => window.location.reload());
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
    this.preview.setValue(event);

    !event ? this.preview.setErrors({ invalidPreview: true }) : this.preview.setErrors(null);
  }

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
  public get preview() {
    return this.reportFormGroup.get('preview') as FormControl;
  }
}
