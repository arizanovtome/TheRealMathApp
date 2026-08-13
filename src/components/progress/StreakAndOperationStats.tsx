import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { getOperationLabel } from '@/constants/operationLabels';
import { ALL_MATH_OPERATIONS } from '@/features/learning-plan/learningPlan.types';
import type { MathOperation } from '@/features/learning-plan/learningPlan.types';
import type { OperationCorrectSnapshot } from '@/features/progress/adaptation';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

const OPS_ORDER = ALL_MATH_OPERATIONS;

type StreakAndOperationStatsProps = {
  streak: number;
  snapshots: Record<MathOperation, OperationCorrectSnapshot>;
};

export function StreakAndOperationStats({ streak, snapshots }: StreakAndOperationStatsProps) {
  const { t } = useAppTranslation(['progress', 'common']);

  return (
    <View style={styles.row}>
      <View style={styles.streakBlock} accessibilityRole="summary">
        <AppText variant="label" muted>
          {t('common:streak')}
        </AppText>
        <AppText variant="title" style={styles.streakNumber} accessibilityLabel={t('progress:streakDays', { streak })}>
          {streak}
        </AppText>
        <AppText variant="body" muted style={styles.streakUnit}>
          {streak === 1 ? t('common:day') : t('common:days')}
        </AppText>
        <AppText variant="body" muted style={styles.streakHint}>
          {streak > 0 ? t('progress:keepStreak') : t('progress:startStreak')}
        </AppText>
      </View>

      <View style={styles.opsBlock} accessibilityRole="list">
        <AppText variant="label" muted style={styles.opsHeading}>
          {t('common:correctAnswers')}
        </AppText>
        {OPS_ORDER.map((op) => {
          const snap = snapshots[op]!;
          const label = getOperationLabel(op, t);
          const pctLabel =
            snap.attempted === 0 ? '—' : `${snap.correctPercent}%`;
          const a11y =
            snap.attempted === 0
              ? t('progress:opNoProblems', { label })
              : t('progress:opStats', {
                  label,
                  pct: snap.correctPercent,
                  attempted: snap.attempted,
                });
          return (
            <View key={op} style={styles.opRow} accessibilityRole="text" accessibilityLabel={a11y}>
              <AppText variant="body" style={styles.opName}>
                {label}
              </AppText>
              <AppText variant="body" style={styles.opPct}>
                {pctLabel}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  streakBlock: {
    minWidth: 120,
    maxWidth: 160,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.boardDeep,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
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
  opsBlock: {
    flex: 1,
    minWidth: 200,
    gap: spacing.xs,
  },
  opsHeading: {
    marginBottom: spacing.xs,
  },
  opRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.boardDeep,
    borderWidth: 1,
    borderColor: colors.border,
  },
  opName: {
    color: colors.text,
    flex: 1,
  },
  opPct: {
    fontWeight: '700',
    color: colors.primary,
    minWidth: 48,
    textAlign: 'right',
  },
});
