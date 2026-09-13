import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type AppButtonProps = {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  iconPosition?: 'left' | 'right';
  textPosition?: 'left' | 'center';
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
};

export function AppButton({
  label,
  icon,
  iconPosition = 'left',
  textPosition = 'left',
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
        <View collapsable={false} style={[
          styles.content,
          styles.iconContent,
          textPosition === 'center' && styles.centeredContent,
        ]}>
          {loading ? (
            <ActivityIndicator color={isPrimary ? colors.buttonPrimaryText : colors.primary} />
          ) : (
            <>
              {icon && iconPosition === 'left' ? (
                <Ionicons
                  name={icon}
                  size={24}
                  color={isPrimary ? colors.buttonPrimaryText : colors.primary}
                  accessible={false}
                  importantForAccessibility="no"
                />
              ) : null}
              <AppText
                variant="subtitle"
                style={[
                  styles.label,
                  { textAlign: textPosition },
                  isPrimary ? styles.labelPrimary : styles.labelSecondary,
                ]}>
                {label}
              </AppText>
              {icon && iconPosition === 'right' ? (
                <Ionicons
                  name={icon}
                  size={24}
                  color={isPrimary ? colors.buttonPrimaryText : colors.primary}
                  accessible={false}
                  importantForAccessibility="no"
                />
              ) : null}
            </>
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
  iconContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing.md,
  },
  centeredContent: {
    justifyContent: 'center',
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
    flexShrink: 1,
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
