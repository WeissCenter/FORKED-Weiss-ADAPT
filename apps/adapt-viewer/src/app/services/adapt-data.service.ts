import { LanguageService, SettingsService } from '@adapt/adapt-shared-component-lib';
import { environment } from '../../environments/environment';
import { AdaptSettings, IReportModel, Response, ShareReport, ViewerTemplate } from '@adapt/types';
import { HttpClient } from '@angular/common/http';
import { effect, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdaptDataService {
  private _reports = new BehaviorSubject<IReportModel[]>([]); //ReplaySubject<IReportModel[]>();
  private $reports = this._reports.asObservable();

  constructor(private http: HttpClient, private settings: SettingsService, private language: LanguageService) {
    effect(() => {
      const language = this.language.$language();
      this.getReports(language).subscribe((reports) => {
        this._reports.next(reports);
      });

    });
  }

  public getReports(
    lang: string = 'en',
    sortBy: 'updated' | 'alpha' = 'updated',
    sortDirection: 'asc' | 'desc' = 'desc'
  ) {
    console.log(`inside getReports with lang=${lang}`);
    return this.http.get<Response<IReportModel[]>>(`${environment.API_URL}reports?lang=${lang}`).pipe(
      map((resp) => resp.data),
      tap((reports) => console.log('fetched reports index 0:', reports[0])),
      map((reports) =>
        [...reports].sort((a, b) => {
          if (sortBy === 'updated') {
            const updatedA = Number(a.published);
            const updatedB = Number(b.published);
            return sortDirection === 'asc' ? updatedA - updatedB : updatedB - updatedA;
          }
          if (sortBy === 'alpha') {
            return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
          }
          return 0;
        })
      )
    );
  }

  public getReport(slug: string, lang = 'en') {
    return this.http
      .get<Response<IReportModel>>(`${environment.API_URL}reports/${slug}?lang=${lang}`)
      .pipe(map((resp) => resp.data));
  }

  public getData(slug: string, filters: Record<string, any>, lang = 'en') {
    return this.http
      .post<Response<ViewerTemplate>>(`${environment.API_URL}reports/${slug}/data?lang=${lang}`, filters)
      .pipe(map((resp) => resp.data));
  }

  public shareReport(reportSlug: string, filters: Record<string, any>, tabIndex: number) {
    return this.http
      .post<Response<string>>(`${environment.API_URL}reports/share`, { reportSlug, filters, tabIndex })
      .pipe(map((result) => result.data));
  }

  public loadSharedReport(shareSlug: string) {
    return this.http
      .get<Response<ShareReport>>(`${environment.API_URL}reports/share/${shareSlug}`)
      .pipe(map((result) => result.data));
  }

  public getReportsListener(): Observable<IReportModel[]> {
    //this.logger.debug('Inside getReportsListener');
    return  this._reports.asObservable();  //this.$reports;
  }

  public get reports() {
    return this.$reports;
  }
}
