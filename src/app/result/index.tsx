import { Redirect, useRouter } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { ProgressInsights } from '@/components/progress/ProgressInsights';
import { QuizResultBreakdown } from '@/components/result/QuizResultBreakdown';
import { ROUTES } from '@/constants/routes';
import {
  formatTimedRunStartSettingsLabel,
  formatTimedRunTotalTimeLabel,
} from '@/features/progress/sessionLabels';
import { positiveFeedbackForCorrectCount } from '@/i18n/labels';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { useAppStore } from '@/store/useAppStore';
import { selectActiveSessionHistory } from '@/store/profileSelectors';

export const options = { headerBackVisible: false };

export default function ResultScreen() {
  const { t } = useAppTranslation(['practice', 'common', 'settings', 'progress']);
  const router = useRouter();
  const lastSessionResult = useAppStore((s) => s.lastSessionResult);
  const sessionHistory = useAppStore(selectActiveSessionHistory);

  if (!lastSessionResult) {
    return <Redirect href={ROUTES.home} />;
  }

  const sessionMode = lastSessionResult.sessionMode ?? 'practice';
  const quizOutcomes = lastSessionResult.quizQuestionOutcomes;
  const showQuizBreakdown =
    (sessionMode === 'quiz' || sessionMode === 'timed') && quizOutcomes && quizOutcomes.length > 0;

  const retryRoute =
    sessionMode === 'quiz' ? ROUTES.quiz : sessionMode === 'timed' ? ROUTES.timed : ROUTES.practice;
  const retryLabel =
    sessionMode === 'quiz'
      ? t('practice:quizAgain')
      : sessionMode === 'timed'
        ? t('practice:timedAgain')
        : t('practice:practiceAgain');

  return (
    <AppScreen scroll>
      <AppText variant="title">
        {positiveFeedbackForCorrectCount(
          lastSessionResult.correctAnswers,
          lastSessionResult.totalQuestions,
          t,
        )}
      </AppText>
      {sessionMode === 'timed' ? (
        <AppText variant="subtitle">
          {t('practice:timedAnswerSummary', {
            correct: lastSessionResult.correctAnswers,
            wrong: lastSessionResult.wrongAnswers,
            pct: lastSessionResult.scorePercentage,
          })}
        </AppText>
      ) : (
        <>
          <AppText variant="body">
            {t('practice:scoreSummary', {
              correct: lastSessionResult.correctAnswers,
              total: lastSessionResult.totalQuestions,
            })}
          </AppText>
          <AppText variant="subtitle">
            {t('practice:scorePct', { pct: lastSessionResult.scorePercentage })}
          </AppText>
        </>
      )}

      {lastSessionResult.timedRun ? (
        <>
          <AppText variant="body" muted>
            {formatTimedRunTotalTimeLabel(
              lastSessionResult.timedRun,
              t,
            )}
          </AppText>
          <AppText variant="body" muted>
            {formatTimedRunStartSettingsLabel(lastSessionResult.timedRun, t)}
          </AppText>
        </>
      ) : null}

      <ProgressInsights history={sessionHistory} variant="full" />

      {showQuizBreakdown ? <QuizResultBreakdown outcomes={quizOutcomes} /> : null}

      <AppButton
        label={retryLabel}
        icon="refresh-outline"
        iconPosition="left"
        onPress={() => router.replace(retryRoute)}
      />
      <AppButton
        label={t('settings:title')}
        icon="settings-outline"
        iconPosition="left"
        variant="secondary"
        onPress={() => router.replace(ROUTES.learningPlan)}
        accessibilityHint={t('practice:hintOpenSettings')}
      />
      <AppButton
        label={t('common:goHome')}
        icon="home-outline"
        iconPosition="left"
        variant="secondary"
        onPress={() => router.replace(ROUTES.home)}
      />
    </AppScreen>
  );
}
