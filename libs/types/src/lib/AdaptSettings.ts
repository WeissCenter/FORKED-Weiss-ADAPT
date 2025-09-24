export interface FooterLinks {
  label: string;
  url: string;
  external: boolean;
  target: 'newTab' | 'sameTab' | 'newWindow';
  icon?: string;
}

export interface AdaptSettings {
  logo: string;
  copyright: string;
  nSize: number;
  idleMinutes: number;
  warningMinutes: number;
  timeoutMinutes: number;
  defaultLanguage?: LanguageCode;
  footerLinks?: FooterLinks[];
  supportedLanguages?: LanguageCode[];
}

export interface UpdateAdaptSettingsInput {
  logo?: string;
  nSize?: number;
  copyright?: string;
  idleMinutes?: number;
  warningMinutes?: number;
  timeoutMinutes?: number;
  supportedLanguages?: LanguageCode[];
  defaultLanguage?: LanguageCode;
  footerLinks?: FooterLinks[];
}

export type LanguageCode =
  | 'af'
  | 'sq'
  | 'am'
  | 'ar'
  | 'hy'
  | 'az'
  | 'bn'
  | 'bs'
  | 'bg'
  | 'ca'
  | 'zh'
  | 'zh-TW'
  | 'hr'
  | 'cs'
  | 'da'
  | 'fa-AF'
  | 'nl'
  | 'en'
  | 'et'
  | 'fa'
  | 'tl'
  | 'fi'
  | 'fr'
  | 'fr-CA'
  | 'ka'
  | 'de'
  | 'el'
  | 'gu'
  | 'ht'
  | 'ha'
  | 'he'
  | 'hi'
  | 'hu'
  | 'is'
  | 'id'
  | 'ga'
  | 'it'
  | 'ja'
  | 'kn'
  | 'kk'
  | 'ko'
  | 'lv'
  | 'lt'
  | 'mk'
  | 'ms'
  | 'ml'
  | 'mt'
  | 'mr'
  | 'mn'
  | 'no'
  | 'ps'
  | 'pl'
  | 'pt'
  | 'pt-PT'
  | 'pa'
  | 'ro'
  | 'ru'
  | 'sr'
  | 'si'
  | 'sk'
  | 'sl'
  | 'so'
  | 'es'
  | 'es-MX'
  | 'sw'
  | 'sv'
  | 'ta'
  | 'te'
  | 'th'
  | 'tr'
  | 'uk'
  | 'ur'
  | 'uz'
  | 'vi'
  | 'cy';
