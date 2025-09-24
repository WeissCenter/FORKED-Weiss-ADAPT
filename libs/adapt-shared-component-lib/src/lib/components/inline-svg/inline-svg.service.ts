import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InlineSvgService {
  constructor(private http: HttpClient) {}

  getSvg(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'text' });
  }
}
