import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { BehaviorSubject, Observable, Subject, debounceTime, map } from 'rxjs';

@Component({
  selector: 'adapt-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements AfterContentChecked, AfterViewInit {
  private _container?: ElementRef<HTMLDivElement>;

  @ViewChild('container') set container(ctn: ElementRef<HTMLDivElement>) {
    this.width = ctn.nativeElement.clientWidth - 50;
    this._container = ctn;
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event: any) {
    this._resize.next(event);
  }

  @Input() report: any;

  @Input() content: any;

  @Input() filterSubject?: BehaviorSubject<any[]>;

  @Input() layout = 'horizontal';

  public filterSubjectObservable?: Observable<any[]>;

  public width = 0;
  public height = 600;

  private _resize: Subject<any> = new Subject();

  constructor(private cd: ChangeDetectorRef) {
    this._resize.pipe(debounceTime(100)).subscribe(() => {
      if (this._container) {
        this.width = this._container.nativeElement.clientWidth - 50;
      }
    });
  }

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

        const filtered = this.content['chart']['data'].filter((data: any) =>
          filters.every((filter) => {
            if (Array.isArray(filter)) {
              return filter.every((ft) => data[filterLabel] === ft || !ft.length);
            }

            return data[filterLabel] === filter || !filter.length;
          })
        );

        const max = Math.max(...filtered.map((data: any) => data[this.content['chart']['yAxisValue']]));
        const sum = filtered.reduce((accum: number, data: any) => accum + data[this.content['chart']['yAxisValue']], 0);

        return filtered.map((data: any) => ({
          ...data,
          percentage: ((data[this.content['chart']['yAxisValue']] / sum) * 100).toFixed(2),
          flex: data[this.content['chart']['yAxisValue']] / max,
        }));
      })
    );
  }

  ngAfterContentChecked(): void {
    this.cd.detectChanges();
  }
}
