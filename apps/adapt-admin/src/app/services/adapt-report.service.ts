import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, filter, firstValueFrom, map, Observable, ReplaySubject, take } from 'rxjs';
import {
  CreateReportInput,
  DataViewModel,
  IReportModel,
  REPORT_PUBLISH_STATUS,
  Response as APIResponse,
} from '@adapt/types';
import { NGXLogger } from 'ngx-logger';
import { UserService } from '@adapt-apps/adapt-admin/src/app/auth/services/user/user.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@adapt-apps/adapt-admin/src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AdaptReportService implements OnDestroy {

  private pollingIntervalId: any;
  private pollingTimeoutId: any;
  private stillHaveOutstandingReportStatuses = false;

  private loadingReports = false;
  private _reports = new BehaviorSubject<IReportModel[]>([]);
  //public $reports: Observable<IReportModel[]> = this._reports.asObservable();

  constructor(private logger: NGXLogger,
              private user: UserService,
              private http: HttpClient,) {

    this.logger.debug('Inside AdaptReportService service constructor');

    this.user.isLoggedIn$
      .pipe(
        filter((val) => val),
        take(1)
      )
      .subscribe(() => {
        this.loadReportList();
      });
  }

  public loadReportList() {
    this.logger.debug('Inside AdaptReportService service loadReportList');

    //reset
    this.stillHaveOutstandingReportStatuses = false;
    this.loadingReports = true;

    // this.http.get<APIResponse<IReportModel[]>>(`${environment.API_URL}report`)
    //   .pipe(map((result) => result.data))
    //   .subscribe((reports) => this._reports.next(reports));

    this.http.get<APIResponse<IReportModel[]>>(`${environment.API_URL}report`).subscribe((response) => {

      this.logger.debug('loadReportList response: ', response);
      this.loadingReports = false;  // done loading views
      if (response.success && response.data){

        this._reports.next(response.data);

        // Start the interval, calling pollDataViewsInProgress every 2 second (delayTime).
        this.startPollingReportStatuses(response.data);
      }
      else {
        this.logger.error('ERROR: Unable to loadDataViewList');
      }

    });


  }

  public startPollingReportStatuses(currentReportList: IReportModel[] | null = null) {
    this.logger.debug('Inside AdaptReportService service startPollingReportStatuses');

    const delayTime = 5000; // 3 seconds: this is the time we delay in milliseconds between polling's
    const maxPolingTime = 1000*60; // 120 seconds: this is the time in milliseconds that we will wait for the data to be polled, so after this time all poling will stop
    const expireDays = 1; //3; 30 - Anything older than this amound of days will not be polled

    // make sure we do not have any other polling going on before we start a new polling session
    this.stopPollingReportStatuses();

    if (!currentReportList){
      this.logger.debug('No currentReportList so get it from the BehaviorSubject');
      currentReportList = this._reports.getValue();
    }

    this.pollingIntervalId = setInterval(() => {
      this.logger.debug('maxPolingTime reached, so stop polling');
      this.pingReportsInProgress(currentReportList, expireDays);
    }, delayTime);


    // After maxPolingTime seconds, clear the interval using the stored intervalId.
    this.pollingTimeoutId = setTimeout(() => {
      this.stopPollingReportStatuses();
    }, maxPolingTime);

  }

  /**
   * Stop the polling interval.
   * Clear the interval to prevent memory leaks when the component is destroyed
   * @private
   */
  private stopPollingReportStatuses() {
    this.logger.debug('Inside AdaptReportService service stopPollingReportStatuses');

    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }

    if (this.pollingTimeoutId) {
      clearTimeout(this.pollingTimeoutId);
      this.pollingTimeoutId = null;
    }
  }

  public isPolling(): boolean{
    this.logger.debug('Inside AdaptReportService service isPolling; ', !!this.pollingIntervalId, ', loadingReports: ', this.loadingReports);

    return !!this.pollingIntervalId || this.loadingReports;

    /*
    Purpose of the Double Bang Operator (!!)
      The !! operator is used to explicitly cast any JavaScript value to its corresponding boolean equivalent (true or false). It works by:

        First !: Negating the truthiness of the value. If the value is truthy (e.g., a non-empty string, a non-zero number, an object),
        it becomes false. If the value is falsy (e.g., 0, null, undefined, empty string, false), it becomes true.

        Second !: Negating the result of the first negation, effectively converting the original value into its strict boolean
        representation without flipping its truthiness.
     */
  }

  private async pingReportsInProgress(reportList: IReportModel[], expireDays: number) {
    this.logger.debug('Inside AdaptReportService service pingReportsInProgress');

    const today = new Date().getTime(); // time in milliseconds
    const dayInMilliseconds = 1000 * 60 * 60 * 24 * 1;  // This is one day converted to milliseconds
    const expireTime = dayInMilliseconds * expireDays

    //this.logger.debug('expireTime: ', expireTime, ', today: ', today);

    for (const iReport of reportList) {

      const daysOld = (today - Number(iReport.updated!))/dayInMilliseconds;
      const updatedTimestamp = Number(iReport.updated!);

      //this.logger.debug('Found Status: ', iReport.status, ', version: ', iReport.version, ', updatedTimestamp: ',  new Date(updatedTimestamp), ', daysOld: ', daysOld);

      // Check to see if we have any reports that are in progress
      if (iReport.version === 'draft' &&
          iReport.status === REPORT_PUBLISH_STATUS.PROCESSING || iReport.status === REPORT_PUBLISH_STATUS.REQUESTED){

        this.logger.debug(`Check draft iReport[${iReport.name}] status: ${iReport.status}`);

        // if the report was generated less than this.expireDays days ago, then check if it is still in progress
        if (iReport.updated && ((today - updatedTimestamp) < expireTime)){

          this.logger.debug(`Load iReport[${iReport.reportID}]`);

          try{
            const reportUpdatedResponse: IReportModel | IReportModel[] | undefined = await firstValueFrom(
              this.getReport(iReport.reportID, 'draft', 'en')
            );
            //.catch((err) => { });

            // .subscribe((dataViewUpdatedDataResponse) => {

            this.processReportUpdateResponse(iReport, reportUpdatedResponse, reportList);

            // });
          }
          catch (error){
            this.logger.error(`ERROR: Unable to load iReport[${iReport.name}], error: `, error);
          }

        }
        else {
          this.logger.debug(`Skip iReport[${iReport.name}]${iReport.status} it was generated more than ${daysOld} days ago`);

          iReport.status = REPORT_PUBLISH_STATUS.FAILED; //If we did not get an update after the expired time we assume the reports publication failed
        }

      }

    }

    if (this.stillHaveOutstandingReportStatuses){
      this.logger.debug('Still have outstanding statuses so keep polling for report statuses');
    }
    else {
      this.logger.debug('No more outstanding statuses so stop polling for report statuses');
      this.stopPollingReportStatuses();
    }


  }

  private processReportUpdateResponse(iReport: IReportModel, reportUpdatedResponse: IReportModel | IReportModel[] | undefined, reportList: IReportModel[]) {
    this.logger.debug('Inside AdaptReportService service processReportUpdateResponse');

    this.logger.debug(`Response for iReport[${iReport.reportID}]: `,reportUpdatedResponse);

    // also check updated Date
    if (reportUpdatedResponse){

      let updatedReport: IReportModel | IReportModel[];

      // if we get an array back take the first one
      if (Array.isArray(reportUpdatedResponse)){
        this.logger.error(`ERROR: Unable to load iReport[${iReport.reportID}]`);
        updatedReport = reportUpdatedResponse[0];
      }
      else {
        updatedReport = reportUpdatedResponse;
      }

      const lastUpdatedDate = new Date(Number(updatedReport.updated));

      this.logger.debug(`Got updated iReport[${iReport.name}] with lastUpdatedDate: `, lastUpdatedDate, ', previous: ', iReport.status, ', current: ', updatedReport.status);

      // if (dataView){
      //   this.logger.debug('Update status to TESTING');
      //   dataView.status = 'TESTING';
      // }

      //we are only interested in draft reports with a status
      if (updatedReport.status && (updatedReport.status !== iReport.status) ){
        this.logger.debug(`Update iReport[${iReport.name}] status: `, iReport.status, ' to ', updatedReport.status);


        // now if a draft report comes back as published we have to reload all reports as we need to drop the draft version and get the finalized version
        if (updatedReport.status === REPORT_PUBLISH_STATUS.PUBLISHED){

          this.stillHaveOutstandingReportStatuses = false;  // stop polling until after we have reloaded the newly refreshed list
          this.loadReportList();
        }
        else {
          iReport.status = updatedReport.status;
          // notify all listeners of the new updated status
          this._reports.next(reportList);
        }

        // If the status is still processing or unpublished, we want to let dady know that we need to keep on polling
        if (iReport.status === REPORT_PUBLISH_STATUS.PROCESSING || iReport.status === REPORT_PUBLISH_STATUS.REQUESTED){
          this.stillHaveOutstandingReportStatuses = true;
        }
      }
    }
    else {
      this.logger.error(`ERROR: Unable to load iReport[${iReport.reportID}]`);
    }

  }

  public getReportsListener(): Observable<IReportModel[]> {
    this.logger.debug('Inside getReportsListener');
    return  this._reports.asObservable();  //this.$reports;
  }

  // public refreshReports() {
  //   this.logger.debug('Inside refreshReports');
  //
  //   this.http.get<APIResponse<IReportModel[]>>(`${environment.API_URL}report`)
  //     .pipe(map((result) => result.data))
  //     .subscribe((reports) => {
  //       this.logger.debug('got refreshReports response and notify listeners of new updated list');
  //       this._reports.next(reports)
  //     });
  // }

  public createReport(report: CreateReportInput) {
    this.logger.debug('Inside createReport, report: ', report);

    return this.http.post<APIResponse<string>>(`${environment.API_URL}report`, report)
      .pipe(map((result) => result.data));
  }

  public getReport(id: string, version = 'draft', lang?: string): Observable<IReportModel[] | undefined> {
    this.logger.debug('Inside getReport, id: ', id, ', version: ', version, ', lang: ', lang);

    const url = `${environment.API_URL}report/${id}`;
    let params = new HttpParams().append('version', version);

    if(lang){
      params = params.append('lang', lang)
    }

    this.logger.debug('url: ', url, params);

    return this.http.get<APIResponse<IReportModel[]>>(url, { params})
      .pipe(map((response) => {

        if (response.success && response.data){
          return response.data;
        }
        return [];

      }));
  }

  public getReportData(id: string, version = 'draft', filters = {}, suppressed = false, lang = 'en', pageId?: string){

    this.logger.debug('Inside getReportData, id: ', id, ', version: ', version, ', lang: ', lang);

    let params = new HttpParams();

    params = params.append('version', version)

    params = params.append('suppressed', suppressed)
    params = params.append('lang', lang)
    if (pageId !== undefined) {
      params = params.append('pageId', pageId)
    }
    return this.http
      .post<APIResponse<any>>(`${environment.API_URL}report/${id}/data`, filters, {params})
      .pipe(map((result) => result.data));
  }

  public editReport(report: {reportID: string, languages: {[lang: string] : IReportModel}}) {
    this.logger.debug('Inside editReport, report: ', report);
    return this.http
      .put<APIResponse<IReportModel>>(`${environment.API_URL}report/${report.reportID}`, report)
      .pipe(map((result) => result.data));
  }

  public startReportPublish(report: IReportModel) {
    this.logger.debug('Inside startReportPublish, report: ', report);

    // First get the current list of reports
    const currentReportList = this._reports.getValue();

    // Next, filter out the newly added report just for incase we have a duplicate
    const listOfReportsWithoutThisPublishedReport = currentReportList.filter((r) => r.reportID !== report.reportID);

    // Update status to indicate that a publishing request was made
    report.status = REPORT_PUBLISH_STATUS.REQUESTED;
    // add to the beginning of the list
    listOfReportsWithoutThisPublishedReport.unshift(report);

    // notify the UI that we have a newly updated report
    this._reports.next(listOfReportsWithoutThisPublishedReport);

    return this.http.post<APIResponse<string>>(`${environment.API_URL}report/${report.reportID}/publish`, {});
  }

  public unPublishReport(report: IReportModel, justification = '') {

    this.logger.debug('Inside unPublishReport, report: ', report);

    return this.http.post<APIResponse<string>>(`${environment.API_URL}report/${report.reportID}/unpublish`, {
      justification,
    });
  }

  ngOnDestroy() {
    this.logger.debug('Inside AdaptReportService service ngOnDestroy');
    // Clear the interval to prevent memory leaks when the component is destroyed
    this.stopPollingReportStatuses();
  }
}
