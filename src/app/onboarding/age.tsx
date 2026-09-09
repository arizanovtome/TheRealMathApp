import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AgeNumberInput } from '@/components/common/AgeNumberInput';
import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { MathKnowledgeSelector } from '@/components/profiles/MathKnowledgeSelector';
import { DEFAULT_MATH_KNOWLEDGE_LEVEL } from '@/constants/mathKnowledge';
import { ROUTES } from '@/constants/routes';
import { buildRecommendedLearningPlan } from '@/features/learning-plan/buildRecommendedLearningPlan';
import {
  createChildProfile,
  nextDefaultProfileName,
} from '@/features/onboarding/profile.utils';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { useAppStore } from '@/store/useAppStore';
import { spacing } from '@/theme/spacing';

export default function OnboardingAgeScreen() {
  const { t } = useAppTranslation(['onboarding', 'common', 'settings']);
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; profileName?: string; mode?: string }>();
  const profiles = useAppStore((s) => s.profiles);
  const addProfile = useAppStore((s) => s.addProfile);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [age, setAge] = useState<number | null>(null);
  const [mathKnowledgeLevel, setMathKnowledgeLevel] = useState(DEFAULT_MATH_KNOWLEDGE_LEVEL);
  const [mathKnowledgeTouched, setMathKnowledgeTouched] = useState(false);

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

    const storedKnowledge = mathKnowledgeTouched ? mathKnowledgeLevel : null;
    const plan = buildRecommendedLearningPlan({
      age,
      mathKnowledgeLevel: storedKnowledge,
    });

    const profile = createChildProfile({
      name: name.trim(),
      age,
      profileName,
      mathKnowledgeLevel: storedKnowledge,
      learningConfig: plan,
    });
    addProfile(profile);

    // The recommended plan is already stored on the new profile. For the first profile,
    // finish onboarding here so a stale plan cannot later overwrite changes made in Settings.
    if (!isAddMode) {
      completeOnboarding();
      router.replace(ROUTES.home);
      return;
    }

    router.push(
      `${ROUTES.onboardingRecommendedPlan}?mode=add`,
    );
  };

  return (
    <AppScreen scroll>
      <AppText variant="title">{t('onboarding:howOld')}</AppText>
      <AppText variant="body" muted>
        {t('onboarding:ageHelp')}
      </AppText>

      <Card>
        <AppText variant="label">{t('settings:ageOptional')}</AppText>
        <AppText variant="body" muted>
          {t('settings:ageOptionalHint')}
        </AppText>
        <AgeNumberInput
          value={age}
          onChange={setAge}
          accessibilityLabel={t('settings:ageOptional')}
          placeholder={t('settings:ageOptionalPlaceholder')}
        />

        <AppText variant="label" style={{ marginTop: spacing.md }}>
          {t('settings:mathKnowledgeTitle')}
        </AppText>
        <AppText variant="body" muted>
          {t('settings:mathKnowledgeHint')}
        </AppText>
        <MathKnowledgeSelector
          value={mathKnowledgeLevel}
          onChange={(level) => {
            setMathKnowledgeLevel(level);
            setMathKnowledgeTouched(true);
          }}
        />
      </Card>

      <AppButton
        label={t('common:continue')}
        onPress={handleContinue}
        accessibilityHint={
          isAddMode ? t('onboarding:continueToPlan') : t('onboarding:hintSaveHome')
        }
      />
      <AppButton label={t('common:back')} variant="secondary" onPress={() => router.back()} />
    </AppScreen>
  );
}
