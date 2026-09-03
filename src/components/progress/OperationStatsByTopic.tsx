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

type OperationStatsByTopicProps = {
  snapshots: Record<MathOperation, OperationCorrectSnapshot>;
};

export function OperationStatsByTopic({ snapshots }: OperationStatsByTopicProps) {
  const { t } = useAppTranslation(['progress', 'common']);
  const topicsWithData = OPS_ORDER.filter((op) => snapshots[op]!.attempted > 0);

  if (topicsWithData.length === 0) return null;

  return (
    <View style={styles.opsBlock} accessibilityRole="list">
      {topicsWithData.map((op) => {
        const snap = snapshots[op]!;
        const label = getOperationLabel(op, t);
        const pctLabel = `${snap.correctPercent}%`;
        const a11y = t('progress:opStats', {
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
  );
}

const styles = StyleSheet.create({
  opsBlock: {
    gap: spacing.xs,
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
