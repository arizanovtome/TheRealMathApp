import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { AppTextLink } from '@/components/common/AppTextLink';
import { GentleAdaptationCard } from '@/components/progress/GentleAdaptationCard';
import { ROUTES } from '@/constants/routes';
import { getEnabledOperations } from '@/features/learning-plan/learningPlan.utils';
import { computeAdaptationSuggestion } from '@/features/progress/adaptation';
import { useStoreHydration } from '@/hooks/useStoreHydration';
import { useAppStore } from '@/store/useAppStore';
import {
  selectActiveLearningConfig,
  selectActiveProfile,
  selectActiveSessionHistory,
} from '@/store/profileSelectors';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';

export const options = { headerShown: false as const };

export default function HomeScreen() {
  const { t } = useAppTranslation(['home', 'common']);
  const hydrated = useStoreHydration();
  const router = useRouter();
  const activeProfile = useAppStore(selectActiveProfile);
  const learningConfig = useAppStore(selectActiveLearningConfig);
  const sessionHistory = useAppStore(selectActiveSessionHistory);
  const onboardingComplete = useAppStore((s) => s.isOnboardingCompleted);
  const hasChosenLocale = useAppStore((s) => s.hasChosenLocale);
  const profiles = useAppStore((s) => s.profiles);

  const adaptationSuggestion = useMemo(() => {
    if (!learningConfig) return null;
    return computeAdaptationSuggestion(sessionHistory, getEnabledOperations(learningConfig));
  }, [sessionHistory, learningConfig]);

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.loading} edges={['top', 'bottom', 'left', 'right']}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel={t('common:loadingSettings')} />
      </SafeAreaView>
    );
  }

  if (!hasChosenLocale) {
    return <Redirect href={ROUTES.onboardingLanguage} />;
  }

  if (!onboardingComplete || profiles.length === 0) {
    return <Redirect href={ROUTES.onboardingName} />;
  }

  const greetingName = activeProfile?.name?.trim() || t('common:friend');
  const profileLabel =
    profiles.length > 1 && activeProfile?.profileName
      ? activeProfile.profileName
      : null;

  return (
    <AppScreen scroll includeTopSafeArea>
      <AppText variant="title">{t('home:greeting', { name: greetingName })}</AppText>
      {profileLabel ? (
        <AppText variant="body" muted>
          {t('home:activeProfile', { profileLabel })}
        </AppText>
      ) : null}
      <AppText variant="body" muted>
        {t('home:intro')}
      </AppText>

      <AppButton
        label={t('common:practice')}
        onPress={() => router.push(ROUTES.practice)}
        accessibilityHint={t('home:hintPractice')}
      />
      <AppButton
        label={t('common:quiz')}
        variant="secondary"
        onPress={() => router.push(ROUTES.quiz)}
        accessibilityHint={t('home:hintQuiz')}
      />
      <AppButton
        label={t('common:timed')}
        variant="secondary"
        onPress={() => router.push(ROUTES.timed)}
        accessibilityHint={t('home:hintTimed')}
      />
      <AppButton
        label={t('home:learnTitle')}
        variant="secondary"
        onPress={() => router.push(ROUTES.learn)}
        accessibilityHint={t('home:hintLearn')}
      />
      <AppButton
        label={t('settings:title')}
        variant="secondary"
        onPress={() => router.push(ROUTES.learningPlan)}
        accessibilityHint={t('home:hintSettings')}
      />
      <AppButton
        label={t('progress:title')}
        variant="secondary"
        onPress={() => router.push(ROUTES.progress)}
        accessibilityHint={t('home:hintProgress')}
      />

      <AppTextLink
        label={t('common:privacyPolicy')}
        onPress={() => router.push(ROUTES.privacy)}
        accessibilityHint={t('home:hintPrivacy')}
      />

      {adaptationSuggestion ? <GentleAdaptationCard suggestion={adaptationSuggestion} /> : null}

      {!learningConfig ? (
        <AppText variant="body" muted>
          {t('home:noSetup')}
        </AppText>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
