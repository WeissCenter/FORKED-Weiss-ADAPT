/* Types are in a separate file to avoid circular dependencies between services */

// session storage key names
export enum CognitoAttr {
  ID_TOKEN = 'cognito_id_token',
  ACCESS_TOKEN = 'cognito_access_token',
  REFRESH_TOKEN = 'cognito_refresh_token',
  EXPIRES_IN = 'cognito_expires_in',
  TOKEN_TYPE = 'cognito_token_type',
  USERNAME = 'cognito_username',
  SUB = 'cognito_sub',
  GIVEN_NAME = 'cognito_given_name',
  FAMILY_NAME = 'cognito_family_name',
  EMAIL = 'cognito_email',
}

// ng-idle states
export enum IdleStates {
  NOT_STARTED = 'NOT_STARTED',
  IDLE = 'IDLE',
  NOT_IDLE = 'NOT_IDLE',
  TIMED_OUT = 'TIMED_OUT',
  CACHE_SAVE = 'CACHE_SAVE',
}
