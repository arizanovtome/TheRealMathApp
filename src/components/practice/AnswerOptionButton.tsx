import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { MathDisplayText } from '@/components/fractions/MathDisplayText';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type AnswerOptionButtonProps = {
  label: string;
  value: number | string;
  onPress: (value: number | string) => void;
  disabled?: boolean;
  selected?: boolean;
  /** Full-width rows — better for long labels (formulas, side names). */
  stacked?: boolean;
  children?: ReactNode;
};

export function AnswerOptionButton({
  label,
  value,
  onPress,
  disabled,
  selected,
  stacked = false,
  children,
}: AnswerOptionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Answer ${label}`}
      disabled={disabled}
      onPress={() => onPress(value)}
      style={({ pressed }) => [
        styles.base,
        stacked && styles.stacked,
        selected && styles.selected,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {children ?? <MathDisplayText text={label} size="answer" selected={selected} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexGrow: 1,
    flexBasis: '42%',
    maxWidth: '48%',
    minHeight: 72,
    borderRadius: radii.lg,
    borderWidth: 3,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    margin: spacing.xs,
  },
  stacked: {
    flexGrow: 0,
    flexBasis: 'auto',
    maxWidth: '100%',
    width: '100%',
    alignSelf: 'stretch',
    minHeight: 56,
    marginHorizontal: 0,
  },
  selected: {
    borderStyle: 'solid',
    borderColor: colors.primary,
    borderWidth: 3,
    backgroundColor: colors.chipSelected,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.55,
  },
});
