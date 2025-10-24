import { AdaptSettings, IGlossaryTerm, LanguageCode, Response } from '@adapt/types';
import { HttpClient } from '@angular/common/http';
import { computed, effect, Inject, Injectable, Optional, signal } from '@angular/core';
import { BehaviorSubject, exhaustMap, filter, firstValueFrom, map, Observable, take, tap } from 'rxjs';
import { API_URL, SettingsService } from '../../index';

@Injectable({
  providedIn: 'root',
})
export class GlossaryService {
  private $glossary = signal<{[lang: string]: { [key: string]: IGlossaryTerm }}>({});

  constructor(private http: HttpClient, @Inject(API_URL) api: string, private settings: SettingsService) {
    effect(() => {
      const settingsSignal = this.settings.getSettingsSignal();
      const langs = settingsSignal().supportedLanguages;
      if (!langs || langs.length === 0) return;

      this.getGlossaryLanguagesFromApi(api, langs).then((results) => {
        this.$glossary.set(results);
      });
    }, { allowSignalWrites: true });
  }

  private async getGlossaryLanguagesFromApi(api: string, languages: LanguageCode[]) {
    const results: { [lang: string]: { [key: string]: IGlossaryTerm } } = {};
    const responses = await Promise.allSettled(
      languages.map((lang) => {
        return this.getGlossaryFromApi(api, lang)
      })
    );
    responses.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results[languages[index]] = result.value;
      } else {
        console.error('Error loading glossary for language', languages[index], result.reason);
      }
    });
    return results;
  }

  private async getGlossaryFromApi(api: string, lang: LanguageCode) {
    const response = await firstValueFrom(this.http
      .get<Response<any>>(`${api}/settings/glossary`.replace(/([^:]\/)\/+/g, "$1"), { params: { lang } }))
    return response.data.terms as { [key: string]: IGlossaryTerm };
  }

  public hasTerm(key: string, lang = 'en') {
    return this.currValue[lang] && key in this.currValue[lang];
  }

  public getTermSafe(key: string, def?: string, lang: LanguageCode = 'en'): IGlossaryTerm {
    if (!this.hasTerm(key, lang)) {
      return { label: def || key, definition: '' };
    }
    return this.currValue[lang][key] as IGlossaryTerm;
  }

  public getTerm(key: string, lang: LanguageCode = 'en'): IGlossaryTerm | undefined {
    return this.currValue[lang][key] as IGlossaryTerm;
  }

  public getFileSpecTerm(fileSpec: string, key: string, lang: LanguageCode = 'en'): IGlossaryTerm | undefined {
    const lookupKey = `${fileSpec}-${key}`;
    if (this.hasTerm(lookupKey, lang)) {
      return this.currValue[lang][lookupKey] as IGlossaryTerm;
    }
    return this.getTerm(key, lang);
  }

  private get currValue() {
    return this.$glossary();
  }
}
