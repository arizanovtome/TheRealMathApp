import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import {
  LOCALE_FLAGS,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
} from '@/i18n/types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type LanguageQuickSwitchProps = {
  compact?: boolean;
};

export function LanguageQuickSwitch({ compact = false }: LanguageQuickSwitchProps) {
  const { t, locale, switchLocale } = useAppTranslation('common');
  const currentIndex = SUPPORTED_LOCALES.indexOf(locale);
  const nextLocale = SUPPORTED_LOCALES[(currentIndex + 1) % SUPPORTED_LOCALES.length]!;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('switchLanguageA11y', {
        language: LOCALE_LABELS[locale],
      })}
      accessibilityHint={t('switchLanguageHint', {
        language: LOCALE_LABELS[nextLocale],
      })}
      hitSlop={8}
      onPress={() => void switchLocale(nextLocale)}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        pressed && styles.pressed,
      ]}
    >
      <AppText style={compact ? styles.flagCompact : styles.flag}>
        {LOCALE_FLAGS[locale]}
      </AppText>
      {!compact ? (
        <View>
          <AppText variant="label" style={styles.code}>
            {locale.toUpperCase()}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  buttonCompact: {
    minHeight: 36,
    paddingHorizontal: spacing.xs,
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.75,
  },
  flag: {
    fontSize: 24,
    lineHeight: 28,
  },
  flagCompact: {
    fontSize: 22,
    lineHeight: 26,
  },
  code: {
    color: colors.primary,
  },
});
