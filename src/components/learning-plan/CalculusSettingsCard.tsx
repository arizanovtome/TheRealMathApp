import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { OperationConfigCard } from '@/components/learning-plan/OperationConfigCard';
import type { CalculusOpConfig } from '@/features/calculus/calculus.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type CalculusSettingsOperation = 'differentiation' | 'integration';

type CalculusSettingsCardProps = {
  operation: CalculusSettingsOperation;
  description?: string;
  config: CalculusOpConfig;
  onChange: (config: CalculusOpConfig) => void;
  /** When true, show the simple-sum toggle (two-term expressions). */
  showSimpleSum?: boolean;
};

const SUBTYPE_TOGGLES = [
  { key: 'powerRule' as const, labelKey: 'settings:powerRule' },
  { key: 'constantRule' as const, labelKey: 'settings:constants' },
  { key: 'naturalLogRule' as const, labelKey: 'settings:naturalLogRule' },
  { key: 'trigRule' as const, labelKey: 'settings:calculusTrigRule' },
] as const;

const QUOTIENT_TOGGLE_BY_OPERATION = {
  differentiation: { key: 'quotientRule' as const, labelKey: 'settings:calculusQuotientRule' },
  integration: { key: 'quotientRule' as const, labelKey: 'settings:calculusFractionSimplify' },
} as const;

export function CalculusSettingsCard({
  operation,
  description,
  config,
  onChange,
  showSimpleSum = true,
}: CalculusSettingsCardProps) {
  const { t } = useAppTranslation(['settings', 'common']);
  const disabled = !config.enabled;

  return (
    <OperationConfigCard
      operation={operation}
      enabled={config.enabled}
      onToggle={(enabled) => onChange({ ...config, enabled })}
    >
      {description ? (
        <AppText variant="body" muted>
          {description}
        </AppText>
      ) : null}

      <View style={styles.section}>
        <AppText variant="label" muted>
          {t('settings:questionTypes')}
        </AppText>
        <View style={styles.chipRow}>
          {SUBTYPE_TOGGLES.map(({ key, labelKey }) => {
            const selected = config[key];
            const label = t(labelKey);
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                disabled={disabled}
                onPress={() => onChange({ ...config, [key]: !config[key] })}
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
          {(() => {
            const { key, labelKey } = QUOTIENT_TOGGLE_BY_OPERATION[operation];
            const label = t(labelKey);
            const selected = config[key];
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                disabled={disabled}
                onPress={() => onChange({ ...config, [key]: !config[key] })}
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
          })()}
          {showSimpleSum ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('settings:simpleSum')}
              accessibilityState={{ selected: config.simpleSum }}
              disabled={disabled}
              onPress={() => onChange({ ...config, simpleSum: !config.simpleSum })}
              style={[
                styles.chip,
                config.simpleSum && styles.chipSelected,
                disabled && styles.chipDisabled,
              ]}
            >
              <AppText
                variant="label"
                style={config.simpleSum ? styles.chipTextSelected : styles.chipText}
              >
                {t('settings:simpleSum')}
              </AppText>
            </Pressable>
          ) : null}
        </View>
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
});
