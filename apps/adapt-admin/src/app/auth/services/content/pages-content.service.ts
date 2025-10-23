import { Injectable, computed, Signal } from '@angular/core';

import {
  AdminContentText,
  PageContentText,
} from '@adapt-apps/adapt-admin/src/app/admin/models/admin-content-text.model';
import { environment } from '@adapt-apps/adapt-admin/src/environments/environment';
import { ContentService, LanguageService, SettingsService } from '@adapt/adapt-shared-component-lib';
import { LanguageCode } from '@adapt/types';

@Injectable({
  providedIn: 'root',
})
export class PagesContentService {
  readonly LOAD_LANGUAGES: LanguageCode[] = ['en', 'es-MX'];
  $adminContent = computed(() => {
    return this.LOAD_LANGUAGES.reduce((acc, lang) => {
      acc[lang] = this.contentService.getContentSignal(
        environment.appDomain,
        environment.contentRoot,
        'admin-content-text.json',
        lang
      )();
      return acc;
    }, {} as Record<string, AdminContentText | null>);
  });

  constructor(public contentService: ContentService, public language: LanguageService, public settings: SettingsService) {}

  getAdminContentSignal(lang = 'default') {
    const useLang = this.useLanguage(lang);
    return computed(() => {
      return this.$adminContent()[useLang];
    });
  }

  getPageContentSignal(pageName: string, lang = 'default'): Signal<PageContentText | null> {
    const useLang = this.useLanguage(lang);
    return computed(() => {
      const adminContent = this.$adminContent()[useLang];
      return adminContent?.pages?.find((p) => p.name === pageName) || null;
    });
  }

  getSharedContentSignal(lang = 'default') {
    const useLang = this.useLanguage(lang);
    return computed(() => {
      const adminContent = this.$adminContent()[useLang];
      return adminContent?.shared || null;
    });
  }

  getListViewContentSignal(lang = 'default') {
    const useLang = this.useLanguage(lang);
    return computed(() => {
      const adminContent = this.$adminContent()[useLang];
      return adminContent?.adaptListView || null;
    });
  }

  useLanguage(lang: string = 'default') {
    // console.log('useLanguage', lang);
    return lang === 'default' ? this.settings.getDefaultLanguage() : lang;
  }
}
