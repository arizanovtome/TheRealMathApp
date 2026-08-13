import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import type { SessionHistoryEntry } from '@/features/progress/sessionHistory.types';
import {
  RECENT_SESSIONS_DISPLAY_COUNT,
  averageScoreRecent,
  computeCurrentStreak,
} from '@/features/progress/sessionHistory';
import { formatSessionModeLabel, formatSessionModeShort } from '@/features/progress/sessionLabels';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type ProgressInsightsProps = {
  history: SessionHistoryEntry[];
  variant?: 'full' | 'compact';
};

export function ProgressInsights({ history, variant = 'full' }: ProgressInsightsProps) {
  const { t } = useAppTranslation(['progress', 'common']);

  if (history.length === 0) {
    return null;
  }

  const streak = computeCurrentStreak(history);
  const recentAvg = averageScoreRecent(history, RECENT_SESSIONS_DISPLAY_COUNT);
  const recentSlice = history.slice(0, RECENT_SESSIONS_DISPLAY_COUNT);

  if (variant === 'compact') {
    const streakPart =
      streak > 0 ? t('progress:streakDays', { streak }) : t('progress:growStreak');
    const n = Math.min(history.length, RECENT_SESSIONS_DISPLAY_COUNT);
    const avgPart = recentAvg !== null ? t('progress:lastAvg', { n, avg: recentAvg }) : null;
    return (
      <AppText variant="body" muted accessibilityRole="text">
        {streakPart}
        {avgPart ? ` · ${avgPart}` : null}
      </AppText>
    );
  }

  return (
    <Card>
      <AppText variant="subtitle">{t('common:yourProgress')}</AppText>
      <AppText variant="body">
        {streak === 1
          ? t('progress:streakOneDay')
          : streak > 1
            ? t('progress:streakDays', { streak })
            : t('progress:startStreak')}
      </AppText>
      {recentAvg !== null ? (
        <AppText variant="body" muted>
          {t('progress:lastSessionsAvg', {
            n: Math.min(history.length, RECENT_SESSIONS_DISPLAY_COUNT),
            pct: recentAvg,
          })}
        </AppText>
      ) : null}
      <AppText variant="label" muted style={styles.recentLabel}>
        {t('progress:recentScores')}
      </AppText>
      <View style={styles.chipRow} accessibilityRole="list">
        {recentSlice.map((entry, i) => (
          <View
            key={`${entry.completedAt}-${i}`}
            style={styles.chip}
            accessibilityRole="text"
            accessibilityLabel={t('progress:sessionA11y', {
              mode: formatSessionModeLabel(entry.sessionMode, t),
              pct: entry.scorePercentage,
            })}>
            <AppText variant="body" style={styles.chipMode}>
              {formatSessionModeShort(entry.sessionMode, t)}
            </AppText>
            <AppText variant="body" style={styles.chipPct}>
              {entry.scorePercentage}%
            </AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  recentLabel: {
    marginTop: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.boardDeep,
  },
  chipMode: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  chipPct: {
    color: colors.text,
    fontWeight: '600',
  },
});
