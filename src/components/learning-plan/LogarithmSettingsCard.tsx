import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { OperationConfigCard } from '@/components/learning-plan/OperationConfigCard';
import type { LogarithmConfig } from '@/features/logarithm/logarithm.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type LogarithmSettingsCardProps = {
  logarithm: LogarithmConfig;
  onChange: (logarithm: LogarithmConfig) => void;
};

const SUBTYPE_TOGGLES = [
  { key: 'productRule' as const, labelKey: 'settings:logProductRule' },
  { key: 'quotientRule' as const, labelKey: 'settings:logQuotientRule' },
  { key: 'powerRule' as const, labelKey: 'settings:logPowerRule' },
  { key: 'numericLog' as const, labelKey: 'settings:logNumericLog' },
  { key: 'numericLn' as const, labelKey: 'settings:logNumericLn' },
] as const;

export function LogarithmSettingsCard({ logarithm, onChange }: LogarithmSettingsCardProps) {
  const { t } = useAppTranslation(['settings', 'common']);
  const disabled = !logarithm.enabled;

  return (
    <OperationConfigCard
      operation="logarithm"
      enabled={logarithm.enabled}
      onToggle={(enabled) => onChange({ ...logarithm, enabled })}
    >
      <AppText variant="body" muted>
        {t('settings:logarithmDesc')}
      </AppText>

      <View style={styles.section}>
        <AppText variant="label" muted>
          {t('settings:questionTypes')}
        </AppText>
        <View style={styles.chipRow}>
          {SUBTYPE_TOGGLES.map(({ key, labelKey }) => {
            const selected = logarithm[key];
            const label = t(labelKey);
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                disabled={disabled}
                onPress={() => onChange({ ...logarithm, [key]: !logarithm[key] })}
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
