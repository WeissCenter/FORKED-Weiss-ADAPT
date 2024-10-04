import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Observable, Subscription, tap } from 'rxjs';
import { Permission, RoleService } from '../../../auth/services/role/role.service';
import { FilterPanelService } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/services/filterpanel.service';
import { ActivatedRoute } from '@angular/router';
import { DataViewModalComponent } from '../data-view-modal/data-view-modal.component';
import { DataSourceModalComponent } from '../data-source-modal/data-source-modal.component';

@Component({
  selector: 'adapt-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListViewComponent implements OnDestroy, OnInit {
  Permission = Permission;

  @Output() createButtonClick = new EventEmitter();

  @Input() $reports!: any;
  @Input() $dataViews!: any;
  @Input() public dataList?: Observable<any[]>;
  @Input() public loadingText = 'Loading...';

  // content refs

  @Input() public visibleRef?: TemplateRef<unknown>;
  @Input() public collapsedRef?: TemplateRef<unknown>;
  @Input() public actionRef?: TemplateRef<unknown>;
  @Input() public loadingRef?: TemplateRef<unknown>;
  @Input() public currentList: 'sources' | 'views' | 'users' = 'sources';
  @Input() public recentSortField = 'created';

  @Input() public sortIcon = 'fa-sort-amount';
  @Input() public altIcon = true;

  @Input() dataViewModal!: any;
  @Input() dataSourceModal!: DataSourceModalComponent;

  public page = 1;
  public query = '';
  public maxPages = 1;
  public pageSize = 5;
  @Input() sortDirection: 'asc' | 'desc' = 'desc';
  public showFilterPanel = false;
  public totalItems = 0;
  private subscriptions: Subscription[];

  public dataListTap?: Observable<any[]>;

  toggleFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
    this.filterPanelService.changeFilterPanelState(this.showFilterPanel);
  }

  constructor(
    public role: RoleService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private filterPanelService: FilterPanelService
  ) {
    this.subscriptions = [];
    this.subscriptions[0] = this.filterPanelService.currentFilterPanelState.subscribe((state) => {
      this.showFilterPanel = state;
    });
  }

  // Define the trackBy function
  identify(index: number, item: any): any {
    return item.id; // or any unique identifier property of your item
  }

  public icon() {
    const alt = this.altIcon ? '-alt' : '';
    return (this.sortDirection === 'asc' ? this.sortIcon + '-up' : this.sortIcon + '-down') + alt;
  }

  ngOnInit(): void {
    this.dataListTap = this.dataList?.pipe(
      tap((list) => {
        this.totalItems = list.length;
        this.maxPages = Math.ceil(list.length / this.pageSize);
        this.cd.markForCheck();
      })
    );

    const pageSub = this.route.queryParams.subscribe((params) => {
      let page = 1;
      try {
        page = parseInt(params['page']);
      } catch (err) {
        page = 1;
      }

      this.page = isNaN(page) ? 1 : page;
    });

    this.subscriptions.push(pageSub);
  }

  track(idx: number, item: any) {
    return item.id;
  }

  public onPageSizeChange() {
    this.maxPages = Math.ceil(this.totalItems / this.pageSize);
  }

  public doSort() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
