import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { OperationConfigCard } from '@/components/learning-plan/OperationConfigCard';
import type { PatternsConfig } from '@/features/learning-plan/learningPlan.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type PatternsSettingsCardProps = {
  patterns: PatternsConfig;
  onChange: (patterns: PatternsConfig) => void;
};

const SUBTYPE_TOGGLES = [
  { key: 'arithmeticSequence' as const, labelKey: 'settings:arithmeticSequence' },
  { key: 'geometricSequence' as const, labelKey: 'settings:geometricSequence' },
  { key: 'numberPattern' as const, labelKey: 'settings:numberPattern' },
] as const;

export function PatternsSettingsCard({ patterns, onChange }: PatternsSettingsCardProps) {
  const { t } = useAppTranslation(['settings', 'common']);
  const disabled = !patterns.enabled;

  return (
    <OperationConfigCard
      operation="pattern"
      enabled={patterns.enabled}
      onToggle={(enabled) => onChange({ ...patterns, enabled })}
    >
      <AppText variant="body" muted>
        {t('settings:patternsDesc')}
      </AppText>

      <View style={styles.section}>
        <AppText variant="label" muted>
          {t('settings:questionTypes')}
        </AppText>
        <View style={styles.chipRow}>
          {SUBTYPE_TOGGLES.map(({ key, labelKey }) => {
            const selected = patterns[key];
            const label = t(labelKey);
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                disabled={disabled}
                onPress={() => onChange({ ...patterns, [key]: !patterns[key] })}
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
