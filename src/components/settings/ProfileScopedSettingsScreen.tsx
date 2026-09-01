import { Ionicons } from '@expo/vector-icons';
import { usePreventRemove } from 'expo-router/react-navigation';
import { Redirect, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { LearningPlanEditor } from '@/components/learning-plan/LearningPlanEditor';
import { ROUTES } from '@/constants/routes';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { validateLearningConfig } from '@/features/learning-plan/learningPlan.utils';
import { buildRecommendedLearningPlan } from '@/features/learning-plan/buildRecommendedLearningPlan';
import type { ChildProfilePersonal } from '@/features/onboarding/onboarding.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { selectActiveProfile } from '@/store/profileSelectors';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme/colors';
import { deferNavigationAction } from '@/utils/deferNavigation';

type ProfileScopedSettingsScreenProps = {
  title: string;
  subtitle: string;
  scope: 'session' | 'topics';
  visibleOperations?: readonly string[];
};

export function ProfileScopedSettingsScreen({
  title,
  subtitle,
  scope,
  visibleOperations,
}: ProfileScopedSettingsScreenProps) {
  const { t } = useAppTranslation(['settings', 'common']);
  const router = useRouter();
  const navigation = useNavigation();
  const activeProfile = useAppStore(selectActiveProfile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const [dirty, setDirty] = useState(false);
  const [draftCanSave, setDraftCanSave] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const draftRef = useRef<{
    config: MathLearningConfig;
    personal: ChildProfilePersonal;
  } | null>(null);

  const queueNavigation = useCallback((action: () => void) => {
    pendingNavigationRef.current = action;
  }, []);

  const persistDraft = useCallback(
    (config: MathLearningConfig, personal: ChildProfilePersonal) => {
      updateProfile(personal.id, {
        profileName: personal.profileName,
        name: personal.name,
        age: personal.age,
        mathKnowledgeLevel: personal.mathKnowledgeLevel,
        learningConfig: config,
      });
      setDirty(false);
    },
    [updateProfile],
  );

  const saveAndExit = useCallback(() => {
    const draft = draftRef.current;
    if (!draft || isExiting) return;
    setIsExiting(true);
    persistDraft(draft.config, draft.personal);
    queueNavigation(() => router.back());
  }, [isExiting, persistDraft, queueNavigation, router]);

  usePreventRemove(dirty, ({ data }) => {
    Alert.alert(
      t('settings:unsavedChangesTitle'),
      t('settings:unsavedChangesBody'),
      [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: t('settings:leaveWithoutSaving'),
          style: 'destructive',
          onPress: () => {
            setIsExiting(true);
            queueNavigation(() => navigation.dispatch(data.action));
            setDirty(false);
          },
        },
        {
          text: t('settings:saveAndLeave'),
          onPress: () => {
            const draft = draftRef.current;
            if (!draft) return;
            setIsExiting(true);
            queueNavigation(() => navigation.dispatch(data.action));
            persistDraft(draft.config, draft.personal);
          },
        },
      ],
    );
  });

  useEffect(() => {
    if (dirty) return;
    const action = pendingNavigationRef.current;
    if (!action) return;
    pendingNavigationRef.current = null;
    deferNavigationAction(action);
  }, [dirty]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerRight: isExiting
        ? undefined
        : () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common:saveSettings')}
              disabled={!draftCanSave}
              hitSlop={8}
              onPress={saveAndExit}
              style={styles.headerSave}
            >
              <Ionicons
                name="save-outline"
                size={24}
                color={draftCanSave ? '#ffffff' : colors.textMuted}
              />
            </Pressable>
          ),
    });
  }, [draftCanSave, isExiting, navigation, saveAndExit, t, title]);

  if (!activeProfile) return <Redirect href={ROUTES.onboardingName} />;

  const initial =
    activeProfile.learningConfig ??
    buildRecommendedLearningPlan({
      age: activeProfile.age,
      mathKnowledgeLevel: activeProfile.mathKnowledgeLevel,
    });

  return (
    <AppScreen scroll scrollProps={{ ref: scrollRef }}>
      <AppText variant="title">{title}</AppText>
      <AppText variant="body" muted>{subtitle}</AppText>
      <AppText variant="label" muted>
        {t('settings:settingsForProfile', { profile: activeProfile.profileName })}
      </AppText>
      <LearningPlanEditor
        key={activeProfile.id}
        scrollRef={scrollRef}
        initialConfig={initial}
        profile={activeProfile}
        scope={scope}
        visibleOperations={visibleOperations}
        hideSaveButton
        onSave={persistDraft}
        onDraftChange={(config, personal, isDirty) => {
          draftRef.current = { config, personal };
          if (isExiting) return;
          setDirty(isDirty);
          setDraftCanSave(
            isDirty &&
              validateLearningConfig(config).valid &&
              personal.name.trim().length > 0 &&
              personal.profileName.trim().length > 0,
          );
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerSave: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});
