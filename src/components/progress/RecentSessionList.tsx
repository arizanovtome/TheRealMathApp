import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { SessionHistoryEntry } from '@/features/progress/sessionHistory.types';
import { RECENT_SESSIONS_DISPLAY_COUNT } from '@/features/progress/sessionHistory';
import {
  formatSessionDayLabel,
  formatSessionModeLabel,
  formatTimedRunSettingsLabel,
  formatTimedRunSurvivedLabel,
} from '@/features/progress/sessionLabels';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type RecentSessionListProps = {
  history: SessionHistoryEntry[];
};

export function RecentSessionList({ history }: RecentSessionListProps) {
  const { t, locale } = useAppTranslation(['progress', 'common']);
  const rows = history.slice(0, RECENT_SESSIONS_DISPLAY_COUNT);

  if (rows.length === 0) {
    return (
      <AppText variant="body" muted>
        {t('progress:noSessions')}
      </AppText>
    );
  }

  return (
    <View style={styles.list} accessibilityRole="list">
      {rows.map((entry, i) => {
        const isTimed = entry.sessionMode === 'timed';
        const timedRun = entry.timedRun;
        const a11yLabel = isTimed && timedRun
          ? `${formatSessionDayLabel(entry.completedAt, locale, t)}, ${formatSessionModeLabel(entry.sessionMode, t)}, ${formatTimedRunSurvivedLabel(timedRun, entry.correctAnswers, t)}`
          : `${formatSessionDayLabel(entry.completedAt, locale, t)}, ${formatSessionModeLabel(entry.sessionMode, t)}, ${entry.scorePercentage} percent`;

        return (
          <View
            key={`${entry.completedAt}-${i}`}
            style={styles.row}
            accessibilityRole="summary"
            accessibilityLabel={a11yLabel}
          >
            <View style={styles.rowMain}>
              <AppText variant="body" style={styles.when}>
                {formatSessionDayLabel(entry.completedAt, locale, t)}
              </AppText>
              <View style={styles.modeBadge}>
                <AppText variant="label" style={styles.modeText}>
                  {formatSessionModeLabel(entry.sessionMode, t)}
                </AppText>
              </View>
              {!isTimed || !timedRun ? (
                <AppText variant="body" style={styles.pct}>
                  {entry.scorePercentage}%
                </AppText>
              ) : null}
            </View>
            {isTimed && timedRun ? (
              <View style={styles.timedDetails}>
                <AppText variant="body" muted style={styles.timedLine}>
                  {formatTimedRunSurvivedLabel(timedRun, entry.correctAnswers, t)}
                </AppText>
                <AppText variant="label" muted style={styles.timedLine}>
                  {formatTimedRunSettingsLabel(timedRun, t)}
                </AppText>
              </View>
            ) : null}
            {isTimed && !timedRun ? (
              <AppText variant="label" muted style={styles.timedFallback}>
                {t('progress:timedRunLegacySummary', {
                  correct: entry.correctAnswers,
                  total: entry.totalQuestions,
                  pct: entry.scorePercentage,
                })}
              </AppText>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.boardDeep,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  when: {
    flex: 1,
    color: colors.textMuted,
    fontWeight: '600',
  },
  modeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modeText: {
    color: colors.primary,
    fontSize: 11,
  },
  pct: {
    fontWeight: '700',
    color: colors.text,
    minWidth: 44,
    textAlign: 'right',
  },
  timedDetails: {
    gap: 2,
    paddingTop: 2,
  },
  timedLine: {
    lineHeight: 20,
  },
  timedFallback: {
    lineHeight: 18,
  },
});
