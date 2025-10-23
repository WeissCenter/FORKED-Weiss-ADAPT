import { InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { SettingsService } from './lib/services/settings.service';
import { GlossaryService } from './lib/services/glossary.service';

export * from './lib.module';
export * from './lib/components/modal/modal.component';
export * from './lib/services/alert.service';
export * from './lib/services/filterpanel.service';
export * from './lib/services/glossary.service';
export * from './lib/services/content.service';
export * from './lib/services/settings.service';
export * from './lib/pipes';
export * from './lib/components/secondary-navigation/secondary-navigation.component';
export * from './lib/services/language.service'

export function provideAPIURL(api: string) {
    return makeEnvironmentProviders([
      { provide: API_URL, useValue: api }
    ]);
  }

export const API_URL = new InjectionToken<string>('api-url', {providedIn: 'root', factory() {
    return ''
}})

export function provideContentServiceConfig(config: {appDomain: string, contentRoot: string, contentFileName: string}) {
    return makeEnvironmentProviders([
      { provide: 'appDomain', useValue: config.appDomain },
      { provide: 'contentRoot', useValue: config.contentRoot },
      { provide: 'contentFileName', useValue: config.contentFileName },
    ]);
  }
