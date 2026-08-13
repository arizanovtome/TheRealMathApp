import type { GestureResponderEvent } from 'react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type AppButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  accessibilityHint,
}: AppButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && !disabled && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={isPrimary ? colors.buttonPrimaryText : colors.primary} />
        ) : (
          <AppText
            variant="subtitle"
            style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>
            {label}
          </AppText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.buttonPrimary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.55,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
  labelPrimary: {
    color: colors.buttonPrimaryText,
    fontWeight: '700',
  },
  labelSecondary: {
    color: colors.primary,
    fontWeight: '600',
  },
});
