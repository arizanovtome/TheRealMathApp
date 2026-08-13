import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { SessionHistoryEntry } from '@/features/progress/sessionHistory.types';
import { RECENT_SESSIONS_DISPLAY_COUNT } from '@/features/progress/sessionHistory';
import { formatSessionDayLabel, formatSessionModeLabel } from '@/features/progress/sessionLabels';
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
      {rows.map((entry, i) => (
        <View
          key={`${entry.completedAt}-${i}`}
          style={styles.row}
          accessibilityRole="summary"
          accessibilityLabel={`${formatSessionDayLabel(entry.completedAt, locale, t)}, ${formatSessionModeLabel(entry.sessionMode, t)}, ${entry.scorePercentage} percent`}>
          <AppText variant="body" style={styles.when}>
            {formatSessionDayLabel(entry.completedAt, locale, t)}
          </AppText>
          <View style={styles.modeBadge}>
            <AppText variant="label" style={styles.modeText}>
              {formatSessionModeLabel(entry.sessionMode, t)}
            </AppText>
          </View>
          <AppText variant="body" style={styles.pct}>
            {entry.scorePercentage}%
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.boardDeep,
    borderWidth: 1,
    borderColor: colors.border,
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
});
