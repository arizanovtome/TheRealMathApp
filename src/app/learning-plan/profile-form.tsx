import { usePreventRemove } from 'expo-router/react-navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import { Redirect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { ProfileForm } from '@/components/profiles/ProfileForm';
import { DEFAULT_MATH_KNOWLEDGE_LEVEL } from '@/constants/mathKnowledge';
import { ROUTES } from '@/constants/routes';
import { buildRecommendedLearningPlan } from '@/features/learning-plan/buildRecommendedLearningPlan';
import {
  createChildProfile,
  nextDefaultProfileName,
} from '@/features/onboarding/profile.utils';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { showProfileReady } from '@/features/onboarding/showProfileReady';
import type { ProfileCompletionNavigation } from '@/features/onboarding/profileNavigation.types';
import { useAppStore } from '@/store/useAppStore';
import { deferNavigationAction } from '@/utils/deferNavigation';

export default function ProfileFormScreen() {
  const { t } = useAppTranslation(['settings', 'common', 'onboarding']);
  const router = useRouter();
  const navigation = useNavigation<ProfileCompletionNavigation>();
  const params = useLocalSearchParams<{ mode?: string; profileId?: string }>();
  const profiles = useAppStore((state) => state.profiles);
  const addProfile = useAppStore((state) => state.addProfile);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const mode = params.mode === 'edit' ? 'edit' : 'add';
  const editedProfile = useMemo(
    () => profiles.find((profile) => profile.id === params.profileId),
    [params.profileId, profiles],
  );

  const [profileName, setProfileName] = useState(() =>
    mode === 'edit' && editedProfile
      ? editedProfile.profileName
      : nextDefaultProfileName(profiles),
  );
  const [name, setName] = useState(() => editedProfile?.name ?? '');
  const [age, setAge] = useState<number | null>(() => editedProfile?.age ?? null);
  const [mathKnowledgeLevel, setMathKnowledgeLevel] = useState(
    () => editedProfile?.mathKnowledgeLevel ?? DEFAULT_MATH_KNOWLEDGE_LEVEL,
  );
  const [mathKnowledgeChanged, setMathKnowledgeChanged] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const savedRef = useRef(false);
  const [initialValues] = useState(() => ({
    profileName: mode === 'edit' && editedProfile
      ? editedProfile.profileName
      : nextDefaultProfileName(profiles),
    name: editedProfile?.name ?? '',
    age: editedProfile?.age ?? null,
    mathKnowledgeLevel: editedProfile?.mathKnowledgeLevel ?? DEFAULT_MATH_KNOWLEDGE_LEVEL,
  }));
  const dirty =
    profileName !== initialValues.profileName ||
    name !== initialValues.name ||
    age !== initialValues.age ||
    mathKnowledgeLevel !== initialValues.mathKnowledgeLevel;

  const persistProfile = useCallback((): boolean => {
    const trimmedProfileName = profileName.trim();
    const trimmedName = name.trim();
    if (!trimmedProfileName || !trimmedName) return false;

    Keyboard.dismiss();
    if (mode === 'add') {
      const storedKnowledge = mathKnowledgeChanged ? mathKnowledgeLevel : null;
      const plan = buildRecommendedLearningPlan({ age, mathKnowledgeLevel: storedKnowledge });
      addProfile(createChildProfile({
        name: trimmedName,
        profileName: trimmedProfileName,
        age,
        mathKnowledgeLevel: storedKnowledge,
        learningConfig: plan,
      }));
    } else if (editedProfile) {
      updateProfile(editedProfile.id, {
        profileName: trimmedProfileName,
        name: trimmedName,
        age,
        ...(mathKnowledgeChanged
          ? {
              mathKnowledgeLevel,
              learningConfig: buildRecommendedLearningPlan({ age, mathKnowledgeLevel }),
            }
          : {}),
      });
    }
    return true;
  }, [
    addProfile,
    age,
    editedProfile,
    mathKnowledgeChanged,
    mathKnowledgeLevel,
    mode,
    name,
    profileName,
    updateProfile,
  ]);

  const saveAndNavigate = useCallback(
    (action: () => void) => {
      if (savedRef.current) return;
      if (!persistProfile()) return;
      savedRef.current = true;
      const navigate = (nextAction: () => void) => {
        pendingNavigationRef.current = nextAction;
        setAllowNavigation(true);
      };
      if (mode === 'add') {
        showProfileReady(t, () => navigate(action), () => navigate(() => navigation.reset({
          index: 1,
          routes: [{ name: 'index' }, { name: 'learning-plan/index', params: { highlightSetup: 'true' } }],
        })));
      } else {
        navigate(action);
      }
    },
    [mode, navigation, persistProfile, t],
  );

  usePreventRemove(dirty && !allowNavigation, ({ data }) => {
    Alert.alert(
      t('settings:unsavedChangesTitle'),
      t('settings:profileUnsavedChangesBody'),
      [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: t('settings:leaveWithoutSaving'),
          style: 'destructive',
          onPress: () => {
            pendingNavigationRef.current = () => navigation.dispatch(data.action);
            setAllowNavigation(true);
          },
        },
        {
          text: t('settings:saveAndLeave'),
          onPress: () => saveAndNavigate(() => navigation.dispatch(data.action)),
        },
      ],
    );
  });

  useEffect(() => {
    if (!allowNavigation) return;
    const action = pendingNavigationRef.current;
    if (!action) return;
    pendingNavigationRef.current = null;
    deferNavigationAction(action);
  }, [allowNavigation]);

  if (mode === 'edit' && !editedProfile) {
    return <Redirect href={ROUTES.settingsProfile} />;
  }

  return (
    <AppScreen scroll>
      <AppText variant="title">
        {mode === 'add' ? t('settings:addProfileFormTitle') : t('settings:editProfileFormTitle')}
      </AppText>
      <ProfileForm
        mode={mode}
        profileName={profileName}
        name={name}
        age={age}
        mathKnowledgeLevel={mathKnowledgeLevel}
        onProfileNameChange={setProfileName}
        onNameChange={setName}
        onAgeChange={setAge}
        onMathKnowledgeLevelChange={(value) => {
          setMathKnowledgeLevel(value);
          setMathKnowledgeChanged(true);
        }}
        onSave={() => saveAndNavigate(() => router.back())}
        onCancel={() => router.back()}
        showTitle={false}
      />
    </AppScreen>
  );
}
