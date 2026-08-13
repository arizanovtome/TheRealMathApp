import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { LearnTutorialView } from '@/components/learn/LearnTutorialView';
import { ROUTES } from '@/constants/routes';
import { getLearnTopic } from '@/features/learn/learnTopics';
import type { LearnPracticeTarget } from '@/features/learn/learnPractice.utils';
import { useAppTranslation } from '@/i18n/useAppTranslation';

function learnPracticeParams(
  topicId: string,
  target: LearnPracticeTarget,
): { topicId: string; targetKind: string; operation?: string } {
  if (target.kind === 'operation') {
    return {
      topicId,
      targetKind: 'operation',
      operation: target.operation,
    };
  }
  return { topicId, targetKind: target.kind };
}

export default function LearnTopicScreen() {
  const { t, locale } = useAppTranslation(['common', 'navigation']);
  const router = useRouter();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const tutorial = topicId ? getLearnTopic(topicId, locale) : undefined;

  if (!tutorial) {
    return (
      <>
        <Stack.Screen options={{ title: t('navigation:topicNotFound') }} />
        <AppScreen>
          <AppText variant="subtitle">{t('topicNotFound')}</AppText>
        </AppScreen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: tutorial.title }} />
      <AppScreen scroll>
        <LearnTutorialView
          tutorial={tutorial}
          onTryInPractice={
            tutorial.tryInPractice
              ? () =>
                  router.push({
                    pathname: ROUTES.learnPractice,
                    params: learnPracticeParams(tutorial.id, tutorial.tryInPractice!),
                  })
              : undefined
          }
        />
      </AppScreen>
    </>
  );
}
