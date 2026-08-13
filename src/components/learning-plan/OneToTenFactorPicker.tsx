import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { ONE_TO_TEN_NUMBERS } from '@/features/learning-plan/learningPlan.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type OneToTenFactorPickerProps = {
  label: string;
  hint?: string;
  selected: number[];
  onChange: (next: number[]) => void;
  disabled?: boolean;
};

export function OneToTenFactorPicker({
  label,
  hint,
  selected,
  onChange,
  disabled,
}: OneToTenFactorPickerProps) {
  const { t } = useAppTranslation(['settings', 'common']);

  const toggle = (n: number) => {
    if (disabled) return;
    const set = new Set(selected);
    if (set.has(n)) {
      if (set.size <= 1) return;
      set.delete(n);
    } else {
      set.add(n);
    }
    onChange([...set].sort((a, b) => a - b));
  };

  return (
    <View style={styles.wrap}>
      <AppText variant="label">{label}</AppText>
      {hint ? (
        <AppText variant="body" muted>
          {hint}
        </AppText>
      ) : null}
      <View style={styles.grid}>
        {ONE_TO_TEN_NUMBERS.map((n) => {
          const isOn = selected.includes(n);
          return (
            <Pressable
              key={n}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isOn, disabled: !!disabled }}
              accessibilityLabel={`${isOn ? t('common:deselect') : t('common:select')} ${n}`}
              disabled={disabled}
              onPress={() => toggle(n)}
              style={[styles.chip, isOn && styles.chipOn, disabled && styles.chipDisabled]}>
              <AppText variant="subtitle" style={isOn ? styles.chipTextOn : styles.chipText}>
                {n}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    width: 52,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: {
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipText: {
    color: colors.text,
  },
  chipTextOn: {
    color: colors.primary,
  },
});
