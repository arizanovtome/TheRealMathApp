import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type StreakCardProps = {
  streak: number;
};

export function StreakCard({ streak }: StreakCardProps) {
  const { t } = useAppTranslation(['progress', 'common']);

  return (
    <View style={styles.streakBlock} accessibilityRole="summary">
      <AppText variant="label" muted>
        {t('common:streak')}
      </AppText>
      <AppText
        variant="title"
        style={styles.streakNumber}
        accessibilityLabel={t('progress:streakDays', { streak })}
      >
        {streak}
      </AppText>
      <AppText variant="body" muted style={styles.streakUnit}>
        {streak === 1 ? t('common:day') : t('common:days')}
      </AppText>
      <AppText variant="body" muted style={styles.streakHint}>
        {streak > 0 ? t('progress:keepStreak') : t('progress:startStreak')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  streakBlock: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.boardDeep,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    alignSelf: 'flex-start',
    minWidth: 140,
  },
  streakNumber: {
    fontSize: 36,
    lineHeight: 42,
    color: colors.primary,
  },
  streakUnit: {
    marginTop: -spacing.xs,
  },
  streakHint: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 18,
  },
});
