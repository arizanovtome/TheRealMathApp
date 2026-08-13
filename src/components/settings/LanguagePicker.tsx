import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import {
  LOCALE_FLAGS,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/i18n/types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type LanguagePickerProps = {
  /** Larger chips for first-run onboarding. */
  variant?: 'default' | 'onboarding';
  /** Local selection without switching app locale (onboarding). */
  selectedLocale?: SupportedLocale;
  onSelectLocale?: (locale: SupportedLocale) => void;
};

export function LanguagePicker({
  variant = 'default',
  selectedLocale,
  onSelectLocale,
}: LanguagePickerProps) {
  const { t, locale, switchLocale } = useAppTranslation('common');
  const isOnboarding = variant === 'onboarding';
  const activeLocale = selectedLocale ?? locale;

  const handleSelect = (code: SupportedLocale) => {
    if (onSelectLocale) {
      onSelectLocale(code);
      return;
    }
    void switchLocale(code);
  };

  return (
    <View style={styles.wrap}>
      {!isOnboarding ? <AppText variant="subtitle">{t('language')}</AppText> : null}
      <View style={isOnboarding ? styles.column : styles.row}>
        {SUPPORTED_LOCALES.map((code) => {
          const selected = activeLocale === code;
          return (
            <Pressable
              key={code}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={LOCALE_LABELS[code]}
              onPress={() => handleSelect(code)}
              style={[
                styles.chip,
                isOnboarding && styles.chipOnboarding,
                selected && styles.chipSelected,
              ]}>
              <AppText variant="body" style={styles.flag}>
                {LOCALE_FLAGS[code]}
              </AppText>
              <AppText variant="body" style={selected ? styles.chipTextSelected : undefined}>
                {LOCALE_LABELS[code]}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  column: { flexDirection: 'column', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOnboarding: {
    width: '100%',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
  flag: {
    fontSize: 22,
    lineHeight: 26,
  },
  chipTextSelected: { color: colors.primary, fontWeight: '600' },
});
