import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, concat, map, of, switchMap, tap, zip } from 'rxjs';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { DataSet, DataSource, DataViewModel, IReportModel } from '@adapt/types';
import { PagesContentService } from '../../../auth/services/content/pages-content.service';
import { ImpactAnalysisContentText } from '../../models/admin-content-text.model';

@Component({
  selector: 'adapt-impact-analysis',
  standalone: false,
  templateUrl: './impact-analysis.component.html',
  styleUrls: ['./impact-analysis.component.scss'],
})
export class ImpactAnalysisComponent implements OnInit {
  @Output() learnMore = new EventEmitter<string>();

  @Input() type: 'DataSource' | 'DataView' | 'Glossary' = 'DataSource';
  @Input() id = '';
  @Input() name = '';

  @Input() headingLevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h3';

  public $content = computed(() => {
    return this.contentService.getSharedContentSignal()()?.impactAnalysis;
  })

  public dataViewCount = 0;
  public reportCount = 0;
  public pageSize = 5;
  public maxPages = 0;
  public totalItems = 0;
  public page = 1;

  @Input() dataViews?: Observable<DataViewModel[]>;
  @Input() reports?: Observable<IReportModel[]>;
  @Input() inAccordion = false;

  public items?: Observable<any[]>;

  constructor(private data: AdaptDataService, private contentService: PagesContentService) {}

  ngOnInit(): void {
    switch (this.type) {
      case 'DataSource': {
        if (!this.dataViews || !this.reports) return;

        this.items = this.dataViews.pipe(
          switchMap((views) => {
            const dataViews = views.filter((view) => view?.data?.dataSource === this.id);

            return zip(dataViews.map((vt) => this.getImpactAnalysisForView(vt))).pipe(
              map((val) => {
                (this.dataViewCount = dataViews.length),
                  (this.reportCount = val.reduce((accum, item) => accum + item.reports.length, 0));

                return val;
              })
            );
          })
        );

        break;
      }
      case 'DataView': {
        if (!this.reports) return;

        this.items = this.getImpactAnalysisForViewId(this.id).pipe(
          tap((reports: IReportModel[]) => {
            this.reportCount = reports.length;
            this.totalItems = reports.length;
            this.maxPages = Math.ceil(this.totalItems / this.pageSize);
          })
        );
        break;
      }
      case 'Glossary': {
        break;
      }
    }
  }

  public onPageChange(page: number){
    this.page = page;
  }

  public onPageSizeChange($event: any) {
    $event.preventDefault();
    $event.stopImmediatePropagation();
    this.pageSize = $event.target.value;
    this.maxPages = Math.ceil(this.totalItems / this.pageSize);
  }

  public getImpactAnalysisForViewId(dataViewID: string) {
    if (!this.reports) return of([]);
    return this.reports.pipe(map((reports: IReportModel[]) => reports.filter((report) => report.dataView === dataViewID)));
  }

  public getImpactAnalysisForView(view: DataViewModel) {
    return this.reports!.pipe(
      map((reports) => ({ view, reports: reports.filter((report) => report.dataView === view.dataViewID) }))
    );
  }
}
