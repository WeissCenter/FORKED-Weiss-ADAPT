import { HttpClient } from '@angular/common/http';
import { computed, effect, Inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  //private _content = new ReplaySubject<any>();
  //public $content = this._content.asObservable();
  public $content = signal<Record<string, any>>({});
  private $requestedLanguages = signal<Set<string>>(new Set());
  private $contentLanguages = computed(() => {
    return [...new Set([this.language.$language(), ...this.$requestedLanguages()])];
  });

  constructor(
    private http: HttpClient,
    private language: LanguageService,
    @Inject('appDomain') private appDomain: string,
    @Inject('contentRoot') private contentRoot: string,
    @Inject('contentFileName') private contentFileName: string
  ) {
    effect(
      () => {
        for (const lang of this.$contentLanguages()) {
          const url = this.contentUrl(appDomain, contentRoot, contentFileName, lang);
          // if we don't have content for this url, request it
          if (!this.$content()[url]) {
            this.requestContent(appDomain, contentRoot, contentFileName, lang);
          }
        }
      },
      { allowSignalWrites: true }
    );
  }

  private contentUrl(appDomain: string, defaultContentFilePath: string, file: string, lang: string) {
    const protocol = appDomain.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${appDomain}/${defaultContentFilePath}/${lang}/${file}`;
  }

  requestContent(appDomain: string, defaultContentFilePath: string, file: string, lang: string) {
    const url = this.contentUrl(appDomain, defaultContentFilePath, file, lang);
    this.http.get(url).subscribe((response) => {
      this.$content.update((prev) => ({ ...prev, [url]: response }));
    });
  }

  getContentSignal(appDomain: string, defaultContentFilePath: string, file: string, lang: string) {
    const url = this.contentUrl(appDomain, defaultContentFilePath, file, lang);
    return computed(() => {
      return this.$content()[url];
    });
  }

  requestNewLanguage(lang: string) {
    if (!this.$requestedLanguages().has(lang)) {
      this.$requestedLanguages.update((prev) => new Set(prev).add(lang));
    }
  }
}
