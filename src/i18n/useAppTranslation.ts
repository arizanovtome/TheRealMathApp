import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { changeAppLanguage } from '@/i18n';
import type { SupportedLocale } from '@/i18n/types';
import { useAppStore } from '@/store/useAppStore';

export function useAppTranslation(ns?: string | string[]) {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const translation = useTranslation(ns);

  const switchLocale = useCallback(
    async (next: SupportedLocale) => {
      await changeAppLanguage(next);
      setLocale(next);
    },
    [setLocale],
  );

  return {
    ...translation,
    locale,
    switchLocale,
  };
}
