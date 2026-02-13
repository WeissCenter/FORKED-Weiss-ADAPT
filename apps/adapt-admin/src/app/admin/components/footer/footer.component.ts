import { Component, effect } from '@angular/core';
import { SettingsService } from '@adapt/adapt-shared-component-lib';
import { environment } from '../../../../environments/environment';
import { ReleaseNoAndDateResponse } from '@adapt/types';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'adapt-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  public year = new Date().getFullYear();
  public copyrightText = environment.copyrightText || 'AEM Corporation.';

  public appReleaseLoaded: boolean = false;
  public appReleaseNo: string;
  public appReleaseDate: string;

  public backendReleaseNo: string;
  public backendReleaseDate: string;

  public $settings = this.settings.getSettingsSignal();

  constructor(private logger: NGXLogger,
              private http: HttpClient,
              public settings: SettingsService) {

    // The variable APP_RELEASE is set during the nx build process using environment variables, for example,
    // for development run the following command: NX_APP_RELEASE="1234" NX_APP_RELEASE_DATE="date-time" npx nx serve adapt-admin
    this.appReleaseNo = process.env['NX_APP_RELEASE'] || 'UNKNOWN';
    this.appReleaseDate = process.env['NX_APP_RELEASE_DATE'] || 'UNKNOWN';
    this.logger.debug('APP_RELEASE: ' + this.appReleaseNo + this.appReleaseDate);

    this.getReleaseNoAndDate().subscribe({
      next: (response) => {
        /* handle success */
        this.backendReleaseNo = response.releaseNo || 'UNKNOWN';
        this.backendReleaseDate = response.releaseDate || 'UNKNOWN';

        this.logger.debug('backendReleaseNo: ', this.backendReleaseNo, ', backendReleaseDate: ', this.backendReleaseDate);
      },
      error: (error) => {
        this.logger.error('getReleaseNoAndDate: An error occurred: ', error);

        this.backendReleaseNo = 'ERROR';
        this.backendReleaseDate = 'ERROR';

      } // Handle the error here
    }).add(() => {
      this.logger.debug('getReleaseNoAndDate successfully completed');
      this.appReleaseLoaded = true;
    });
  }

  public getReleaseNoAndDate() {
    this.logger.debug('Inside getReleaseNoAndDate');

    const url = `${environment.API_URL}release`;
    this.logger.debug('url: ', url);

    return this.http.get<ReleaseNoAndDateResponse>(url);
  }

}
