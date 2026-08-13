import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { StackedFraction } from '@/components/fractions/MathDisplayText';
import type { FractionStackSpec } from '@/features/learning-plan/fractionModeExamples';
import {
  getFractionModeExampleGroups,
  formatFractionModeExampleA11y,
} from '@/features/learning-plan/fractionModeExamples';
import type { FractionDenominatorMode } from '@/features/learning-plan/learningPlan.types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type FractionExpressionNotationProps = {
  fractions: FractionStackSpec[];
  operator: string;
  muted?: boolean;
  selected?: boolean;
};

export function FractionExpressionNotation({
  fractions,
  operator,
  muted = false,
  selected = false,
}: FractionExpressionNotationProps) {
  if (fractions.length === 0) return null;

  const operatorColor = selected ? colors.primary : muted ? colors.textMuted : colors.text;

  return (
    <View style={styles.expressionRow} accessibilityElementsHidden importantForAccessibility="no">
      {fractions.map((fraction, index) => (
        <View key={`${fraction.numerator}-${fraction.denominator}-${index}`} style={styles.termWrap}>
          {index > 0 ? (
            <AppText variant="body" style={[styles.operator, { color: operatorColor }]}>
              {operator}
            </AppText>
          ) : null}
          <StackedFraction
            numerator={fraction.numerator}
            denominator={fraction.denominator}
            size="sm"
            muted={muted}
            selected={selected}
          />
        </View>
      ))}
    </View>
  );
}

type FractionDenominatorModeExampleProps = {
  mode: FractionDenominatorMode;
  operator: string;
  examplePrefix: string;
  exampleOr: string;
  muted?: boolean;
  selected?: boolean;
};

export function FractionDenominatorModeExample({
  mode,
  operator,
  examplePrefix,
  exampleOr,
  muted = false,
  selected = false,
}: FractionDenominatorModeExampleProps) {
  const groups = getFractionModeExampleGroups(mode);

  return (
    <View style={styles.exampleWrap} accessibilityElementsHidden importantForAccessibility="no">
      <AppText variant="body" muted={muted} style={selected ? styles.prefixSelected : undefined}>
        {examplePrefix}
      </AppText>
      <View style={styles.groupsRow}>
        {groups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.groupWrap}>
            {groupIndex > 0 ? (
              <AppText variant="body" muted={muted} style={styles.orLabel}>
                {exampleOr}
              </AppText>
            ) : null}
            <FractionExpressionNotation
              fractions={group}
              operator={operator}
              muted={muted}
              selected={selected}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

export { formatFractionModeExampleA11y, getFractionModeExampleGroups };

const styles = StyleSheet.create({
  exampleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  prefixSelected: {
    color: colors.primary,
  },
  groupsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  groupWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  orLabel: {
    fontStyle: 'italic',
  },
  expressionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operator: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '500',
    marginHorizontal: spacing.xs,
    alignSelf: 'center',
  },
});
