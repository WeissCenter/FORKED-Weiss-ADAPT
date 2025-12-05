import { Component, Inject } from '@angular/core';
import { EMPTY, Observable, concat, concatMap, delay, filter, of, switchMap, tap, timer } from 'rxjs';
import { Alert } from '@adapt/types';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'lib-adapt-alert',
  standalone: false,
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent {
  private delayed$ = of(null as any).pipe(delay(5000));

  public alerts$: Observable<Alert>;

  constructor(@Inject(AlertService) private alert: AlertService) {

    this.alerts$ = this.alert.alertQueue
      .pipe(concatMap((v) => concat(of(v), this.delayed$)))
      .pipe(filter((v) => v != null))
      .pipe(switchMap((source) => concat(of(source), of(null).pipe(delay(5000)))));
  }
}
