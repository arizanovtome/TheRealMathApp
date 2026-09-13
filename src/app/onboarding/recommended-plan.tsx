import { useMemo } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { ROUTES } from '@/constants/routes';
import { buildRecommendedLearningPlan } from '@/features/learning-plan/buildRecommendedLearningPlan';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { useAppStore } from '@/store/useAppStore';
import { selectActiveProfile } from '@/store/profileSelectors';

export default function RecommendedPlanScreen() {
  const { t } = useAppTranslation(['onboarding', 'common']);
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const activeProfile = useAppStore(selectActiveProfile);
  const setActiveLearningConfig = useAppStore((s) => s.setActiveLearningConfig);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const isAddMode = params.mode === 'add';

  const plan = useMemo(() => {
    if (!activeProfile) return null;
    return buildRecommendedLearningPlan({
      age: activeProfile.age,
      mathKnowledgeLevel: activeProfile.mathKnowledgeLevel,
    });
  }, [activeProfile]);

  if (!activeProfile || !plan) {
    return <Redirect href={ROUTES.onboardingName} />;
  }

  const entryMode =
    plan.answerEntryMode === 'keyboard'
      ? t('onboarding:keyboardAnswers')
      : t('onboarding:answerChoices', { n: plan.answerOptionsCount });
  const max =
    plan.addition.answerMax === 'unlimited'
      ? t('onboarding:unlimited')
      : String(plan.addition.answerMax);
  const mode = plan.mode === 'practice' ? t('onboarding:practiceMode') : t('onboarding:quizMode');

  const handleStart = () => {
    setActiveLearningConfig(plan);
    if (!isAddMode) completeOnboarding();
    router.replace(isAddMode ? ROUTES.home : ROUTES.practice);
  };

  const handleCustomize = () => {
    setActiveLearningConfig(plan);
    if (!isAddMode) completeOnboarding();
    router.push(ROUTES.learningPlan);
  };

  return (
    <AppScreen scroll>
      <AppText variant="title">{t('onboarding:niceToMeet', { name: activeProfile.name })}</AppText>
      <AppText variant="body" muted>
        {t('onboarding:planHelp')}
      </AppText>

      <AppText variant="subtitle">{t('onboarding:recommendedSetup')}</AppText>
      <AppText variant="body" muted>
        {t('onboarding:setupSummary', {
          count: plan.questionsCount,
          entryMode,
          max,
          mode,
        })}
      </AppText>

      <AppButton
        label={isAddMode ? t('onboarding:saveAndHome') : t('onboarding:startLearning')}
        icon={isAddMode ? 'home-outline' : 'play-outline'}
        onPress={handleStart}
        accessibilityHint={
          isAddMode ? t('onboarding:hintSaveHome') : t('onboarding:hintStartLearning')
        }
      />
      <AppButton
        label={t('common:customize')}
        icon="options-outline"
        variant="secondary"
        onPress={handleCustomize}
        accessibilityHint={t('onboarding:hintCustomize')}
      />
    </AppScreen>
  );
}
