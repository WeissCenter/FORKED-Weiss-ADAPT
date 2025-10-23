import { DataView, IReport, ReportVersion } from '@adapt/types';
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, map, switchMap, of, BehaviorSubject } from 'rxjs';
import { RoleService } from '../../../auth/services/role/role.service';
import { FilterPanelService } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/services/filterpanel.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { ReportModalComponent } from '../../components/report-modal/report-modal.component';
import { AlertService } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/services/alert.service';
import { LocationStrategy } from '@angular/common';
import { ModalComponent } from '@adapt/adapt-shared-component-lib';
import { PagesContentService } from '@adapt-apps/adapt-admin/src/app/auth/services/content/pages-content.service';
import { PageContentText } from '@adapt-apps/adapt-admin/src/app/admin/models/admin-content-text.model';
import { LiveAnnouncer } from '@angular/cdk/a11y';

interface ReportsFilter {
  search: string;
  status: string[];
  visibility: string[];
}

@Component({
  selector: 'adapt-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements AfterViewChecked, OnDestroy, AfterViewInit {
  ReportStatus = ReportVersion;

  Math = Math;
  reportsData: IReport[] = [];
  loading = true;

  public selectedReport?: IReport;

  @ViewChild(ReportModalComponent) reportModal?: ReportModalComponent;
  @ViewChild('unPublishModal') unPublishModal?: ModalComponent;
  @ViewChild('publishConfirmationModal') publishConfirmationModal?: ModalComponent;
  public reportStatuses = [
    { label: 'Draft', value: 'draft' },
    { label: 'Finalized', value: 'finalized' },
  ];

  public reportAudience = [
    { label: 'Internal', value: 'internal' },
    { label: 'External', value: 'external' },
  ];

  // public reports: Observable<IReport[]> = this.route.queryParams.pipe(
  //   switchMap((params) => {
  //     const search = params['search'] || '';
  //     this.page = parseInt(params['page'] || '1');
  //     const status = params['status'];
  //     const visibility = params['visibility'];
  //     this.sortDirection = params['sort'] || 'asc'

  //     this.reportFilters.setValue({search: search || '', status: status || '', visibility: visibility || '' })

  //     return this.route.data.pipe(
  //       map(
  //         (result) =>
  //         {

  //           const filtered = result['reportsResolver'].filter((item: IReport) => {
  //             const statusMatch = !status || item.version === status;
  //             const visibilityMatch = !visibility || item.visibility === visibility;
  //             const searchMatch =
  //               !search.length ||
  //               item.name.toLowerCase().includes(search) ||
  //               item.version.toLowerCase().includes(search) ||
  //               item.author.toLowerCase().includes(search);

  //             return statusMatch && searchMatch && visibilityMatch;
  //           }) as IReport[]

  //           filtered.sort((a, b) => this.sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))

  //           return filtered;
  //         }
  //       )
  //     );
  //   })
  // );

  // public statusCounts: Observable<[number, number, number, number]> =
  //   this.route.data.pipe(
  //     map((data) => {
  //       const items = data['reportsResolver'];
  //       this.maxPages = Math.max(1, Math.ceil(items.length / this.pageSize));
  //       return this._getStatusAndApprovalCounts(items);
  //     })
  //   );

  public reportFilters: FormGroup;

  public page = 1;
  public pageSize = 5;
  public maxPages = 1;
  public totalItems = 0;

  public reports = new BehaviorSubject<IReport[]>([]);
  public $reports: Observable<IReport[]> = this.reports.asObservable();

  public updatedSortDirection: 'asc' | 'desc' = 'desc';
  public alphaSortDirection: 'asc' | 'desc' = 'desc';
  focusSortBtn = sessionStorage.getItem('focusSortBtn') === 'true' ? true : false;
  public activeSort = 'updated';

  public statuses = [
    {
      label: 'Draft',
      value: 'draft',
    },
    {
      label: 'Finalized',
      value: 'finalized',
    },
  ];

  public visibilities = [
    {
      label: 'Internal',
      value: 'internal',
    },
    {
      label: 'External',
      value: 'external',
    },
  ];

  public unPublishJustificationForm: FormGroup;
  $pageContent = this.pagesContentService.getPageContentSignal('reports');

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private announcer: LiveAnnouncer,
    public role: RoleService,
    private location: LocationStrategy,
    public alert: AlertService,
    private filterPanelService: FilterPanelService,
    private dataService: AdaptDataService,
    public pagesContentService: PagesContentService
  ) {
    this.subscription = this.filterPanelService.currentFilterPanelState.subscribe((state) => {
      this.showFilterPanel = state;
    });

    this.unPublishJustificationForm = this.fb.group({
      justification: this.fb.control('', [Validators.required]),
    });

    this.reportFilters = this.fb.group({
      search: this.fb.control(''),
      status: this.fb.control([]),
      visibility: this.fb.control(''),
    });
  }

  private routeSub = this.route.queryParams.subscribe((params) => {
    // Update component state based on params if needed
    // TODO: conditional views for filtered state and active search, etc.

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.state?.['dataView']) {
      setTimeout(() => this.openModal(navigation?.extras.state?.['dataView']));
    }

    this.fetchReports();
  });

  public onPageSizeChange() {
    this.maxPages = Math.ceil(this.totalItems / this.pageSize);
  }

  fetchReports() {
    this.loading = true;

    this.dataService.getReports().subscribe((reports) => this.reports.next(reports));

    this.$reports = this.route.queryParams.pipe(
      switchMap((params) => {
        // Extract parameters
        const search = params['search'] || '';
        this.page = parseInt(params['page'] || '1');
        let status = params['status'];
        let visibility = params['visibility'];
        this.updatedSortDirection = params['updatedSort'] || 'desc';
        this.alphaSortDirection = params['alphaSort'] || 'desc';
        // if single status or visibility, convert to array

        if (status) {
          if (!Array.isArray(status)) {
            status = [status];
          }
        }
        if (visibility) {
          if (!Array.isArray(visibility)) {
            visibility = [visibility];
          }
        }
        this.reportFilters.setValue({
          search: search || '',
          status: status || [],
          visibility: visibility || [],
        });

        return this.reports.asObservable().pipe(
          map((reports) => {
            // Filter reports based on the status and visibility
            const filtered = reports.filter((item: IReport) => {
              const statusMatch = this.handleFilterParam(status, item.version);
              const visibilityMatch = this.handleFilterParam(visibility, item.visibility);
              const searchMatch =
                !search.length ||
                item.name.toLowerCase().includes(search) ||
                item.version.toLowerCase().includes(search) ||
                item.author.toLowerCase().includes(search);
              return statusMatch && searchMatch && visibilityMatch;
            }) as IReport[];

            // filtered.sort((a, b) =>
            //   this.sortDirection === 'asc'
            //     ? a.name.localeCompare(b.name)
            //     : b.name.localeCompare(a.name)
            // );

            filtered.sort((a, b) => {
              const updatedA = parseInt(a.updated, 10); // Convert the string to an integer
              const updatedB = parseInt(b.updated, 10);
              const alphaA = a.name;
              const alphaB = b.name;

              const sort = (a: any, b: any, type: string, direction: 'asc' | 'desc') => {
                const left = direction === 'asc' ? a : b;
                const right = direction === 'asc' ? b : a;

                switch (type) {
                  case 'string': {
                    return left.localeCompare(right);
                  }
                  case 'number': {
                    return left - right;
                  }
                }
              };

              const sortResult = this.activeSort === 'updated' ? 
                sort(updatedA, updatedB, 'number', this.updatedSortDirection) : 
                sort(alphaA, alphaB, 'string', this.alphaSortDirection);

              return sortResult;
            });
            
            if (this.focusSortBtn) {
              const sortBtn = document.getElementById('sortButton');
              if (sortBtn) {
                sortBtn.focus();
                sessionStorage.removeItem('focusSortBtn');
              }
            }

            // Store the processed data for later use
            this.reportsData = filtered;
            // Update maxPages for pagination
            this.maxPages = Math.max(1, Math.ceil(this.reportsData.length / this.pageSize));
            this.totalItems = this.reportsData.length;
            this.loading = false;


            return filtered;
          })
        );
      })
    );
  }

  // Filter panel toggle service logic
  private subscription: Subscription;
  public showFilterPanel = false;
  filterStatusMessage = '';
  filterStateMessage = '';
  originalFilters!: ReportsFilter;

  toggleFilterPanel(close = false) {
    this.showFilterPanel = !this.showFilterPanel;
    if (close) this.showFilterPanel = false;
    if (this.showFilterPanel) {
      this.originalFilters = this.reportFilters.getRawValue();
      this.filterStateMessage = 'Filter panel opened.';
    } else this.filterStateMessage = 'Filter panel closed.';
    this.filterPanelService.changeFilterPanelState(this.showFilterPanel);
  }

  public applyFilters(announce = false) {
    sessionStorage.setItem('focusSortBtn', true.toString());
    this.toggleFilterPanel(true);
    this.router.navigate(['./'], {
      queryParams: {
        updatedSort: this.updatedSortDirection,
        alphaSort: this.alphaSortDirection,
        ...this.reportFilters.getRawValue(),
      },
      relativeTo: this.route,
      queryParamsHandling: 'merge',
    });
    if (announce) this.filterStatusMessage = 'Filters have been applied.';
  }

  ngOnInit(): void {
    //console.log('Inside reports component ngOnInit');
  }

  ngAfterViewInit(): void {
    const state = this.location.getState() as any;
    if ('report' in state) {
      this.reportModal?.open(undefined, state.report, state.report.page);
    }
  }

  // private _getStatusAndApprovalCounts(
  //   items: IReport[]
  // ): [number, number, number, number] {
  //   const counts = new Array(4).map((item) => 0) as [
  //     number,
  //     number,
  //     number,
  //     number
  //   ];

  //   for (const item of items) {

  //     switch (item.version) {
  //       case 'draft': {
  //         counts[ReportVersion.DRAFT]++;
  //         break;
  //       }
  //       case 'published': {
  //         counts[ReportVersion.FINALIZED]++;
  //         break;
  //       }
  //       case 'unpublished': {
  //         counts[ReportVersion.ARCHIVED]++;
  //         break;
  //       }
  //     }

  //     if (item.approval === 'pending') {
  //       counts[counts.length - 1]++;
  //     }
  //   }

  //   return counts;
  // }

  public doSort(what: 'alpha' | 'updated') {
    if (what === 'alpha') {
      this.alphaSortDirection = this.alphaSortDirection === 'asc' ? 'desc' : 'asc';
    } else if (what === 'updated') {
      this.updatedSortDirection = this.updatedSortDirection === 'asc' ? 'desc' : 'asc';
    }

    this.filterStatusMessage = 'Sort has been applied.';
    this.focusSortBtn = true;
    this.activeSort = what;
    this.applyFilters();
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }

  public openModal(dataView?: DataView) {
    if (!this.reportModal) return;
    this.reportModal.open(dataView);
  }

  private handleFilterParam(param: string | string[], value: string) {
    if (!param?.length) return true;

    if (Array.isArray(param)) {
      return param.includes(value);
    }

    return param === value;
  }

  public get status() {
    return this.reportFilters.get('status') as FormControl;
  }

  ngOnDestroy() {
    // Close filter panel if open and the user navigates away
    this.filterPanelService.changeFilterPanelState(false);
    this.subscription.unsubscribe();
    this.routeSub.unsubscribe();
  }

  public startUnPublish(report: IReport) {
    this.unPublishModal?.open();
    this.selectedReport = report;
  }

  public publishReport() {
    this.publishConfirmationModal?.close();
    this.dataService.startReportPublish(this.selectedReport!).subscribe({
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
    if (!this.selectedReport) return;
    this.unPublishModal?.close();
    this.dataService
      .unPublishReport(this.selectedReport, this.unPublishJustificationForm.get('justification')?.value)
      .subscribe({
        next: () => {
          this.alert.add({
            type: 'success',
            title: 'Report Un-Publish Success',
            body: 'Report has been un-published.',
          });
          this.router.navigate(['..', this.selectedReport!.reportID], {
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
}
