import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserService } from '../services/user/user.service';
import { CognitoService } from '../services/cognito/cognito.service';

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const user: UserService = inject(UserService);
  const cognito: CognitoService = inject(CognitoService);
  const router: Router = inject(Router);
  user.initUserSession();

  if (!environment.enforceLogin || (environment.enforceLogin && user.isLoggedIn)) {
    return true;
  } else if (environment.envLabel === 'UAT' && cognito.authSet.ID_TOKEN) {
    return true;
  } else {
    router.navigateByUrl('auth/login');
    return false;
  }
};
