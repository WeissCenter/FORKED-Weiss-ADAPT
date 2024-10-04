import { Alert } from '@adapt/types';
import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private _alertQueue: Subject<Alert> = new ReplaySubject();

  public add(alert: Alert) {
    this._alertQueue.next(alert);
  }

  public get alertQueue() {
    return this._alertQueue;
  }
}
