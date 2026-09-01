import type { TFunction } from 'i18next';

import { formatTimedSecondsClock } from '@/features/learning-plan/timedRun.utils';
import type { TimedRunSummary } from '@/features/questions/questionScoring';
import { i18n } from '@/i18n';
import type { SupportedLocale } from '@/i18n/types';
import { LOCALE_BCP47 } from '@/i18n/types';
import type { SessionModeResult } from '@/features/questions/questionScoring';
import { localDateKey, parseIsoToLocalDateKey, previousLocalDateKey } from '@/features/progress/sessionHistory';

export function formatTimedRunSurvivedLabel(
  timedRun: TimedRunSummary,
  correctAnswers: number,
  t: TFunction = i18n.t.bind(i18n),
): string {
  return t('progress:timedRunSummary', {
    duration: formatTimedSecondsClock(timedRun.survivedSeconds),
    correct: correctAnswers,
  });
}

export function formatTimedRunSettingsLabel(
  timedRun: TimedRunSummary,
  t: TFunction = i18n.t.bind(i18n),
): string {
  const parts: string[] = [];
  if (timedRun.bonusSeconds > 0) parts.push(`+${timedRun.bonusSeconds}s`);
  if (timedRun.penaltySeconds > 0) parts.push(`−${timedRun.penaltySeconds}s`);
  if (parts.length === 0) {
    return t('progress:timedRunStartedOnly', {
      duration: formatTimedSecondsClock(timedRun.initialSeconds),
    });
  }
  return t('progress:timedRunSettings', {
    duration: formatTimedSecondsClock(timedRun.initialSeconds),
    adjustments: parts.join(' / '),
  });
}

export function formatSessionModeLabel(mode: SessionModeResult, t = i18n.t.bind(i18n)): string {
  if (mode === 'quiz') return t('common:quiz');
  if (mode === 'timed') return t('common:timed');
  return t('common:practice');
}

export function formatSessionModeShort(mode: SessionModeResult, t = i18n.t.bind(i18n)): string {
  if (mode === 'quiz') return t('common:modeQ');
  if (mode === 'timed') return t('common:modeTR');
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
