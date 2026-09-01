import { useCallback, useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import { Redirect } from 'expo-router';

import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { ProfileForm } from '@/components/profiles/ProfileForm';
import { ProfileSwitcher } from '@/components/profiles/ProfileSwitcher';
import { DEFAULT_MATH_KNOWLEDGE_LEVEL } from '@/constants/mathKnowledge';
import { ROUTES } from '@/constants/routes';
import { buildRecommendedLearningPlan } from '@/features/learning-plan/buildRecommendedLearningPlan';
import {
  createChildProfile,
  nextDefaultProfileName,
} from '@/features/onboarding/profile.utils';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { selectActiveProfile } from '@/store/profileSelectors';
import { useAppStore } from '@/store/useAppStore';

type FormMode =
  | { kind: 'closed' }
  | { kind: 'add' }
  | { kind: 'edit'; profileId: string };

export function ProfileManagementScreen() {
  const { t } = useAppTranslation(['settings', 'common']);
  const profiles = useAppStore((state) => state.profiles);
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const activeProfile = useAppStore(selectActiveProfile);
  const switchProfile = useAppStore((state) => state.switchProfile);
  const removeProfile = useAppStore((state) => state.removeProfile);
  const addProfile = useAppStore((state) => state.addProfile);
  const updateProfile = useAppStore((state) => state.updateProfile);

  const [formMode, setFormMode] = useState<FormMode>({ kind: 'closed' });
  const [profileName, setProfileName] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [mathKnowledgeLevel, setMathKnowledgeLevel] = useState(DEFAULT_MATH_KNOWLEDGE_LEVEL);
  const [mathKnowledgeTouched, setMathKnowledgeTouched] = useState(false);

  const resetForm = useCallback(() => {
    setFormMode({ kind: 'closed' });
    setProfileName('');
    setName('');
    setAge(null);
    setMathKnowledgeLevel(DEFAULT_MATH_KNOWLEDGE_LEVEL);
    setMathKnowledgeTouched(false);
  }, []);

  const openAddForm = useCallback(() => {
    setProfileName(nextDefaultProfileName(profiles));
    setName('');
    setAge(null);
    setMathKnowledgeLevel(DEFAULT_MATH_KNOWLEDGE_LEVEL);
    setMathKnowledgeTouched(false);
    setFormMode({ kind: 'add' });
  }, [profiles]);

  const openEditForm = useCallback(
    (profileId: string) => {
      const profile = profiles.find((item) => item.id === profileId);
      if (!profile) return;
      if (profileId !== activeProfileId) {
        switchProfile(profileId);
      }
      setProfileName(profile.profileName);
      setName(profile.name);
      setAge(profile.age);
      setMathKnowledgeLevel(profile.mathKnowledgeLevel ?? DEFAULT_MATH_KNOWLEDGE_LEVEL);
      setMathKnowledgeTouched(profile.mathKnowledgeLevel != null);
      setFormMode({ kind: 'edit', profileId });
    },
    [activeProfileId, profiles, switchProfile],
  );

  const handleMathKnowledgeChange = useCallback((level: typeof mathKnowledgeLevel) => {
    setMathKnowledgeLevel(level);
    setMathKnowledgeTouched(true);
  }, []);

  const handleSave = useCallback(() => {
    const trimmedProfileName = profileName.trim();
    const trimmedName = name.trim();
    if (!trimmedProfileName || !trimmedName) return;

    Keyboard.dismiss();

    const storedKnowledge = mathKnowledgeTouched ? mathKnowledgeLevel : null;
    const plan = buildRecommendedLearningPlan({
      age,
      mathKnowledgeLevel: storedKnowledge,
    });

    if (formMode.kind === 'add') {
      const profile = createChildProfile({
        name: trimmedName,
        profileName: trimmedProfileName,
        age,
        mathKnowledgeLevel: storedKnowledge,
        learningConfig: plan,
      });
      addProfile(profile);
      resetForm();
      return;
    }

    if (formMode.kind === 'edit') {
      updateProfile(formMode.profileId, {
        profileName: trimmedProfileName,
        name: trimmedName,
        age,
        mathKnowledgeLevel: storedKnowledge,
        ...(mathKnowledgeTouched ? { learningConfig: plan } : {}),
      });
      resetForm();
    }
  }, [
    addProfile,
    age,
    formMode,
    mathKnowledgeLevel,
    mathKnowledgeTouched,
    name,
    profileName,
    resetForm,
    updateProfile,
  ]);

  const handleRemoveProfile = useCallback(
    (profileId: string) => {
      const profile = profiles.find((item) => item.id === profileId);
      if (!profile) return;

      Alert.alert(
        t('settings:removeProfileTitle'),
        t('settings:removeProfileBody', { profile: profile.profileName }),
        [
          { text: t('common:cancel'), style: 'cancel' },
          {
            text: t('common:remove'),
            style: 'destructive',
            onPress: () => {
              if (formMode.kind === 'edit' && formMode.profileId === profileId) {
                resetForm();
              }
              removeProfile(profileId);
            },
          },
        ],
      );
    },
    [formMode, profiles, removeProfile, resetForm, t],
  );

  if (!activeProfile) return <Redirect href={ROUTES.onboardingName} />;

  return (
    <AppScreen scroll>
      <AppText variant="title">{t('settings:profileDetails')}</AppText>
      <AppText variant="body" muted>{t('settings:profileDetailsHint')}</AppText>

      <ProfileSwitcher
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitch={switchProfile}
        onAddProfile={openAddForm}
        onEditProfile={openEditForm}
        onRemoveProfile={handleRemoveProfile}
        hideAddButton={formMode.kind !== 'closed'}
      />

      {formMode.kind !== 'closed' ? (
        <ProfileForm
          mode={formMode.kind}
          profileName={profileName}
          name={name}
          age={age}
          mathKnowledgeLevel={mathKnowledgeLevel}
          onProfileNameChange={setProfileName}
          onNameChange={setName}
          onAgeChange={setAge}
          onMathKnowledgeLevelChange={handleMathKnowledgeChange}
          onSave={handleSave}
          onCancel={resetForm}
        />
      ) : null}
    </AppScreen>
  );
}
