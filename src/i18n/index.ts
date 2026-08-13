import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resources } from '@/i18n/resources';
import { DEFAULT_LOCALE, type SupportedLocale, SUPPORTED_LOCALES } from '@/i18n/types';

export function normalizeLocale(code: string | undefined | null): SupportedLocale {
  if (!code) return DEFAULT_LOCALE;
  const base = code.toLowerCase().split('-')[0];
  if (base === 'mk') return 'mk';
  return DEFAULT_LOCALE;
}

export function resolveDeviceLocale(): SupportedLocale {
  try {
    const locales = Localization.getLocales();
    for (const locale of locales) {
      const resolved = normalizeLocale(locale.languageCode ?? locale.languageTag);
      if (resolved === 'mk') return 'mk';
    }
  } catch {
    // Native module unavailable (wrong dev client build or Expo Go without the module).
  }
  return DEFAULT_LOCALE;
}

export function resolveInitialLocale(persistedLocale: SupportedLocale | undefined): SupportedLocale {
  if (persistedLocale && SUPPORTED_LOCALES.includes(persistedLocale)) {
    return persistedLocale;
  }
  return resolveDeviceLocale();
}

let initialized = false;

export async function initI18n(locale: SupportedLocale): Promise<void> {
  if (initialized && i18n.language === locale) return;

  if (!initialized) {
    await i18n.use(initReactI18next).init({
      resources,
      lng: locale,
      fallbackLng: DEFAULT_LOCALE,
      defaultNS: 'common',
      ns: [
        'common',
        'navigation',
        'home',
        'onboarding',
        'settings',
        'practice',
        'progress',
        'privacy',
        'questions',
      ],
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
    });
    initialized = true;
    return;
  }

  await i18n.changeLanguage(locale);
}

export async function changeAppLanguage(locale: SupportedLocale): Promise<void> {
  await initI18n(locale);
  await i18n.changeLanguage(locale);
}

export { i18n };
