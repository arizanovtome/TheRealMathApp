import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AgeNumberInput } from '@/components/common/AgeNumberInput';
import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { ROUTES } from '@/constants/routes';
import {
  createChildProfile,
  nextDefaultProfileName,
} from '@/features/onboarding/profile.utils';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { useAppStore } from '@/store/useAppStore';

export default function OnboardingAgeScreen() {
  const { t } = useAppTranslation(['onboarding', 'common']);
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; profileName?: string; mode?: string }>();
  const profiles = useAppStore((s) => s.profiles);
  const addProfile = useAppStore((s) => s.addProfile);
  const [age, setAge] = useState<number | null>(null);

  const name = useMemo(() => {
    const raw = params.name;
    return typeof raw === 'string' ? decodeURIComponent(raw) : '';
  }, [params.name]);

  const profileName = useMemo(() => {
    const raw = params.profileName;
    if (typeof raw === 'string' && raw.trim()) {
      return decodeURIComponent(raw).trim();
    }
    return nextDefaultProfileName(profiles);
  }, [params.profileName, profiles]);

  const isAddMode = params.mode === 'add';

  const handleContinue = () => {
    if (!name.trim()) {
      router.replace(
        isAddMode ? `${ROUTES.onboardingName}?mode=add` : ROUTES.onboardingName,
      );
      return;
    }
    if (age === null) return;
    const profile = createChildProfile({
      name: name.trim(),
      age,
      profileName,
    });
    addProfile(profile);
    router.push(
      isAddMode
        ? `${ROUTES.onboardingRecommendedPlan}?mode=add`
        : ROUTES.onboardingRecommendedPlan,
    );
  };

  return (
    <AppScreen scroll>
      <AppText variant="title">{t('onboarding:howOld')}</AppText>
      <AppText variant="body" muted>
        {t('onboarding:ageHelp')}
      </AppText>

      <AgeNumberInput
        value={age}
        onChange={setAge}
        accessibilityLabel={t('common:yourAge')}
        placeholder={t('common:yourAge')}
      />

      <AppButton
        label={t('common:continue')}
        onPress={handleContinue}
        disabled={age === null}
        accessibilityHint={t('onboarding:continueToPlan')}
      />
      <AppButton label={t('common:back')} variant="secondary" onPress={() => router.back()} />
    </AppScreen>
  );
}
