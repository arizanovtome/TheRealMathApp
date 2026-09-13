import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { LanguagePicker } from '@/components/settings/LanguagePicker';
import type { SupportedLocale } from '@/i18n/types';
import { useAppTranslation } from '@/i18n/useAppTranslation';

/**
 * First-run language choice, rendered before the navigation stack mounts.
 *
 * Applying a locale rewrites every stack header title. On Android that update
 * crashes react-native-screens if it lands while a screen is being removed, so
 * this step must not sit inside the stack or trigger navigation.
 */
export function LanguageOnboarding() {
  const { locale, switchLocale } = useAppTranslation();
  const { t: tEn } = useTranslation(['onboarding', 'common'], { lng: 'en' });
  const { t: tMk } = useTranslation(['onboarding', 'common'], { lng: 'mk' });
  const [pickedLocale, setPickedLocale] = useState<SupportedLocale>(locale);
  const [applying, setApplying] = useState(false);

  const tPicked = pickedLocale === 'mk' ? tMk : tEn;

  const handleContinue = () => {
    if (applying) return;
    setApplying(true);
    void switchLocale(pickedLocale);
  };

  return (
    <AppScreen scroll includeTopSafeArea>
      <AppText variant="title">{tEn('onboarding:chooseLanguageTitle')}</AppText>
      <AppText variant="subtitle">{tMk('onboarding:chooseLanguageTitle')}</AppText>
      <AppText variant="body" muted>
        {tEn('onboarding:chooseLanguageSubtitle')}
      </AppText>
      <AppText variant="body" muted>
        {tMk('onboarding:chooseLanguageSubtitle')}
      </AppText>

      <LanguagePicker
        variant="onboarding"
        selectedLocale={pickedLocale}
        onSelectLocale={setPickedLocale}
      />

      <AppButton
        label={tPicked('common:continue')}
        icon="arrow-forward"
        textPosition="center"
        iconPosition="right"
        onPress={handleContinue}
        disabled={applying}
        accessibilityHint={tPicked('onboarding:continueToProfile')}
      />
    </AppScreen>
  );
}
