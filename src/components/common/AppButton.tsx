import type { GestureResponderEvent } from 'react-native';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

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
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        activeOpacity={0.88}
        disabled={disabled || loading}
        onPress={onPress}
        style={[
          styles.base,
          isPrimary ? styles.primary : styles.secondary,
          (disabled || loading) && styles.disabled,
        ]}>
        <View collapsable={false} style={styles.content}>
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
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'stretch',
    width: '100%',
    minHeight: 52,
    borderRadius: radii.md,
  },
  content: {
    alignSelf: 'stretch',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.buttonPrimary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.55,
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
