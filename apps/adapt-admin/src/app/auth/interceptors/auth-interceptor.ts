import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError, switchMap, retry, throwError } from 'rxjs';
import { CognitoService } from '../services/cognito/cognito.service';

const AUTH_HEADER = 'Authorization';

const IGNORE = ['adapt-data-staging-repository', 'adapt-public-assets-bucket'];

function handleAuthError(
  cognito: CognitoService,
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

  if (err.status >= 400) {
    throw err;
  }

  return of(err.message);
}

export function AuthInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const cognito = inject(CognitoService);
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
  return next(authReq).pipe(retry({ delay: (x) => handleAuthError(cognito, x, req, next), count: 2 }));
}
