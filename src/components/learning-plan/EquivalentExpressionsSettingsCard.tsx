import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { CompactSwitch } from '@/components/learning-plan/CompactSwitch';
import { OperationConfigCard } from '@/components/learning-plan/OperationConfigCard';
import {
  EQUIVALENT_EXPRESSION_TOGGLES,
  type EquivalentExpressionToggleKey,
} from '@/features/equivalent-expressions/equivalentExpressions.types';
import { hasAnyEquivalentExpressionSubtype } from '@/features/equivalent-expressions/equivalentExpressionsConfig.utils';
import {
  DEFAULT_EQUIVALENT_EXPRESSIONS_CONFIG,
  type EquivalentExpressionsConfig,
} from '@/features/learning-plan/learningPlan.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { spacing } from '@/theme/spacing';

type Props = {
  config: EquivalentExpressionsConfig;
  onChange: (config: EquivalentExpressionsConfig) => void;
};

const LABEL_KEYS: Record<EquivalentExpressionToggleKey, string> = {
  squareOfSum: 'settings:squareOfSum',
  squareOfDifference: 'settings:squareOfDifference',
  parenthesesAfterAddition: 'settings:parenthesesAfterAddition',
  parenthesesAfterSubtraction: 'settings:parenthesesAfterSubtraction',
  distributiveProperty: 'settings:distributiveProperty',
  differenceOfSquares: 'settings:differenceOfSquares',
  factorization: 'settings:factorization',
};

export function EquivalentExpressionsSettingsCard({ config, onChange }: Props) {
  const { t } = useAppTranslation(['settings', 'common']);
  return (
    <OperationConfigCard
      operation="equivalent_expressions"
      enabled={config.enabled}
      onToggle={(enabled) => {
        if (!enabled) {
          onChange({ ...config, enabled: false });
          return;
        }
        onChange(
          hasAnyEquivalentExpressionSubtype(config)
            ? { ...config, enabled: true }
            : { ...DEFAULT_EQUIVALENT_EXPRESSIONS_CONFIG, enabled: true },
        );
      }}
    >
      <AppText variant="body" muted>{t('settings:equivalentExpressionsDesc')}</AppText>
      <View style={styles.options}>
        <AppText variant="label" muted>{t('settings:questionTypes')}</AppText>
        {EQUIVALENT_EXPRESSION_TOGGLES.map((key) => {
          const label = t(LABEL_KEYS[key]);
          return (
            <View key={key} style={styles.row}>
              <AppText variant="label" style={styles.label}>{label}</AppText>
              <CompactSwitch
                accessibilityLabel={label}
                value={config[key]}
                onValueChange={(value) => onChange({ ...config, [key]: value })}
                disabled={!config.enabled}
              />
            </View>
          );
        })}
      </View>
    </OperationConfigCard>
  );
}

const styles = StyleSheet.create({
  options: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    flex: 1,
  },
});
