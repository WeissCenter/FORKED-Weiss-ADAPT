import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { Observable, of, catchError, switchMap, retry, throwError } from 'rxjs';
import { CognitoService } from '../services/cognito/cognito.service';
import { Router } from '@angular/router';

const AUTH_HEADER = 'Authorization';

const IGNORE = [
  'adapt-data-staging-repository',
  'adapt-public-assets-bucket',
  'adaptdatastack-adaptdatastagingbucket',
  'adaptpublicassetsbucket',
];

function handleAuthError(
  cognito: CognitoService,
  router: Router,
  err: HttpErrorResponse,
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<any> {

  if (err.error instanceof ProgressEvent) {
    return cognito.refresh().pipe(
      switchMap(() => {
        const authReq = req.clone({ headers: req.headers.set(AUTH_HEADER, cognito.authSet.ID_TOKEN) });
        return next(authReq);
      })
    );
  }

  if (err.url?.includes("/oauth2/token") && err.status >= 400) {
    router.navigate(['auth', 'login'])
    throw err;
  }

  return of(err.message);
}

export function AuthInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const cognito = inject(CognitoService);
  const router = inject(Router);
  if (req.url.includes(CognitoService._DOMAIN_NAME)) {
    // cognito call - allow through
    return next(req);
  }

  if (IGNORE.some((suffix) => req.url.includes(suffix))) {
    // s3 don't add auth
    return next(req);
  }

  // add the auth header
  const authReq = req.clone({ headers: req.headers.set(AUTH_HEADER, cognito.authSet.ID_TOKEN) });

 // return throwError(() => new HttpErrorResponse({error: 'dome', status: 403})).pipe(retry({ delay: (x) => handleAuthError(cognito, router, x, req, next), count: 2 }));

  return next(authReq).pipe(retry({ delay: (x) => handleAuthError(cognito, router, x, req, next), count: 2 }));
}
