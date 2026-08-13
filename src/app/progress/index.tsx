import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { RecentSessionList } from '@/components/progress/RecentSessionList';
import { StreakAndOperationStats } from '@/components/progress/StreakAndOperationStats';
import { computeOperationCorrectSnapshots } from '@/features/progress/adaptation';
import {
  RECENT_SESSIONS_DISPLAY_COUNT,
  SESSION_HISTORY_LIMIT,
  averageScoreRecent,
  computeCurrentStreak,
} from '@/features/progress/sessionHistory';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { useAppStore } from '@/store/useAppStore';
import { selectActiveSessionHistory } from '@/store/profileSelectors';
import { spacing } from '@/theme/spacing';

export default function ProgressScreen() {
  const { t } = useAppTranslation(['progress', 'common']);
  const sessionHistory = useAppStore(selectActiveSessionHistory);

  const streak = computeCurrentStreak(sessionHistory);
  const snapshots = computeOperationCorrectSnapshots(sessionHistory, SESSION_HISTORY_LIMIT);
  const recentAvg = averageScoreRecent(sessionHistory, RECENT_SESSIONS_DISPLAY_COUNT);

  return (
    <AppScreen scroll>
      <AppText variant="title">{t('progress:title')}</AppText>
      <AppText variant="body" muted>
        {t('progress:subtitle', { limit: SESSION_HISTORY_LIMIT })}
      </AppText>

      <Card>
        <StreakAndOperationStats streak={streak} snapshots={snapshots} />
        {recentAvg !== null ? (
          <AppText variant="body" muted style={styles.avgLine}>
            {t('progress:overallAvg', {
              n: Math.min(sessionHistory.length, RECENT_SESSIONS_DISPLAY_COUNT),
              avg: recentAvg,
            })}
          </AppText>
        ) : null}
      </Card>

      <View style={styles.section}>
        <AppText variant="subtitle">{t('common:sessions')}</AppText>
        <RecentSessionList history={sessionHistory} />
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
