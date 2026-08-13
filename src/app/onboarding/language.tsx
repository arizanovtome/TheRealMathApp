import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { LanguagePicker } from '@/components/settings/LanguagePicker';
import { ROUTES } from '@/constants/routes';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import type { SupportedLocale } from '@/i18n/types';

export default function OnboardingLanguageScreen() {
  const { t, locale, switchLocale } = useAppTranslation(['onboarding', 'common']);
  const { t: tEn } = useTranslation('onboarding', { lng: 'en' });
  const { t: tMk } = useTranslation('onboarding', { lng: 'mk' });
  const [pickedLocale, setPickedLocale] = useState<SupportedLocale>(locale);
  const router = useRouter();

  const handleContinue = () => {
    void switchLocale(pickedLocale).then(() => {
      router.replace(ROUTES.onboardingName);
    });
  };

  return (
    <AppScreen scroll>
      <AppText variant="title">{tEn('chooseLanguageTitle')}</AppText>
      <AppText variant="subtitle">{tMk('chooseLanguageTitle')}</AppText>
      <AppText variant="body" muted>
        {tEn('chooseLanguageSubtitle')}
      </AppText>
      <AppText variant="body" muted>
        {tMk('chooseLanguageSubtitle')}
      </AppText>

      <LanguagePicker
        variant="onboarding"
        selectedLocale={pickedLocale}
        onSelectLocale={setPickedLocale}
      />

      <AppButton
        label={t('common:continue')}
        onPress={handleContinue}
        accessibilityHint={t('onboarding:continueToProfile')}
      />
    </AppScreen>
  );
}
