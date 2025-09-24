import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, interval, Subscription, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { CognitoAttr } from '../../auth-model';
import { environment } from '../../../../environments/environment';

import { Amplify } from 'aws-amplify';
import { signIn, type SignInInput, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { EventType, Response } from '@adapt/types';

/**
 * Provides methods to interface with Cognito functionality
 * 1. User logs in with Hosted UI from User Pool App Client (configured in AWS Console)
 * 2. Adapt gets an auth code from Cognito upon redirect
 * 3. Adapt calls the AWS-hosted OAuth2 /tokens endpoint and stores the ID, access and refresh tokens in session storage
 * 4. User can use the access token to access Adapt endpoints on API Gateway
 * 5. Upon logging out the refresh token is used to call the OAuth2 /revoke and invalidate all tokens
 * 6. Tokens are cleared from session storage
 *
 * AWS OAuth2 /logout endpoint does not return CORS header so we can't use it here to end the session
 * Not intended to be called directly by components - see user service
 */

@Injectable({
  providedIn: 'root',
})
export class CognitoService {
  // Cognito environment variables
  private static readonly _REGION = environment.cognitoRegion;
  public static readonly _DOMAIN_NAME = environment.cognitoDomainName;
  private static readonly _CLIENT_ID = environment.clientId;
  private static readonly _REDIRECT_URI = environment.callbackUrl;

  // Cognito Hosted UI REST URIs/params
  private static readonly _BASE_URL = `https://${CognitoService._DOMAIN_NAME}.auth.${CognitoService._REGION}.amazoncognito.com`;
  public static readonly LOGIN_URL = `${CognitoService._BASE_URL}/login?client_id=${CognitoService._CLIENT_ID}&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+profile&redirect_uri=${CognitoService._REDIRECT_URI}`;

  private setAuthSet(tokenRes: TokenResponse) {
    localStorage.setItem(CognitoAttr.ID_TOKEN, tokenRes.id_token);
    localStorage.setItem(CognitoAttr.ACCESS_TOKEN, tokenRes.access_token);
    // only set refresh token if received in response
    if (tokenRes.refresh_token) localStorage.setItem(CognitoAttr.REFRESH_TOKEN, tokenRes.refresh_token);
  }
  public get authSet(): AuthSet {
    return {
      ID_TOKEN: localStorage.getItem(CognitoAttr.ID_TOKEN) || '',
      ACCESS_TOKEN: localStorage.getItem(CognitoAttr.ACCESS_TOKEN) || '',
      REFRESH_TOKEN: localStorage.getItem(CognitoAttr.REFRESH_TOKEN) || '',
    };
  }

  private setUserInfo(userInfoRes: UserInfoResponse) {
    localStorage.setItem(CognitoAttr.USERNAME, userInfoRes.username);
    localStorage.setItem(CognitoAttr.SUB, userInfoRes.sub);
    localStorage.setItem(CognitoAttr.EMAIL, userInfoRes.email);
    localStorage.setItem(CognitoAttr.GIVEN_NAME, userInfoRes.given_name);
    localStorage.setItem(CognitoAttr.FAMILY_NAME, userInfoRes.family_name);
  }
  public get userInfo(): UserInfo {
    return {
      USERNAME: localStorage.getItem(CognitoAttr.USERNAME) || '',
      SUB: localStorage.getItem(CognitoAttr.SUB) || '',
      EMAIL: localStorage.getItem(CognitoAttr.EMAIL) || '',
      GIVEN_NAME: localStorage.getItem(CognitoAttr.GIVEN_NAME) || '',
      FAMILY_NAME: localStorage.getItem(CognitoAttr.FAMILY_NAME) || '',
    };
  }

  constructor(private http: HttpClient) {
    Amplify.configure({
      Auth: { Cognito: environment.Cognito },
    });
  }

  public async signIn({ username, password }: SignInInput) {
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });
      const { accessToken, idToken } = (await fetchAuthSession()).tokens ?? {};
      this.setAuthSet({ access_token: accessToken?.toString(), id_token: idToken?.toString() } as TokenResponse);
      // hard coded for test user account
      let creds = await getCurrentUser();
      this.setUserInfo({
        username: creds.username,
        sub: creds.userId,
        email: 'testuser@adaptadmin.org',
        given_name: 'Test',
        family_name: 'User',
      } as UserInfoResponse);
      return true;
    } catch (error) {
      console.log('error signing in', error);
    }

    return false;
  }

  /**
   * Uses the auth code after signing in with the Cognito Hosted UI to request tokens
   * @param code authorization code from query parameters in redirect URI
   * @returns
   */
  public getTokens(code: string): Observable<TokenResponse> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    };
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', CognitoService._CLIENT_ID)
      .set('redirect_uri', CognitoService._REDIRECT_URI)
      .set('code', code);
    return this.http.post(CognitoService._BASE_URL + '/oauth2/token', body, options).pipe(
      tap((res: any) => {
        const tokenRes = res as TokenResponse;
        this.setAuthSet(tokenRes);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Retrieve user's Cognito attributes into session storage after getting access token
   */
  public getUserInfo(): Observable<UserInfoResponse> {
    const access_token = this.authSet.ACCESS_TOKEN;
    const options = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${access_token}`,
      }),
    };
    return this.http.get(CognitoService._BASE_URL + '/oauth2/userInfo', options).pipe(
      tap((res: any) => {
        const userInfoRes = res as UserInfoResponse;
        this.setUserInfo(userInfoRes);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Revoke tokens and clear session storage of user credentials
   */
  public revoke(): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    };

    const refresh_token = this.authSet.REFRESH_TOKEN;
    const body = new HttpParams().set('token', refresh_token).set('client_id', CognitoService._CLIENT_ID);
    return this.recordEvent('User signed out', EventType.USER).pipe(
      switchMap(() =>
        this.http.post(CognitoService._BASE_URL + '/oauth2/revoke', body, options).pipe(
          tap((res: any) => {
            this.clearAuthStorage();
          })
        )
      )
    );
  }

  private recordEvent(event: string, type: EventType, metadata?: any) {
    return this.http.post<Response<any>>(`${environment.API_URL}event`, { event, type, metadata });
  }

  public refresh(): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    };
    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', CognitoService._CLIENT_ID)
      .set('refresh_token', localStorage.getItem(CognitoAttr.REFRESH_TOKEN) || '');
    return this.http.post(CognitoService._BASE_URL + '/oauth2/token', body, options).pipe(
      tap((res: any) => {
        const tokenRes = res as TokenResponse;
        this.setAuthSet(tokenRes);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError('Something bad happened; please try again later.');
  }

  /**
   * Returns a string to display in a toast indicating the error that occurred upon logout
   * @param res HttpErrorResponse from API call observable
   */
  public handleLogoutError(res: HttpErrorResponse): string {
    console.error(res);
    if (res.error.error) {
      switch (res.error.error) {
        case 'invalid_request':
          return 'You are not logged in.';
        default:
          return `Error code: ${res.error.error}`;
      }
    } else {
      return 'An unknown error occurred.';
    }
  }

  public clearAuthStorage() {
    // OAuth2 Tokens
    localStorage.removeItem(CognitoAttr.ID_TOKEN);
    localStorage.removeItem(CognitoAttr.ACCESS_TOKEN);
    localStorage.removeItem(CognitoAttr.REFRESH_TOKEN);
    // localStorage.removeItem(CognitoAttr.EXPIRES_IN);
    // localStorage.removeItem(CognitoAttr.TOKEN_TYPE);
    // Cognito attributes
    localStorage.removeItem(CognitoAttr.USERNAME);
    localStorage.removeItem(CognitoAttr.SUB);
    localStorage.removeItem(CognitoAttr.EMAIL);
    localStorage.removeItem(CognitoAttr.GIVEN_NAME);
    localStorage.removeItem(CognitoAttr.FAMILY_NAME);
    // Clear all local/session storage
    // localStorage.clear();
    // sessionStorage.clear();
  }
}

interface TokenResponse {
  id_token: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface UserInfoResponse {
  username: string;
  sub: string;
  email_verified: boolean; // false for AD EXTERNAL_PROVIDER accounts by default
  // required standard attributes
  email: string;
  given_name: string;
  family_name: string;
}

interface AuthSet {
  ID_TOKEN: string;
  ACCESS_TOKEN: string;
  REFRESH_TOKEN: string;
  // EXPIRES_IN: string,
  // TOKEN_TYPE: string,
}

interface UserInfo {
  USERNAME: string;
  SUB: string;
  EMAIL: string;
  GIVEN_NAME: string;
  FAMILY_NAME: string;
}
