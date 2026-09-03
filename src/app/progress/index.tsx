import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { OperationStatsByTopic } from '@/components/progress/OperationStatsByTopic';
import { RecentSessionList } from '@/components/progress/RecentSessionList';
import { SessionModeFilter } from '@/components/progress/SessionModeFilter';
import { StreakCard } from '@/components/progress/StreakCard';
import { computeOperationCorrectSnapshots, hasOperationStatsSnapshots } from '@/features/progress/adaptation';
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
  const filteredSnapshots = useMemo(
    () => computeOperationCorrectSnapshots(filteredHistory, SESSION_HISTORY_LIMIT),
    [filteredHistory],
  );
  const showTopicStats = hasOperationStatsSnapshots(filteredSnapshots);
  const filteredAvg = averageScoreRecent(filteredHistory, RECENT_SESSIONS_DISPLAY_COUNT);

  const modeLabel =
    modeFilter === 'practice'
      ? t('common:practice')
      : modeFilter === 'quiz'
        ? t('common:quiz')
        : modeFilter === 'timed'
          ? t('common:timed')
          : null;

  return (
    <AppScreen scroll>
      <AppText variant="title">{t('progress:title')}</AppText>
      <AppText variant="body" muted>
        {t('progress:subtitle', { limit: SESSION_HISTORY_LIMIT })}
      </AppText>

      <Card>
        <StreakCard streak={streak} />
      </Card>

      <View style={styles.section}>
        <AppText variant="subtitle">{t('common:sessions')}</AppText>
        <SessionModeFilter value={modeFilter} onChange={setModeFilter} />
        {filteredAvg !== null ? (
          <AppText variant="body" muted>
            {modeFilter !== 'all' && modeLabel
              ? t('progress:filteredAvg', {
                  n: Math.min(filteredHistory.length, RECENT_SESSIONS_DISPLAY_COUNT),
                  avg: filteredAvg,
                  mode: modeLabel,
                })
              : t('progress:overallAvg', {
                  n: Math.min(filteredHistory.length, RECENT_SESSIONS_DISPLAY_COUNT),
                  avg: filteredAvg,
                })}
          </AppText>
        ) : null}
        <RecentSessionList history={filteredHistory} modeFilter={modeFilter} />
      </View>

      {showTopicStats ? (
        <View style={styles.section}>
          <AppText variant="subtitle">{t('progress:topicAccuracy')}</AppText>
          <OperationStatsByTopic snapshots={filteredSnapshots} />
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
});
