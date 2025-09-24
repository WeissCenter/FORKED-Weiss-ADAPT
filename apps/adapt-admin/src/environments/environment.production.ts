import { NgxLoggerLevel } from 'ngx-logger';

export const environment = {
  // NgxLoggerLevels: TRACE|DEBUG|INFO|LOG|WARN|ERROR|FATAL|OFF
  logLevel: NgxLoggerLevel.OFF,
  API_URL: '',
  VAPID_KEY: 'BDSuXbUMbbtgKUGRJIVJugq9xU_J3zYv2ybPXveUYYNyXI0vNuFfzsGpYXgc-LjT3QPCWNba0qjcFuE18KJHt7c',
  cognitoRegion: 'us-east-1',
  cognitoDomainName: '',
  s3PublicAssetsDomainName: '',
  clientId: '',
  contentRoot: 'assets/text',
  contentFileName: 'admin-content-text.json',
  appDomain: 'sandbox-admin.adaptdata.org',
  enforceLogin: true,
  envLabel: 'Prod',
  enforceRole: true,
  callbackUrl: '',
  Cognito: {
    userPoolId: '',
    userPoolClientId: '',
  },
  loginContent: 'assets/content-labels.json',
  pagesContent: 'assets/text/admin-content-text.json',
};
