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

export function formatSessionQuestionBreakdownLines(
  totalQuestions: number,
  correctAnswers: number,
  t: TFunction = i18n.t.bind(i18n),
): string[] {
  const wrongAnswers = Math.max(0, totalQuestions - correctAnswers);
  return [
    t('progress:sessionTotalQuestions', { count: totalQuestions }),
    t('progress:sessionCorrectAnswers', { count: correctAnswers }),
    t('progress:sessionWrongAnswers', { count: wrongAnswers }),
  ];
}

export function formatSessionHistoryDetailLines(
  entry: {
    sessionMode: SessionModeResult;
    totalQuestions: number;
    correctAnswers: number;
    timedRun?: TimedRunSummary;
  },
  t: TFunction = i18n.t.bind(i18n),
): string[] {
  const wrongAnswers = Math.max(0, entry.totalQuestions - entry.correctAnswers);
  if (entry.sessionMode === 'timed' && entry.timedRun) {
    return formatTimedRunHistoryDetailLines(
      entry.timedRun,
      entry.correctAnswers,
      wrongAnswers,
      t,
    );
  }
  if (entry.sessionMode === 'timed') {
    return [
      ...formatSessionQuestionBreakdownLines(
        entry.totalQuestions,
        entry.correctAnswers,
        t,
      ),
      t('progress:timedRunLegacySummary', {
        correct: entry.correctAnswers,
        wrong: wrongAnswers,
      }),
    ];
  }
  return formatSessionQuestionBreakdownLines(entry.totalQuestions, entry.correctAnswers, t);
}

export function formatTimedRunStartTimeLabel(
  timedRun: TimedRunSummary,
  t: TFunction = i18n.t.bind(i18n),
): string {
  return t('progress:timedRunStartTime', {
    duration: formatTimedSecondsClock(timedRun.initialSeconds),
  });
}

export function formatTimedRunPenaltySettingLabel(
  timedRun: TimedRunSummary,
  t: TFunction = i18n.t.bind(i18n),
): string {
  return t('progress:timedRunPenaltyValue', { seconds: timedRun.penaltySeconds });
}

export function formatTimedRunBonusSettingLabel(
  timedRun: TimedRunSummary,
  t: TFunction = i18n.t.bind(i18n),
): string {
  return t('progress:timedRunBonusValue', { seconds: timedRun.bonusSeconds });
}

export function formatTimedRunCorrectCountLabel(
  count: number,
  t: TFunction = i18n.t.bind(i18n),
): string {
  return t('progress:timedRunCorrectAnswers', { count });
}

export function formatTimedRunWrongCountLabel(
  count: number,
  t: TFunction = i18n.t.bind(i18n),
): string {
  return t('progress:timedRunWrongAnswers', { count });
}

export function formatTimedRunHistoryDetailLines(
  timedRun: TimedRunSummary,
  correctAnswers: number,
  wrongAnswers: number,
  t: TFunction = i18n.t.bind(i18n),
): string[] {
  return [
    formatTimedRunStartTimeLabel(timedRun, t),
    formatTimedRunPenaltySettingLabel(timedRun, t),
    formatTimedRunBonusSettingLabel(timedRun, t),
    formatTimedRunTotalTimeLabel(timedRun, t),
    formatTimedRunCorrectCountLabel(correctAnswers, t),
    formatTimedRunWrongCountLabel(wrongAnswers, t),
  ];
}

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
