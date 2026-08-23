import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { ROUTES } from '@/constants/routes';
import { nextDefaultProfileName } from '@/features/onboarding/profile.utils';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { useScrollToFocusedInput } from '@/utils/keyboardScroll';

export default function OnboardingNameScreen() {
  const { t } = useAppTranslation(['onboarding', 'common']);
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const profiles = useAppStore((s) => s.profiles);
  const scrollRef = useRef<ScrollView>(null);
  const scrollToInput = useScrollToFocusedInput(scrollRef);
  const defaultProfileName = useMemo(
    () => nextDefaultProfileName(profiles),
    [profiles],
  );
  const [profileName, setProfileName] = useState(defaultProfileName);
  const [name, setName] = useState('');
  const isAddMode = params.mode === 'add';

  const canContinue = name.trim().length > 0 && profileName.trim().length > 0;

  const handleContinue = () => {
    const trimmedName = name.trim();
    const trimmedProfileName = profileName.trim();
    if (!trimmedName || !trimmedProfileName) return;
    const mode = params.mode === 'add' ? 'add' : 'initial';
    const query = new URLSearchParams({
      name: trimmedName,
      profileName: trimmedProfileName,
      mode,
    });
    router.push(`${ROUTES.onboardingAge}?${query.toString()}`);
  };

  return (
    <AppScreen scroll scrollProps={{ ref: scrollRef }}>
      <AppText variant="title">
        {isAddMode ? t('onboarding:newProfileTitle') : t('onboarding:welcome')}
      </AppText>
      <AppText variant="body" muted>
        {isAddMode ? t('onboarding:profilesHelp') : t('onboarding:firstProfileHelp')}
      </AppText>

      <View style={styles.fields}>
        <View style={styles.field}>
          <AppText variant="label">{t('onboarding:profileName')}</AppText>
          <TextInput
            accessibilityLabel={t('onboarding:profileName')}
            placeholder={t('onboarding:profileNamePlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={profileName}
            onChangeText={setProfileName}
            onFocus={scrollToInput}
            autoCapitalize="words"
            returnKeyType="next"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <AppText variant="label">{t('onboarding:nameOrNickname')}</AppText>
          <TextInput
            accessibilityLabel={t('onboarding:nameOrNickname')}
            placeholder={t('onboarding:namePlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            onFocus={scrollToInput}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            style={styles.input}
          />
        </View>
      </View>

      <AppButton
        label={t('common:continue')}
        onPress={handleContinue}
        disabled={!canContinue}
        accessibilityHint={t('onboarding:continueToAge')}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 21,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 56,
  },
});
