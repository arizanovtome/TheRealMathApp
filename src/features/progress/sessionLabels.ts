import type { TFunction } from 'i18next';

import {
  formatTimedSecondsClock,
} from '@/features/learning-plan/timedRun.utils';
import type {
  SessionModeResult,
  TimedRunSummary,
} from '@/features/questions/questionScoring';
import { i18n } from '@/i18n';
import type { SupportedLocale } from '@/i18n/types';
import { LOCALE_BCP47 } from '@/i18n/types';
import { localDateKey, parseIsoToLocalDateKey, previousLocalDateKey } from '@/features/progress/sessionHistory';

export function formatTimedRunTotalTimeLabel(
  timedRun: TimedRunSummary,
  t: TFunction = i18n.t.bind(i18n),
): string {
  return t('progress:timedRunTotalTime', {
    duration: formatTimedSecondsClock(timedRun.survivedSeconds),
  });
}

export function formatTimedRunAdjustmentsLabel(
  timedRun: TimedRunSummary,
  t: TFunction = i18n.t.bind(i18n),
): string {
  return t('progress:timedRunAdjustments', {
    bonus: timedRun.bonusSeconds,
    penalty: timedRun.penaltySeconds,
  });
}

export function formatTimedRunStartSettingsLabel(
  timedRun: TimedRunSummary,
  t: TFunction = i18n.t.bind(i18n),
): string {
  return t('progress:timedRunStartSettings', {
    duration: formatTimedSecondsClock(timedRun.initialSeconds),
    adjustments: formatTimedRunAdjustmentsLabel(timedRun, t),
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
