import { CONTENT_LOCATION } from '@adapt/adapt-shared-component-lib';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private _content = new ReplaySubject<any>();
  public $content = this._content.asObservable();

  constructor(private http: HttpClient,  @Inject(CONTENT_LOCATION) public defaultContent: string,) {
    this.http.get(defaultContent).subscribe((result) => {
      this._content.next(result);
    });
  }

  loadContent(defaultContentFilePath: string): Observable<any>{
    return this.http.get(defaultContentFilePath);
  }
}
