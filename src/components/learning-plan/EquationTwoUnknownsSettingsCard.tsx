import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { OperationConfigCard } from '@/components/learning-plan/OperationConfigCard';
import { getOperationLabel } from '@/constants/operationLabels';
import type { EquationTwoUnknownsConfig, MathOperation } from '@/features/learning-plan/learningPlan.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type EquationTwoUnknownsSettingsCardProps = {
  config: EquationTwoUnknownsConfig;
  onChange: (config: EquationTwoUnknownsConfig) => void;
};

const OPERATORS: {
  key: keyof EquationTwoUnknownsConfig['operators'];
  operation: MathOperation;
}[] = [
  { key: 'addition', operation: 'addition' },
  { key: 'subtraction', operation: 'subtraction' },
  { key: 'multiplication', operation: 'multiplication' },
  { key: 'division', operation: 'division' },
];

export function EquationTwoUnknownsSettingsCard({
  config,
  onChange,
}: EquationTwoUnknownsSettingsCardProps) {
  const { t } = useAppTranslation(['settings', 'common']);

  const toggleOperator = (key: keyof EquationTwoUnknownsConfig['operators']) => {
    const operators = { ...config.operators, [key]: !config.operators[key] };
    onChange({
      enabled: Object.values(operators).some(Boolean),
      operators,
    });
  };

  return (
    <OperationConfigCard
      title={t('settings:systemsEquations')}
      offHint={t('settings:systemsEquationsDesc')}
      enabled={config.enabled}
      onToggle={(enabled) => {
        if (!enabled) {
          onChange({
            enabled: false,
            operators: {
              addition: false,
              subtraction: false,
              multiplication: false,
              division: false,
            },
          });
          return;
        }
        onChange({
          ...config,
          enabled: true,
          operators: {
            addition: true,
            subtraction: true,
            multiplication: false,
            division: false,
          },
        });
      }}
    >
      <AppText variant="body" muted>
        {t('settings:systemsEquationsDesc')}
      </AppText>
      <View style={styles.operatorRow}>
        {OPERATORS.map(({ key, operation }) => {
          const label = getOperationLabel(operation, t);
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: config.operators[key] }}
              disabled={!config.enabled}
              onPress={() => toggleOperator(key)}
              style={[
                styles.operatorChip,
                config.operators[key] && styles.operatorChipOn,
                !config.enabled && styles.operatorChipDisabled,
              ]}
            >
              <AppText
                variant="label"
                style={[styles.operatorText, config.operators[key] && styles.operatorTextOn]}
              >
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </OperationConfigCard>
  );
}

const styles = StyleSheet.create({
  operatorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  operatorChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  operatorChipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  operatorChipDisabled: {
    opacity: 0.5,
  },
  operatorText: {
    color: colors.text,
  },
  operatorTextOn: {
    color: colors.buttonPrimaryText,
  },
});
