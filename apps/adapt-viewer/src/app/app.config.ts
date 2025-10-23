import { ApplicationConfig, makeEnvironmentProviders } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withNoHttpTransferCache } from '@angular/platform-browser';
import { provideAPIURL, provideContentServiceConfig } from '@adapt/adapt-shared-component-lib';
import { environment } from '../environments/environment';
//import { provideContentServiceConfig } from '@adapt/adapt-shared-component-lib';
//import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideContentServiceConfig({appDomain: environment.appDomain, contentRoot: environment.contentRoot, contentFileName: environment.contentFileName}),
    provideAPIURL(environment.API_URL),
    provideClientHydration(),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(withFetch()),
  ],
};
