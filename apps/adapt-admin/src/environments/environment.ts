import { NgxLoggerLevel } from 'ngx-logger';

export const environment = {
  // NgxLoggerLevels: TRACE|DEBUG|INFO|LOG|WARN|ERROR|FATAL|OFF
  logLevel: NgxLoggerLevel.OFF,
  API_URL: 'https://8s5i39nu4f.execute-api.us-east-1.amazonaws.com/weiss-sandbox/',
  VAPID_KEY: 'BDSuXbUMbbtgKUGRJIVJugq9xU_J3zYv2ybPXveUYYNyXI0vNuFfzsGpYXgc-LjT3QPCWNba0qjcFuE18KJHt7c',
  cognitoRegion: 'us-east-1',
  cognitoDomainName: 'weiss-sandbox-adaptadmin',
  s3PublicAssetsDomainName: 'weiss-sandbox-adaptpublicassetsbucket',
  clientId: '18ob1nlf000htqlthkqmqr0e4q',
  contentRoot: 'assets/text',
  contentFileName: 'admin-content-text.json',
  appDomain: 'sandbox-admin.adaptdata.org',
  enforceLogin: true,
  envLabel: 'Prod',
  enforceRole: true,
  callbackUrl: 'https://sandbox-admin.adaptdata.org/auth/redirect',
  Cognito: {
    userPoolId: 'us-east-1_y4OLT3Ez7',
    userPoolClientId: '18ob1nlf000htqlthkqmqr0e4q',
  },
  loginContent: 'assets/content-labels.json',
  pagesContent: 'assets/text/admin-content-text.json',
  organizationName: 'User Organization',
  logoPath: 'assets/shared/logos/generic',
  logoExtension: 'svg',
  logoStyleClass: 'width-card',
  copyrightText: 'AEM Corporation.',
};
