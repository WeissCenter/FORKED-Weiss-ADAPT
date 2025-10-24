import { ApplicationConfig, isDevMode } from '@angular/core';
import {
  InMemoryScrollingOptions,
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
} from '@angular/router';
import { provideNgIdleKeepalive } from '@ng-idle/keepalive';
import { appRoutes } from './app.routes';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { CognitoService } from './auth/services/cognito/cognito.service';
import { AuthInterceptor } from './auth/interceptors/auth-interceptor';
import { provideAPIURL, provideContentServiceConfig } from '@adapt/adapt-shared-component-lib';
import { environment } from '../environments/environment';
import { provideEnvironmentNgxMask } from 'ngx-mask'
const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideContentServiceConfig({appDomain: environment.appDomain, contentRoot: environment.contentRoot, contentFileName: environment.contentFileName}),
    provideAPIURL(environment.API_URL),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation(), withInMemoryScrolling(scrollConfig)),
    provideNgIdleKeepalive(), // use provideNgIdle() if not using keepalive
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideEnvironmentNgxMask(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
