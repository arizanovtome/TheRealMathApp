import { Redirect } from 'expo-router';

import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { LearningPlanShareActions } from '@/components/settings/LearningPlanShareActions';
import { ROUTES } from '@/constants/routes';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { selectActiveProfile } from '@/store/profileSelectors';
import { useAppStore } from '@/store/useAppStore';

export function LearningPlanShareScreen() {
  const { t } = useAppTranslation('settings');
  const activeProfile = useAppStore(selectActiveProfile);

  if (!activeProfile) return <Redirect href={ROUTES.onboardingName} />;

  return (
    <AppScreen scroll>
      <AppText variant="title">{t('settings:sharePlanSection')}</AppText>
      <AppText variant="body" muted>
        {t('settings:sharePlanSectionHint')}
      </AppText>
      <LearningPlanShareActions />
    </AppScreen>
  );
}
