import { IReportModel, getPercentage } from '@adapt/types';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { AdaptDataService } from '../../../services/adapt-data.service';

@Component({
  selector: 'adapt-count-breakdown',
  standalone: false,
  templateUrl: './count-breakdown.component.html',
  styleUrls: ['./count-breakdown.component.scss'],
})
export class CountBreakdownComponent implements AfterViewInit {
  getPercentage = getPercentage;

  @Input() report: any;

  @Input() content: any;

  @Input() filterSubject?: BehaviorSubject<any[]>;

  public filterSubjectObservable?: Observable<any[]>;

  ngAfterViewInit(): void {
    if (!this.filterSubject) {
      this.filterSubject = new BehaviorSubject<any[]>([]);
    }

    this.filterSubjectObservable = this.filterSubject.pipe(
      map((filters) => {
        const filterLabel =
          this.content['chart']['filterOn'] === 'x'
            ? this.content['chart']['xAxisValue']
            : this.content['chart']['yAxisValue'];

        return this.content['chart']['data'].filter((data: any) =>
          filters.every((filter) => {
            if (Array.isArray(filter)) {
              return filter.every((ft) => data[filterLabel] === ft || !ft.length);
            }

            return data[filterLabel] === filter || !filter.length;
          })
        );
      })
    );
  }
}
