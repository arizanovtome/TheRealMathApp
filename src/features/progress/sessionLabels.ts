import { i18n } from '@/i18n';
import type { SupportedLocale } from '@/i18n/types';
import { LOCALE_BCP47 } from '@/i18n/types';
import type { SessionModeResult } from '@/features/questions/questionScoring';
import { localDateKey, parseIsoToLocalDateKey, previousLocalDateKey } from '@/features/progress/sessionHistory';

export function formatSessionModeLabel(mode: SessionModeResult, t = i18n.t.bind(i18n)): string {
  if (mode === 'quiz') return t('common:quiz');
  if (mode === 'timed') return t('common:timed');
  return t('common:practice');
}

export function formatSessionModeShort(mode: SessionModeResult, t = i18n.t.bind(i18n)): string {
  if (mode === 'quiz') return t('common:modeQ');
  if (mode === 'timed') return t('common:modeT');
  return t('common:modeP');
}

export function formatSessionDayLabel(
  iso: string,
  locale: SupportedLocale = i18n.language as SupportedLocale,
  t = i18n.t.bind(i18n),
): string {
  const todayKey = localDateKey(new Date());
  const yesterdayKey = previousLocalDateKey(todayKey);
  const key = parseIsoToLocalDateKey(iso);
  if (key === todayKey) return t('common:today');
  if (key === yesterdayKey) return t('common:yesterday');
  return new Date(iso).toLocaleDateString(LOCALE_BCP47[locale] ?? LOCALE_BCP47.en, {
    month: 'short',
    day: 'numeric',
  });
}
