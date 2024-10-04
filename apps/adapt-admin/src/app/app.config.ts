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

const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation(), withInMemoryScrolling(scrollConfig)),
    provideNgIdleKeepalive(), // use provideNgIdle() if not using keepalive
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
