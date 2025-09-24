import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

/*
  Basic adapter service to add storage support for browser storages in server context

*/

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _localStorage: Map<string, string>;
  private _sessionStorage: Map<string, string>;

  private _isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platform: string) {
    this._isBrowser = isPlatformBrowser(this.platform);
    if (!this._isBrowser) {
      this._localStorage = new Map();
      this._sessionStorage = new Map();
    }
  }

  public setItem(storage: 'session' | 'local', key: string, data: string) {
    if (!this._isBrowser) {
      storage === 'session' ? this._sessionStorage.set(key, data) : this._localStorage.set(key, data);
      return;
    }

    storage === 'session' ? sessionStorage.setItem(key, data) : localStorage.setItem(key, data);
  }

  public getItem(storage: 'session' | 'local', key: string) {
    if (!this._isBrowser) {
      return storage === 'session' ? this._sessionStorage.get(key) : this._localStorage.get(key);
    }

    return storage === 'session' ? sessionStorage.getItem(key) : localStorage.getItem(key);
  }
}
