import {
  ICondition,
  IFilter,
  IFilterGroup,
  IReport,
  IReportPreview,
  ISummaryTemplate,
  ITemplate,
  ITemplateFilters,
  PageMode,
  ReportVersion,
  SelectFilter,
  cleanObject,
  flattenObject,
} from '@adapt/types';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  Subscription,
  catchError,
  combineLatest,
  filter,
  firstValueFrom,
  forkJoin,
  map,
  of,
  pairwise,
  startWith,
  switchMap,
  tap,
  zip,
} from 'rxjs';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { RecentActivityService } from '../../../services/recent-activity.service';
import { FilterPanelService } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/services/filterpanel.service';
import { TabViewComponent } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/components/tab-view/tab-view.component';
import { FocusService } from '../../services/focus.service';
import { AlertService } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../auth/services/user/user.service';
import { Idle } from '@ng-idle/core';
import { IdleStates } from '../../../auth/auth-model';
import { LocationStrategy } from '@angular/common';
import { ConfirmModalComponent } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/components/confirm-modal/confirm-modal.component';
import { ModalComponent } from '@adapt/adapt-shared-component-lib';
import { TemplateService } from '../../../services/template.service';

interface ReportFilter {
  [key: string]: any;
}

@Component({
  selector: 'adapt-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements AfterViewInit, OnDestroy {
  PageMode = PageMode;
  ReportVersion = ReportVersion;
  @ViewChild(TabViewComponent) tabView?: TabViewComponent;

  @Output() loaded = new EventEmitter<boolean>();

  @ViewChild(ConfirmModalComponent) confirmModal?: ConfirmModalComponent;
  @ViewChild('resetModal') resetModal?: ModalComponent;
  @ViewChild('unPublishModal') unPublishModal?: ModalComponent;
  @ViewChild('publishConfirmationModal') publishConfirmationModal?: ModalComponent;
  @ViewChild('shareModal') shareModal?: ModalComponent;
  @Input() report?: any;

  @Input() preview = false;

  @Input() previewSuppress = false;

  public showFilters = false;
  public filtered = false;
  private intialLoad = true;

  public shareURL?: Observable<string>;

  public startTime = 0;

  public reportTabIndex = 0;

  public mode = PageMode.VIEW;

  public radioSelectItems = [
    { label: 'Internal use only', value: 'internal' },
    { label: 'External public view', value: 'external' },
  ];

  @HostListener('window:beforeunload')
  canDeactivate(isRouter = false, nextState?: RouterStateSnapshot): boolean {
    if (this.user.idleState === IdleStates.TIMED_OUT) return true;

    if (isRouter) this.confirmModal?.open(nextState?.url);

    return !(this.mode === PageMode.EDIT && this.editReportForm.dirty);
  }

  filterClass: 'filtered' | 'suppressed' = 'filtered';

  public templateSubject = new BehaviorSubject<ITemplate | ISummaryTemplate | null>(null);

  public $template = this.templateSubject
    .asObservable()
    .pipe(filter((temp) => !!temp))
    .pipe(
      tap((template) => {
        this.loading = false;
        const reportTemplate = template as ITemplate;
        if (!this.preview) this.buildFilterFormGroup(reportTemplate.filters);
        //   this.onFilter.next(this.filterFormGroup.value);
        this.announcer.announce('Loading Report Preview');
        this.startTime = Date.now();
      })
    )
    .pipe(
      switchMap((temp) =>
        this.$onFilter
          .pipe(
            map((obj) => {
              return flattenObject(obj);
            })
          )
          .pipe(
            switchMap((changes) => {
              this.loading = true;
              if (!this.preview) {
                if (this.intialLoad) this.applyFilterChanges(true);
                this.existingFilters = this.buildExistingFilters();
              }

              const filters =
                changes !== undefined && Object.keys(cleanObject(changes)).length
                  ? cleanObject(changes)
                  : { ...this.existingFilters };

              this.filtered = changes !== undefined && Object.keys(cleanObject(changes)).length > 0;

              // assume new data view structure
              return this.temp.renderTemplateWithMultipleViews(
                structuredClone(temp) as ITemplate,
                this.report.dataView,
                filters,
                this.previewSuppress
              );
            })
          )
      )
    )
    .pipe(
      tap(() => {
        const time = Date.now() - this.startTime;
        console.log(`Report Took: ${Math.floor(time / 1000)} s to load`);
        this.loading = false;

        this.announcer.announce('Report Loaded');
        this.tabView?.refresh();
        this.loaded.emit(true);
      })
    );

  public $templateError = this.$template.pipe(
    catchError((err) => of({ success: false, err })),
    filter((val) => (val as { success: boolean })?.success === false),
    tap((err) => this.loaded.emit(false))
  );

  @Output() templateUpdate = new EventEmitter<ITemplate | ISummaryTemplate | null>();

  // Filter panel toggle service logic
  private subscription: Subscription;
  public showFilterPanel = false;
  filterStatusMessage = '';
  filterStateMessage = '';
  existingFilters: ReportFilter = {};
  previousFilters: ReportFilter | null = null;

  public unPublishJustificationForm: FormGroup;

  toggleFilterPanel(close = false) {
    this.showFilterPanel = !this.showFilterPanel;
    if (close) this.showFilterPanel = false;
    if (this.showFilterPanel) {
      this.existingFilters = this.buildExistingFilters();
      this.filterStateMessage = 'Filter panel opened.';
    } else this.filterStateMessage = 'Filter panel closed.';
    this.filterPanelService.changeFilterPanelState(this.showFilterPanel);
  }

  applyFilterChanges(reset = false) {
    this.loading = true;
    this.filterStatusMessage = 'Filters changed.';
    this.toggleFilterPanel(true);
    this.previousFilters = { ...this.buildExistingFilters() };

    if (reset) {
      this.filterFormGroup.reset();
      this.intialLoad ? (this.showResetFilters = false) : (this.showResetFilters = true);
    }

    if (!this.intialLoad) this.onFilter.next(this.filterFormGroup.value);

    this.intialLoad = false;
  }

  showResetFilters = false;

  confirmResetFilters() {
    const confirmReset = window.confirm('Are you sure you want to reset all filters?');
    //   debugger;
    if (confirmReset) {
      this.applyFilterChanges(true);
    } else {
      // User cancelled, do nothing or handle cancellation
    }
  }

  usePreviousFilters() {
    this.loading = true;
    this.showResetFilters = false;
    this.toggleFilterPanel(true);
    this.filterStatusMessage = 'Previous filters applied.';
    this.filterFormGroup.reset(this.previousFilters);
    this.onFilter.next(this.filterFormGroup.value);
  }

  private subscriptions: Subscription[] = [];
  private routeSub!: Subscription;

  public filterFormGroup: FormGroup;
  public editReportForm: FormGroup;
  availableFilters!: any[];

  public onFilter = new BehaviorSubject({});
  public $onFilter = this.onFilter.asObservable();

  loading = true;

  public originalOrder = (a: any, b: any): number => {
    return a?.value?.order - b?.value?.order;
  };

  constructor(
    private temp: TemplateService,
    private router: Router,
    private user: UserService,
    private idle: Idle,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private alert: AlertService,
    private location: LocationStrategy,
    private announcer: LiveAnnouncer,
    private dataService: AdaptDataService,
    private recentActivity: RecentActivityService,
    private filterPanelService: FilterPanelService,
    private focusService: FocusService
  ) {
    this.editReportForm = this.fb.group({
      title: this.fb.control('', [Validators.required]),
      description: this.fb.control('', [Validators.required]),
      audience: this.fb.control('internal', [Validators.required]),
    });

    this.unPublishJustificationForm = this.fb.group({
      justification: this.fb.control('', [Validators.required]),
    });

    this.filterFormGroup = this.fb.group({});
    this.subscription = this.filterPanelService.currentFilterPanelState.subscribe((state) => {
      this.showFilterPanel = state;
    });

    this.idle.onTimeout.subscribe(() => {
      if (this.editReportForm.dirty) {
        this.user.userInactivitySave({
          action: 'EDIT',
          type: 'Report',
          body: {
            reportID: this.report.reportID,
            version: this.route?.snapshot?.queryParams['version'] ?? 'draft',
            ...this.editReportForm.getRawValue(),
          },
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.routeSub?.unsubscribe();
  }

  private buildFilterFormGroup(filters: ITemplateFilters, group?: string) {
    if (!filters) return;
    const targetGroup = group?.length ? (this.filterFormGroup.get(group)! as FormGroup) : this.filterFormGroup;
    Object.keys(filters).forEach((key) => {
      if ('code' in filters[key]) {
        const newControl = new FormControl((filters[key] as IFilter<any>)?.filter?.default ?? '');
        const code = `${(filters[key] as IFilter<unknown>).code}`;
        // iFilter
        targetGroup.addControl(code, newControl);

        if ((filters[key] as IFilter<unknown>).children) {
          this.buildFilterFormGroup((filters[key] as IFilter<unknown>).children);
        }
      } else if ('exclusive' in filters[key]) {
        // IFilterGroup
        const newGroup = new FormGroup({});

        this.filterFormGroup.addControl(key, newGroup);

        this.buildFilterFormGroup((filters[key] as IFilterGroup).filters, key);
      }
    });
    this.availableFilters = this.filterFormGroup.value;
  }

  public showFilter(template: ITemplate, filter: IFilter<unknown>) {
    if (!filter?.condition) return true;

    const { pages, conditions, operator } = filter.condition;

    const show = () => {
      if (!conditions?.length) return true;

      const validConditions = conditions.filter((cond) => {
        const filter = template.filters[cond.parent] as IFilter<unknown>;

        const pageID = template.pages?.[this.reportTabIndex].id;

        return filter.condition?.pages?.includes(pageID || '');
      });

      if (!validConditions.length) return true;

      switch (operator) {
        case 'AND': {
          return validConditions?.every((cond: ICondition) => {
            const parent = this.filterFormGroup.get(cond.parent)?.value;

            return cond.value.includes(parent);
          });
        }
        case 'OR': {
          return validConditions?.some((cond: ICondition) => {
            const parent = this.filterFormGroup.get(cond.parent)?.value;

            return cond.value.includes(parent);
          });
        }
      }
      return true;
    };

    if (pages?.length) {
      const page = template?.pages?.[this.reportTabIndex];

      return pages.includes(page!.id) && show();
    }

    return show();
    //$any(child.value).condition.includes(filterFormGroup.get(filter.key)?.value)
  }

  public onTemplateChange(template: ITemplate) {
    this.templateUpdate.emit(template);
  }
  public onSuppress(toggle: boolean) {
    this.filterClass = toggle ? 'suppressed' : 'filtered';

    this.templateSubject.next(this.templateSubject.value);
  }

  test(event: any) {}

  async ngAfterViewInit() {
    if (this.preview) {
      const reportPreview = this.report as IReportPreview;

      const template = await firstValueFrom(this.temp.getTemplate(reportPreview!.template as string));

      this.report.template = template;

      this.templateSubject.next(this.report.template);

      return;
    }

    // const data = await firstValueFrom(rawdata);
    // this.report = data['reportResolver'];

    this.routeSub = combineLatest([this.route.params, this.route.queryParams]).subscribe(
      async ([params, queryParams]) => {
        try {
          const reportData = await firstValueFrom(
            this.dataService.getReport(params['id'], queryParams['version']).pipe(
              tap((result) => {
                this.recentActivity.addRecentActivity(params['id'], 'Report', result);

                this.editReportForm.setValue({
                  title: result?.name,
                  description: result?.template.description,
                  audience: result?.visibility,
                });
              })
            )
          );
          this.report = reportData;
          this.previewSuppress = reportData?.visibility === 'external';
          // resolve data view

          const state = this.location.getState() as any;

          if (state?.['editMode']) this.mode = PageMode.EDIT;

          this.report.dataView = await firstValueFrom(
            this.dataService
              .getDataViews()
              .pipe(map((views) => views.find((view) => view.dataViewID === this.report.dataView)))
          );

          this.templateSubject.next(this.report.template);

          const filters = Object.keys(queryParams).reduce(
            (accum, val) => (val === 'version' ? accum : Object.assign(accum, { [val]: queryParams[val] })),
            {}
          );

          this.filterFormGroup.patchValue(filters);
          this.onFilter.next(filters);

          this.existingFilters = this.buildExistingFilters();
        } catch (error) {
          console.error('Error fetching report data:', error);
        }
      }
    );
  }

  filterSummary = {
    totalFilters: 0,
    categoriesWithFilters: 0,
  };

  buildExistingFilters() {
    if (this.preview) return {};
    const existingSelections: { [key: string]: string[] } = {};
    let filterCount = 0;
    let categoryCount = 0;

    for (const key in this.filterFormGroup.value) {
      if (key in this.report.template.filters) {
        let hasValue = false;

        if (this.filterFormGroup.value[key] === 'all') {
          if (
            this.report.template.filters[key].filter &&
            Array.isArray(this.report.template.filters[key].filter.options)
          ) {
            existingSelections[key] = this.report.template.filters[key].filter.options
              .filter((option: { value: string }) => option.value !== 'all' && option.value !== '')
              .map((option: { value: any }) => option.value);
            hasValue = existingSelections[key].length > 0;
          } else {
            console.error(`Invalid structure for ${key} in report template filters`);
          }
        } else {
          if (this.filterFormGroup.value[key] !== null) {
            const values = [this.filterFormGroup.value[key]].flat().filter((value) => value !== '');
            if (values.length > 0) {
              existingSelections[key] = values;
              hasValue = true;
            }
          }
        }

        if (hasValue) {
          filterCount += existingSelections[key].length;
          categoryCount++;
        }
      } else {
        console.log(`Key ${key} not found in report template filters`);
      }
    }

    this.filterSummary = {
      totalFilters: filterCount,
      categoriesWithFilters: categoryCount,
    };
    return existingSelections;
  }

  handleUnSuppress(): void {
    this.previewSuppress = false;
    this.onSuppress(this.previewSuppress);
    this.focusService.moveToFirstFocusableElement('lib-adapt-checkbox#suppression-checkbox');
  }

  public onTabChange() {
    this.filterFormGroup.reset();
    this.onFilter.next(this.filterFormGroup.value);
  }

  public editReport() {
    this.isEditMode() ? (this.mode = PageMode.VIEW) : (this.mode = PageMode.EDIT);
  }

  public isEditMode() {
    return this.mode === PageMode.EDIT;
  }

  public confirmCancel() {
    this.mode = PageMode.VIEW;
    this.editReportForm.markAsPristine();
    this.editReportForm.markAsUntouched();
  }

  public reset() {
    this.editReportForm.setValue({
      title: this.report?.name,
      description: this.report?.template.description,
      audience: this.report?.visibility,
    });
    this.editReportForm.markAsPristine();
    this.editReportForm.markAsUntouched();
    this.resetModal?.close();
  }

  public cancel() {
    if (this.editReportForm.dirty) return this.confirmModal?.open();
    this.mode = PageMode.VIEW;
  }

  public publishReport() {
    this.dataService.startReportPublish(this.report).subscribe({
      next: () => {
        this.alert.add({
          type: 'success',
          title: 'Report Publish Success',
          body: 'Report publish process has started. You will receive a notification when the published report is ready.',
        });
      },
      error: () => {
        this.alert.add({
          type: 'error',
          title: 'Report Publish Failed',
          body: 'Report publish process failed to start, please try again later.',
        });
      },
    });
  }

  public confirmUnPublish() {
    this.unPublishModal?.close();
    this.dataService
      .unPublishReport(this.report, this.unPublishJustificationForm.get('justification')?.value)
      .subscribe({
        next: () => {
          this.alert.add({
            type: 'success',
            title: 'Report Un-Publish Success',
            body: 'Report has been un-published.',
          });
          this.router.navigate(['..', this.report.reportID], {
            relativeTo: this.route,
            queryParams: { version: 'draft' },
          });
        },
        error: () => {
          this.alert.add({
            type: 'error',
            title: 'Report Un-Publish Failed',
            body: 'Failed to Un-Publish report, please try again later.',
          });
        },
      });
  }

  public onEditSave() {
    if (!this.editReportForm.valid) return;
    const { title, audience, description } = this.editReportForm.getRawValue();
    const reportEdit = structuredClone(this.report) as IReport;

    reportEdit.name = title;
    reportEdit.template.title = title;
    reportEdit.template.description = description;
    reportEdit.visibility = audience;

    this.dataService.editReport(reportEdit).subscribe({
      next: (report) => {
        this.alert.add({ type: 'success', title: 'Report Save Complete', body: `Your report edits have been saved` });
        this.mode = PageMode.VIEW;

        this.report = report;
        if (this.templateSubject.value) {
          this.templateSubject.value!.description = description;
          this.templateSubject.value!.title = title;
        } else {
          this.templateSubject.next(this.report.template);
        }
        this.dataService.refreshReports();
      },
      error: (err) => {
        this.alert.add({
          type: 'error',
          title: 'Report Save Failed',
          body: `Your report edits failed to saved, please try again`,
        });
      },
    });
  }

  public get editTitle() {
    return this.editReportForm.get('title') as FormControl;
  }

  public get editDescription() {
    return this.editReportForm.get('description') as FormControl;
  }

  public get editAudience() {
    return this.editReportForm.get('audience') as FormControl;
  }

  public openShareModal() {
    this.shareModal?.open();

    const appliedFilters: any = this.onFilter.value;

    const validFilters = Object.keys(this.onFilter.value).reduce((accum, key) => {
      if (appliedFilters[key] !== null && appliedFilters[key] !== undefined)
        return Object.assign(accum, { [key]: appliedFilters[key] });

      return accum;
    }, {});

    this.shareURL = this.dataService
      .shareReport(this.report.reportID, validFilters)
      .pipe(switchMap((slug) => of(`${location.protocol}//${location.host}/admin/share/${slug}`)));
  }

  public copy(text: string) {
    navigator.clipboard.writeText(text);
  }
}
