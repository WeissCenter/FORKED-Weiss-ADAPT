import { CUSTOM_ELEMENTS_SCHEMA, Inject, makeEnvironmentProviders, NgModule, PLATFORM_ID } from '@angular/core';

import { ViewerSidebarComponent } from './components/sidebar/sidebar.component';
import { API_URL, LibModule, provideAPIURL } from '@adapt/adapt-shared-component-lib';
import { ViewerFooterComponent } from './components/footer/viewer-footer.component';
import { TopBannerComponent } from './components/banner/top-banner.component';
import { AsyncPipe, CommonModule } from '@angular/common';
import { HomeComponent } from './pages/home/home.component';
import { BrandingHeaderComponent } from './components/branding-header/branding-header.component';
import { WeissAccessibilityCenterModule } from 'weiss-accessibility-center';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ResourcesComponent } from './pages/resources/resources.component';
import { RouterModule } from '@angular/router';
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportComponent } from './pages/report/report.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { ErrorComponent } from './pages/error/error.component';

@NgModule({
  declarations: [

    HomeComponent,
    ViewerSidebarComponent,
    BrandingHeaderComponent,
    TopBannerComponent,
    ViewerFooterComponent,
    ResourcesComponent,
    ReportComponent,
    ReportsComponent,
    ErrorComponent,
  ],
  exports: [
    HomeComponent,
    ViewerSidebarComponent,
    BrandingHeaderComponent,
    ViewerFooterComponent,
    TopBannerComponent,
    WeissAccessibilityCenterModule,
  ],
  imports: [
    CommonModule,
    WeissAccessibilityCenterModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.OFF, enableSourceMaps: false }),
    LibModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
