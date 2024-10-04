import { InjectionToken, makeEnvironmentProviders } from '@angular/core'

export * from './lib.module'
export * from './lib/components/modal/modal.component'
export * from './lib/services/alert.service'
export * from './lib/services/filterpanel.service'
export * from './lib/services/glossary.service'
export * from './lib/services/content.service'
export * from './lib/pipes'
export * from './lib/components/secondary-navigation/secondary-navigation.component'

export function provideContentServiceConfig(location: string) {
    return makeEnvironmentProviders([
      { provide: CONTENT_LOCATION, useValue: location },
    ]);
  }

export const CONTENT_LOCATION = new InjectionToken('content-location', {providedIn: 'root', factory() {
    return 'assets/content-labels.json'
}})