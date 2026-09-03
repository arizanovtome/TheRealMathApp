import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { buildRecommendedLearningPlan } from '@/features/learning-plan/buildRecommendedLearningPlan';
import { exportLearningPlanFile } from '@/features/learning-plan/learningPlanShare.service';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { selectActiveProfile } from '@/store/profileSelectors';
import { useAppStore } from '@/store/useAppStore';
import { ROUTES } from '@/constants/routes';

export function LearningPlanShareActions() {
  const { t } = useAppTranslation(['settings', 'common']);
  const router = useRouter();
  const activeProfile = useAppStore(selectActiveProfile);
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!activeProfile) return;

    const config =
      activeProfile.learningConfig ??
      buildRecommendedLearningPlan({
        age: activeProfile.age,
        mathKnowledgeLevel: activeProfile.mathKnowledgeLevel,
      });

    setExporting(true);
    try {
      const result = await exportLearningPlanFile(config, activeProfile.profileName);
      if (result.ok) return;

      if (result.reason === 'cancelled') return;

      const message =
        result.reason === 'share_unavailable'
          ? t('settings:exportPlanErrorShareUnavailable')
          : t('settings:exportPlanErrorFailed');
      Alert.alert(t('settings:exportPlanErrorTitle'), message);
    } finally {
      setExporting(false);
    }
  }, [activeProfile, t]);

  return (
    <>
      <AppButton
        label={t('settings:exportPlan')}
        variant="secondary"
        onPress={() => void handleExport()}
        disabled={!activeProfile || exporting}
      />
      <AppButton
        label={t('settings:importPlan')}
        variant="secondary"
        onPress={() => router.push(ROUTES.settingsImportPlan)}
      />
    </>
  );
}
