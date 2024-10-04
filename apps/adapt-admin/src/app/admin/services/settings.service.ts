import { AdaptSettings, Response } from '@adapt/types';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { AdaptDataService } from '../../services/adapt-data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'apps/adapt-admin/src/environments/environment';
import { UserService } from '../../auth/services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private _settings = new BehaviorSubject<AdaptSettings>({
    logo: '',
    footerLinks: [],
    copyright: '',
    idleMinutes: 5,
    timeoutMinutes: 120,
    warningMinutes: 120,
  });

  constructor(private http: HttpClient) {

  }

  public next(val: AdaptSettings) {
    return this._settings.next(val);
  }

  public getSettings() {
    return this._settings.getValue();
  }

  public getSettingsObservable() {
    return this._settings.asObservable();
  }
}
