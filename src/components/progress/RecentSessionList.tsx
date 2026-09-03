import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { RecentSessionRow } from '@/components/progress/RecentSessionRow';
import type { SessionHistoryEntry, SessionHistoryModeFilter } from '@/features/progress/sessionHistory.types';
import { RECENT_SESSIONS_DISPLAY_COUNT } from '@/features/progress/sessionHistory';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { spacing } from '@/theme/spacing';

type RecentSessionListProps = {
  history: SessionHistoryEntry[];
  modeFilter?: SessionHistoryModeFilter;
};

function emptySessionsMessage(
  modeFilter: SessionHistoryModeFilter,
  t: ReturnType<typeof useAppTranslation>['t'],
): string {
  switch (modeFilter) {
    case 'practice':
      return t('progress:noSessionsPractice');
    case 'quiz':
      return t('progress:noSessionsQuiz');
    case 'timed':
      return t('progress:noSessionsTimed');
    default:
      return t('progress:noSessions');
  }
}

export function RecentSessionList({ history, modeFilter = 'all' }: RecentSessionListProps) {
  const { t, locale } = useAppTranslation(['progress', 'common']);
  const rows = history.slice(0, RECENT_SESSIONS_DISPLAY_COUNT);

  if (rows.length === 0) {
    return (
      <AppText variant="body" muted>
        {emptySessionsMessage(modeFilter, t)}
      </AppText>
    );
  }

  return (
    <View style={styles.list} accessibilityRole="list">
      {rows.map((entry, i) => (
        <RecentSessionRow key={`${entry.completedAt}-${i}`} entry={entry} locale={locale} t={t} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
});
