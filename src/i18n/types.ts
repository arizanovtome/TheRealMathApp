export type SupportedLocale = 'en' | 'mk';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'mk'];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  mk: 'Македонски',
};

export const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  en: '🇬🇧',
  mk: '🇲🇰',
};

export const LOCALE_BCP47: Record<SupportedLocale, string> = {
  en: 'en-US',
  mk: 'mk-MK',
};
