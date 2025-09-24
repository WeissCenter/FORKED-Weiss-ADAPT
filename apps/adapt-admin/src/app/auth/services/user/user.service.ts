import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, forkJoin, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { concatMap, delay, map, startWith, switchMap, tap, toArray } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { IdleStates } from '../../auth-model';
import { CognitoService } from '../cognito/cognito.service';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { RoleService } from '../role/role.service';
import { RecentActivityService } from '../../../services/recent-activity.service';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { SettingsService } from '../../../admin/services/settings.service';
import { HttpClient } from '@angular/common/http';
import { Response, UserActivity, UserTimeOutCacheInput } from '@adapt/types';

/**
 * Provides methods to manage user session i.e. logged-in status, session timeout
 * Handles full login/logout flow including Cognito service calls - should be used by components
 */

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _username: BehaviorSubject<string> = new BehaviorSubject<string>('Username');
  public readonly username$ = this._username.asObservable();
  public get username(): string {
    return this._username.value;
  }

  private readonly _userInitials: BehaviorSubject<string> = new BehaviorSubject<string>('Initials');
  public readonly userInitials$ = this._userInitials.asObservable();
  public get userInitials(): string {
    return this._userInitials.value;
  }

  private readonly _displayName: BehaviorSubject<string> = new BehaviorSubject<string>('Username');
  public readonly displayName$ = this._displayName.asObservable();
  public get displayName(): string {
    return this._displayName.value;
  }

  private readonly _email: BehaviorSubject<string> = new BehaviorSubject<string>('Username');
  public readonly email$ = this._email.asObservable();
  public get email(): string {
    return this._email.value;
  }

  private readonly _isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly isLoggedIn$ = this._isLoggedIn.asObservable();
  public get isLoggedIn(): boolean {
    return this._isLoggedIn.value;
  }
  private set isLoggedIn(isLoggedIn: boolean) {
    this._isLoggedIn.next(isLoggedIn);
  }

  private readonly _userActivity: BehaviorSubject<UserActivity> = new BehaviorSubject<UserActivity>({
    username: 'unknown',
  });
  public readonly userActivity$ = this._userActivity.asObservable();
  public get userActivity(): UserActivity {
    return this._userActivity.value;
  }

  private _idleState = IdleStates.NOT_STARTED;
  public get idleState(): IdleStates {
    return this._idleState;
  }

  private sessionTimeout$ = new Subject<void>();
  private saveRequestsSubject = new ReplaySubject<Observable<any>>();

  constructor(
    private idle: Idle,
    private http: HttpClient,
    // // private keepalive: Keepalive, // UNUSED: we don't use Keepalive to refresh tokens since the tokens are revoked on logout
    // private toast: MessageService,
    private cognito: CognitoService, // beware circular dependency - don't call user service inside cognito service
    private router: Router,
    private settings: SettingsService,
    private role: RoleService,
    private history: RecentActivityService
  ) {}

  /**
   * Initialize the user session and setup idle timeout - call after login redirect from Cognito
   * Sets display name, checks stored tokens and inits idle session upon login or page refresh/app init
   * Need to call this in app.component in case of page refresh while user is logged in
   * TODO: decode and check expiration dates on Cognito JWTs
   */
  public initUserSession() {
    // check if user already has logged-in session

    const authSet = this.cognito.authSet;

    if (authSet.ID_TOKEN && authSet.ACCESS_TOKEN) {
      this.role.setRoleFromToken(authSet.ID_TOKEN);
      this.isLoggedIn = true;
      this.setDisplayName();
      this.initIdle(); // start idle session
      this.getUserActivity();
    }
  }

  public userInactivitySave(input: UserTimeOutCacheInput) {
    const request = this.http
      .post<Response<UserActivity>>(`${environment.API_URL}timedout`, input)
      .pipe(map((result) => result.data));

    this.saveRequestsSubject.next(request);
  }

  public clearUserInactivity() {
    this.http
      .post<Response<UserActivity>>(`${environment.API_URL}timedout`, { action: 'CLEAR', type: 'Generic' })
      .pipe(map((result) => result.data))
      .subscribe((userActivity) => this._userActivity.next(userActivity));
  }

  private getUserActivity() {
    this.http
      .get<Response<UserActivity>>(`${environment.API_URL}user`)
      .pipe(map((result) => result.data))
      .subscribe((userActivity) => this._userActivity.next(userActivity));
  }

  public get accessToken() {
    return this.cognito.authSet.ACCESS_TOKEN;
  }

  /**
   * Gets user's tokens/attributes from Cognito, starts idle session and redirects to home
   */
  public login(authCode: string): void {
    // get tokens
    this.cognito
      .getTokens(authCode)
      .pipe(
        concatMap(() => {
          return this.cognito.getUserInfo(); // get user's Cognito attributes
        })
      )
      .subscribe(() => {
        this.isLoggedIn = true;
        this.initUserSession();
        this.router.navigateByUrl('admin');
      });
  }

  /**
   * Revoke Cognito tokens, end idle session and redirect to logout page
   */
  public async logout(idleState?: IdleStates) {
    this.cognito.revoke().subscribe({
      next: () => {
        this.isLoggedIn = false;
        //   this.idle.stop(); // end idle session
        this._idleState = idleState || IdleStates.NOT_STARTED;

        if (idleState === IdleStates.TIMED_OUT) {
          localStorage.setItem('session_expiry', `${Date.now()}`);
          return this.router.navigateByUrl('/auth/timedout');
        }

        return this.router.navigateByUrl('/auth/loggedout');
      },
      error: (err) => {
        // user isn't logged in - clear auth storage
        this.isLoggedIn = false;
        //   this.idle.stop(); // end idle session
        this._idleState = idleState || IdleStates.NOT_STARTED;
        this.cognito.clearAuthStorage();
        this.history.clearHistory();
        const errMsg = this.cognito.handleLogoutError(err);

        return this.router.navigateByUrl('/auth/error');
      },
    });

    const accessibilitySettings = localStorage.getItem('adapt-accessibility-settings');
    localStorage.clear();
    if (accessibilitySettings) localStorage.setItem('adapt-accessibility-settings', accessibilitySettings);
  }

  /**
   * Setup idle timeout
   */
  private async initIdle() {
    if (this._idleState === IdleStates.NOT_STARTED || this._idleState === IdleStates.TIMED_OUT) {
      const settingsSub = this.settings.getSettingsObservable().subscribe((settings) => {
        this.idle.setIdle(settings.idleMinutes * 60);
        this.idle.setTimeout(settings.timeoutMinutes * 60);
      });

      // setup ng-idle

      this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
      // ng-idle state handlers
      this.idle.onIdleStart.subscribe(() => {
        // warn the user when they become idle
        this._idleState = IdleStates.IDLE;
      });
      this.idle.onIdleEnd.subscribe(() => {
        // reset status
        this._idleState = IdleStates.NOT_IDLE;
      });

      this.idle.onTimeout.subscribe(() => {
        this.sessionTimeout$.next();
        this._idleState = IdleStates.TIMED_OUT;
      });

      this.sessionTimeout$
        .pipe(
          switchMap(() => this.waitForAllSaveRequests()), // Wait for all save requests before logging out
          delay(1000),
          tap(() => this.logout(this.idleState)) // Logout after all save requests finish
        )
        .subscribe();

      // start ng-idle
      this.resetIdle();
    }
  }

  private waitForAllSaveRequests(): Observable<any> {
    return this.saveRequestsSubject.pipe(
      startWith(of(null)),
      switchMap((saveRequests) => {
        return saveRequests;
      })
    );
  }

  /**
   * Start/reset ng-idle
   */
  private resetIdle(): void {
    this.idle.watch();
    this._idleState = IdleStates.NOT_IDLE;
  }

  /**
   * Call after receiving tokens from Cognito
   */
  private setDisplayName(): void {
    const userInfo = this.cognito.userInfo;
    const username = userInfo.USERNAME;
    const email = userInfo.EMAIL;
    const given_name = userInfo.GIVEN_NAME;
    const family_name = userInfo.FAMILY_NAME;
    let initials = 'xx';
    let displayName = 'Username';
    if (given_name && family_name) {
      displayName = given_name + ' ' + family_name;
      initials = given_name.charAt(0) + family_name.charAt(0);
    } else if (email) {
      displayName = email;
      initials = email.charAt(0) + email.charAt(1);
    } else if (username) {
      displayName = username;
    }

    this._username.next(username);
    this._userInitials.next(initials);
    this._displayName.next(displayName);
    this._email.next(email);
  }
}
