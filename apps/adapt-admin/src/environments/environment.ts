export const environment = {
  API_URL: '',
  VAPID_KEY: '',
  cognitoRegion: 'us-east-1',
  cognitoDomainName: '',
  s3PublicAssetsDomainName: '',
  clientId: '',
  enforceLogin: true,
  envLabel: 'LOCAL',
  enforceRole: true,
  callbackUrl: 'http://localhost:4200/auth/redirect',
  Cognito: {
    userPoolId: '',
    userPoolClientId: '',
  },
  defaultContent: 'assets/content-labels.json',
};
