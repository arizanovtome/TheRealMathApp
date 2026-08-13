import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { CompactSwitch } from '@/components/learning-plan/CompactSwitch';
import { OperationConfigCard } from '@/components/learning-plan/OperationConfigCard';
import { COMPARISON_SUBTYPE_TOGGLES, type ComparisonSubtypeToggleKey } from '@/features/comparison/comparison.types';
import { hasAnyComparisonSubtypeToggle } from '@/features/comparison/comparisonConfig.utils';
import type { ComparisonConfig } from '@/features/learning-plan/learningPlan.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type ComparisonSettingsCardProps = {
  comparison: ComparisonConfig;
  onChange: (comparison: ComparisonConfig) => void;
};

const COMPARISON_LABEL_KEYS: Record<ComparisonSubtypeToggleKey, string> = {
  relational: 'settings:relational',
  ordering: 'settings:ordering',
  fractionVsDecimal: 'settings:fractionVsDecimal',
  percentVsFraction: 'settings:percentVsFraction',
  fractionVsFraction: 'settings:fractionVsFraction',
  measurementUnitConversion: 'settings:measurement',
};

export function ComparisonSettingsCard({ comparison, onChange }: ComparisonSettingsCardProps) {
  const { t } = useAppTranslation(['settings', 'common']);
  const disabled = !comparison.enabled;

  const toggleSubtype = (key: ComparisonSubtypeToggleKey) => {
    onChange({ ...comparison, [key]: !comparison[key] });
  };

  return (
    <OperationConfigCard
      operation="comparison"
      enabled={comparison.enabled}
      onToggle={(enabled) => {
        if (!enabled) {
          onChange({ ...comparison, enabled: false });
          return;
        }
        const hasAny = hasAnyComparisonSubtypeToggle(comparison);
        onChange({
          ...comparison,
          enabled: true,
          relational: hasAny ? comparison.relational : true,
          ordering: hasAny ? comparison.ordering : true,
        });
      }}
    >
      <AppText variant="body" muted>
        {t('settings:comparisonDesc')}
      </AppText>

      <View style={styles.section}>
        <AppText variant="label" muted>
          {t('settings:questionTypes')}
        </AppText>
        <View style={styles.chipRow}>
          {COMPARISON_SUBTYPE_TOGGLES.map(({ key }) => {
            const selected = comparison[key];
            const label = t(COMPARISON_LABEL_KEYS[key]);
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                disabled={disabled}
                onPress={() => toggleSubtype(key)}
                style={[
                  styles.chip,
                  selected && styles.chipSelected,
                  disabled && styles.chipDisabled,
                ]}
              >
                <AppText
                  variant="label"
                  style={selected ? styles.chipTextSelected : styles.chipText}
                >
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.switchSection}>
        <View style={styles.rowBetween}>
          <AppText variant="label" style={styles.switchLabel}>
            {t('settings:expressionCompare')}
          </AppText>
          <CompactSwitch
            accessibilityLabel={t('settings:expressionCompare')}
            value={comparison.expressionCompare}
            onValueChange={(expressionCompare) => onChange({ ...comparison, expressionCompare })}
            disabled={disabled}
          />
        </View>
        <AppText variant="body" muted>
          {t('settings:expressionCompareHint')}
        </AppText>
      </View>
    </OperationConfigCard>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.primary,
  },
  switchSection: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  switchLabel: {
    flex: 1,
  },
});
