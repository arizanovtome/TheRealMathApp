import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { RangePreset } from '@/constants/ranges';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type RangeSelectorProps = {
  label: string;
  presets: RangePreset[];
  value: { min: number; max: number };
  onChange: (min: number, max: number) => void;
  disabled?: boolean;
};

export function RangeSelector({ label, presets, value, onChange, disabled }: RangeSelectorProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="label">{label}</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {presets.map((preset) => {
          const selected = preset.min === value.min && preset.max === value.max;
          return (
            <Pressable
              key={preset.label}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${preset.label}`}
              accessibilityState={{ selected, disabled: !!disabled }}
              disabled={disabled}
              onPress={() => onChange(preset.min, preset.max)}
              style={[styles.chip, selected && styles.chipSelected, disabled && styles.chipDisabled]}>
              <AppText variant="label" style={selected ? styles.chipTextSelected : styles.chipText}>
                {preset.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.chipSelected,
    borderColor: colors.primary,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipText: {
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.primary,
  },
});
