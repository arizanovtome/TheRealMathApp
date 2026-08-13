import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { OperationConfigCard } from '@/components/learning-plan/OperationConfigCard';
import type { ClockConfig, ClockMinuteGranularity } from '@/features/learning-plan/learningPlan.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type ClockSettingsCardProps = {
  clock: ClockConfig;
  onChange: (clock: ClockConfig) => void;
};

const SUBTYPE_TOGGLES = [
  { key: 'readAnalog' as const, labelKey: 'settings:readAnalog' },
  { key: 'elapsedTime' as const, labelKey: 'settings:elapsedTime' },
] as const;

function granularityLabel(value: ClockMinuteGranularity, t: (key: string) => string): string {
  if (value === 5) return t('settings:every5Min');
  if (value === 1) return t('settings:anyMinute');
  return ':00 / :15 / :30 / :45';
}

export function ClockSettingsCard({ clock, onChange }: ClockSettingsCardProps) {
  const { t } = useAppTranslation(['settings', 'common']);
  const disabled = !clock.enabled;
  const granularities: ClockMinuteGranularity[] = [15, 5, 1];

  return (
    <OperationConfigCard
      operation="clock"
      enabled={clock.enabled}
      onToggle={(enabled) => onChange({ ...clock, enabled })}
    >
      <AppText variant="body" muted>
        {t('settings:clockDesc')}
      </AppText>

      <View style={styles.section}>
        <AppText variant="label" muted>
          {t('settings:questionTypes')}
        </AppText>
        <View style={styles.chipRow}>
          {SUBTYPE_TOGGLES.map(({ key, labelKey }) => {
            const selected = clock[key];
            const label = t(labelKey);
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                disabled={disabled}
                onPress={() => onChange({ ...clock, [key]: !clock[key] })}
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

      <View style={styles.section}>
        <View style={styles.chipRow}>
          {([12, 24] as const).map((format) => (
            <Pressable
              key={format}
              accessibilityRole="button"
              accessibilityLabel={`${format}-hour format`}
              accessibilityState={{ selected: clock.hourFormat === format }}
              disabled={disabled}
              onPress={() => onChange({ ...clock, hourFormat: format })}
              style={[
                styles.chip,
                clock.hourFormat === format && styles.chipSelected,
                disabled && styles.chipDisabled,
              ]}
            >
              <AppText
                variant="label"
                style={
                  clock.hourFormat === format ? styles.chipTextSelected : styles.chipText
                }
              >
                {format}-hour
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.chipRow}>
          {granularities.map((value) => {
            const label = granularityLabel(value, t);
            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected: clock.minuteGranularity === value }}
                disabled={disabled}
                onPress={() => onChange({ ...clock, minuteGranularity: value })}
                style={[
                  styles.chip,
                  clock.minuteGranularity === value && styles.chipSelected,
                  disabled && styles.chipDisabled,
                ]}
              >
                <AppText
                  variant="label"
                  style={
                    clock.minuteGranularity === value
                      ? styles.chipTextSelected
                      : styles.chipText
                  }
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
