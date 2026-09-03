import { Redirect, useRouter } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { ROUTES } from '@/constants/routes';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { selectActiveProfile } from '@/store/profileSelectors';
import { useAppStore } from '@/store/useAppStore';

export default function SettingsHubScreen() {
  const { t } = useAppTranslation('settings');
  const router = useRouter();
  const activeProfile = useAppStore(selectActiveProfile);

  if (!activeProfile) return <Redirect href={ROUTES.onboardingName} />;

  return (
    <AppScreen scroll>
      <AppText variant="title">{t('settings:title')}</AppText>
      <AppText variant="body" muted>{t('settings:hubSubtitle')}</AppText>
      <AppButton label={t('settings:profileDetails')} variant="secondary" onPress={() => router.push(ROUTES.settingsProfile)} />
      <AppButton label={t('settings:sessionSettings')} variant="secondary" onPress={() => router.push(ROUTES.settingsSession)} />
      <AppButton label={t('settings:topics')} variant="secondary" onPress={() => router.push(ROUTES.settingsTopics)} />
      <AppButton label={t('settings:sharePlanSection')} variant="secondary" onPress={() => router.push(ROUTES.settingsSharePlan)} />
      <AppButton label={t('settings:aboutTitle')} variant="secondary" onPress={() => router.push(ROUTES.about)} />
    </AppScreen>
  );
}
