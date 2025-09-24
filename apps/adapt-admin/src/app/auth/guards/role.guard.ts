import { EventType, PermissionAction, PermissionObject } from '@adapt/types';
import { RoleService } from '../services/role/role.service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdaptDataService } from '../../services/adapt-data.service';
import { CognitoService } from '../services/cognito/cognito.service';

export const roleGuard = (permissionObject: PermissionObject, action: PermissionAction): CanActivateFn => {
  return (route, state) => {
    const role: RoleService = inject(RoleService);
    const router: Router = inject(Router);
    const data: CognitoService = inject(CognitoService);

    if (!role.hasPermission(permissionObject, action)) {
      data
        .recordEvent('User tried to access a resource they were not authorized for', EventType.USER, [
          { label: 'route', value: route.url },
        ])
        .subscribe();
      return router.parseUrl('/admin/error?what=unauthorized');
    }

    return true;
  };
};
