import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { RecentSessionList } from '@/components/progress/RecentSessionList';
import { SessionModeFilter } from '@/components/progress/SessionModeFilter';
import { StreakAndOperationStats } from '@/components/progress/StreakAndOperationStats';
import { computeOperationCorrectSnapshots } from '@/features/progress/adaptation';
import type { SessionHistoryModeFilter } from '@/features/progress/sessionHistory.types';
import {
  RECENT_SESSIONS_DISPLAY_COUNT,
  SESSION_HISTORY_LIMIT,
  averageScoreRecent,
  computeCurrentStreak,
  filterSessionHistory,
} from '@/features/progress/sessionHistory';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { useAppStore } from '@/store/useAppStore';
import { selectActiveSessionHistory } from '@/store/profileSelectors';
import { spacing } from '@/theme/spacing';

export default function ProgressScreen() {
  const { t } = useAppTranslation(['progress', 'common']);
  const sessionHistory = useAppStore(selectActiveSessionHistory);
  const [modeFilter, setModeFilter] = useState<SessionHistoryModeFilter>('all');

  const filteredHistory = useMemo(
    () => filterSessionHistory(sessionHistory, modeFilter),
    [modeFilter, sessionHistory],
  );

  const streak = computeCurrentStreak(sessionHistory);
  const snapshots = computeOperationCorrectSnapshots(sessionHistory, SESSION_HISTORY_LIMIT);
  const filteredAvg = averageScoreRecent(filteredHistory, RECENT_SESSIONS_DISPLAY_COUNT);

  return (
    <AppScreen scroll>
      <AppText variant="title">{t('progress:title')}</AppText>
      <AppText variant="body" muted>
        {t('progress:subtitle', { limit: SESSION_HISTORY_LIMIT })}
      </AppText>

      <Card>
        <StreakAndOperationStats streak={streak} snapshots={snapshots} />
        {filteredAvg !== null && modeFilter !== 'all' ? (
          <AppText variant="body" muted style={styles.avgLine}>
            {t('progress:filteredAvg', {
              n: Math.min(filteredHistory.length, RECENT_SESSIONS_DISPLAY_COUNT),
              avg: filteredAvg,
              mode:
                modeFilter === 'practice'
                  ? t('common:practice')
                  : modeFilter === 'quiz'
                    ? t('common:quiz')
                    : t('common:timed'),
            })}
          </AppText>
        ) : filteredAvg !== null ? (
          <AppText variant="body" muted style={styles.avgLine}>
            {t('progress:overallAvg', {
              n: Math.min(sessionHistory.length, RECENT_SESSIONS_DISPLAY_COUNT),
              avg: filteredAvg,
            })}
          </AppText>
        ) : null}
      </Card>

      <View style={styles.section}>
        <AppText variant="subtitle">{t('common:sessions')}</AppText>
        <SessionModeFilter value={modeFilter} onChange={setModeFilter} />
        <RecentSessionList history={filteredHistory} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  avgLine: {
    marginTop: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
});
