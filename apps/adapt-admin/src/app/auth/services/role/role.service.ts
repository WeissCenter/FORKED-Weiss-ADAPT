import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../..//environments/environment';
import {
  AppPermissions,
  AppRolePermission,
  appRolePermissions,
  PermissionAction,
  PermissionObject,
} from '@adapt/types';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private _role: AppRolePermission | undefined;
  private _helper: JwtHelperService;

  constructor() {
    this._helper = new JwtHelperService();
  }

  public get role(): AppRolePermission | undefined {
    return this._role;
  }

  public set role(value: AppRolePermission | undefined) {
    if (!environment.enforceRole) {
      this._role = value;
    }
  }

  public setRoleFromToken(jwt: string) {
    const cognitoGroups = this._helper.decodeToken(jwt)['cognito:groups'];
    if (cognitoGroups) {
      // only get cognito groups that indicate roles
      // take the first role group - user should not be in more than one role group
      const roleNames = Object.keys(appRolePermissions);
      const group = (cognitoGroups as string[]).filter((group) => roleNames.includes(group))[0];
      this._role = appRolePermissions[group];
    }
    if (!this._role) {
      // this._role = Roles.VIEWER; // default role if user isn't in a cognito group
      this.displayRoleErrorToast();
    }
  }

  public hasPermission(item: PermissionObject, action: PermissionAction): boolean {
    return !!this._role && !!this._role.permissions?.[item]?.includes(action);
  }

  public displayRoleErrorToast(): void {
    console.error(`User is not in a role cognito group or role is otherwise undefined. this._role: `, this._role);
  }
}
