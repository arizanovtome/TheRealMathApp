import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { LearnPracticeSessionView } from '@/components/practice/LearnPracticeSessionView';
import { LearningPlanEditor } from '@/components/learning-plan/LearningPlanEditor';
import { AppButton } from '@/components/common/AppButton';
import { getLearnTopic } from '@/features/learn/learnTopics';
import {
  applyLearnPracticeFocus,
  mergeFocusedOperationIntoProfile,
  parseLearnPracticeTargetParam,
} from '@/features/learn/learnPractice.utils';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { selectActiveLearningConfig, selectActiveProfile } from '@/store/profileSelectors';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { useAppStore } from '@/store/useAppStore';

export default function LearnPracticeScreen() {
  const { t } = useAppTranslation(['common', 'navigation', 'settings']);
  const locale = useAppStore((s) => s.locale);
  const { topicId, targetKind, operation } = useLocalSearchParams<{
    topicId: string;
    targetKind: string;
    operation?: string;
  }>();

  const tutorial = topicId ? getLearnTopic(topicId, locale) : undefined;
  const target = parseLearnPracticeTargetParam(targetKind, operation);
  const activeProfile = useAppStore(selectActiveProfile);
  const learningConfig = useAppStore(selectActiveLearningConfig);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [started, setStarted] = useState(false);
  const initialFocused = useMemo(() => {
    if (!target || !learningConfig || !activeProfile) return null;
    return applyLearnPracticeFocus(learningConfig, target, activeProfile.age);
  }, [activeProfile, learningConfig, target]);
  const [draft, setDraft] = useState<MathLearningConfig | null>(null);

  if (!tutorial || !target) {
    return (
      <>
        <Stack.Screen options={{ title: t('navigation:practice') }} />
        <AppScreen>
          <AppText variant="subtitle">{t('common:practiceUnavailable')}</AppText>
        </AppScreen>
      </>
    );
  }

  if (!activeProfile || !initialFocused) {
    return null;
  }

  if (!started && target.kind === 'operation') {
    const configured = draft ?? initialFocused;
    return (
      <>
        <Stack.Screen options={{ title: tutorial.title }} />
        <AppScreen scroll>
          <AppText variant="title">{t('settings:choosePracticeSettings')}</AppText>
          <AppText variant="body" muted>{t('settings:choosePracticeSettingsHint')}</AppText>
          <LearningPlanEditor
            initialConfig={initialFocused}
            profile={activeProfile}
            focusedOperation={target.operation}
            hideSaveButton
            onSave={() => undefined}
            onDraftChange={(config) => setDraft(config)}
          />
          <AppButton
            label={t('settings:startWithoutSaving')}
            variant="secondary"
            onPress={() => setStarted(true)}
          />
          <AppButton
            label={t('settings:saveToProfileAndStart')}
            onPress={() => {
              updateProfile(activeProfile.id, {
                learningConfig: mergeFocusedOperationIntoProfile(
                  learningConfig!,
                  configured,
                  target.operation,
                ),
              });
              setStarted(true);
            }}
          />
        </AppScreen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: tutorial.title }} />
      <AppScreen>
        <LearnPracticeSessionView target={target} configOverride={draft ?? initialFocused} />
      </AppScreen>
    </>
  );
}
