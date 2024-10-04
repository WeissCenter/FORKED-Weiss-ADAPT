import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../..//environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private _role: Set<Permission> | undefined;
  private _helper: JwtHelperService;

  constructor() {
    this._helper = new JwtHelperService();
  }

  public get role(): Set<Permission> | undefined {
    return this._role;
  }

  public set role(value: Set<Permission> | undefined) {
    if (!environment.enforceRole) {
      this._role = value;
    }
  }

  public setRoleFromToken(jwt: string) {
    const cognitoGroups = this._helper.decodeToken(jwt)['cognito:groups'];
    if (cognitoGroups) {
      // only get cognito groups that indicate roles
      // take the first role group - user should not be in more than one role group
      const roleNames = Object.keys(CognitoGroups);
      const group = (cognitoGroups as string[]).filter((group) => roleNames.includes(group))[0];
      this._role = CognitoGroups[group];
    }
    if (!this._role) {
      this._role = Roles.VIEWER; // default role if user isn't in a cognito group
      this.displayRoleErrorToast();
    }
  }

  public hasPermission(permission: Permission): boolean {
    return !!this._role && this._role.has(permission);
  }

  public displayRoleErrorToast(): void {
    console.error(`User is not in a role cognito group or role is otherwise undefined. this._role: `, this._role);
  }

  public checkPermissions(permissions: Permission[]): boolean {
    // used to enable/disable buttons/actions that require certain permissions
    return !permissions.every((perm: Permission) => this.hasPermission(perm));
  }
}

export enum Permission {
  READ,
  WRITE,
}

export const Roles = {
  VIEWER: new Set([Permission.READ]),
  EDITOR: new Set([Permission.READ, Permission.WRITE]),
};

export const CognitoGroups: { [group: string]: Set<Permission> } = {
  reader: Roles.VIEWER,
  editor: Roles.EDITOR,
};
