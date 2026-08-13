import { Redirect, Stack, useNavigation, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";
import { usePreventRemove } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { LearningPlanEditor } from "@/components/learning-plan/LearningPlanEditor";
import { ProfileSwitcher } from "@/components/profiles/ProfileSwitcher";
import { LanguagePicker } from "@/components/settings/LanguagePicker";
import { ROUTES } from "@/constants/routes";
import type { MathLearningConfig } from "@/features/learning-plan/learningPlan.types";
import { getRecommendedLearningPlan } from "@/features/learning-plan/recommendedLearningPlan";
import { validateLearningConfig } from "@/features/learning-plan/learningPlan.utils";
import type { ChildProfilePersonal } from "@/features/onboarding/onboarding.types";
import { useAppTranslation } from "@/i18n/useAppTranslation";
import { selectActiveProfile } from "@/store/profileSelectors";
import { useAppStore } from "@/store/useAppStore";
import { colors } from "@/theme/colors";

export default function LearningPlanScreen() {
  const { t } = useAppTranslation(["settings", "common"]);
  const router = useRouter();
  const profiles = useAppStore((s) => s.profiles);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const activeProfile = useAppStore(selectActiveProfile);
  const switchProfile = useAppStore((s) => s.switchProfile);
  const removeProfile = useAppStore((s) => s.removeProfile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const navigation = useNavigation();
  const [dirty, setDirty] = useState(false);
  const [draftCanSave, setDraftCanSave] = useState(false);
  const allowNavigationRef = useRef(false);
  const draftRef = useRef<{
    config: MathLearningConfig;
    personal: ChildProfilePersonal;
  } | null>(null);

  const persistDraft = useCallback((
    config: MathLearningConfig,
    personal: ChildProfilePersonal,
  ) => {
    updateProfile(personal.id, {
      profileName: personal.profileName,
      name: personal.name,
      age: personal.age,
      learningConfig: config,
    });
    setDirty(false);
  }, [updateProfile]);

  const handleSave = (
    config: MathLearningConfig,
    personal: ChildProfilePersonal,
  ) => {
    allowNavigationRef.current = true;
    persistDraft(config, personal);
    setTimeout(() => router.replace(ROUTES.home), 0);
  };

  usePreventRemove(dirty && !allowNavigationRef.current, ({ data }) => {
    Alert.alert(
      t("settings:unsavedChangesTitle"),
      t("settings:unsavedChangesBody"),
      [
        { text: t("common:cancel"), style: "cancel" },
        {
          text: t("settings:leaveWithoutSaving"),
          style: "destructive",
          onPress: () => {
            allowNavigationRef.current = true;
            setDirty(false);
            setTimeout(() => navigation.dispatch(data.action), 0);
          },
        },
        {
          text: t("settings:saveAndLeave"),
          onPress: () => {
            const draft = draftRef.current;
            if (!draft) return;
            allowNavigationRef.current = true;
            persistDraft(draft.config, draft.personal);
            setTimeout(() => navigation.dispatch(data.action), 0);
          },
        },
      ],
    );
  });

  if (!activeProfile) {
    return <Redirect href={ROUTES.onboardingName} />;
  }

  const initial: MathLearningConfig =
    activeProfile.learningConfig ??
    getRecommendedLearningPlan(activeProfile.age);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common:saveSettings")}
              disabled={!draftCanSave}
              hitSlop={8}
              onPress={() => {
                const draft = draftRef.current;
                if (draft) handleSave(draft.config, draft.personal);
              }}
              style={styles.headerSave}
            >
              <Ionicons
                name="save-outline"
                size={24}
                color={draftCanSave ? "#ffffff" : colors.textMuted}
              />
            </Pressable>
          ),
        }}
      />
      <AppScreen scroll>
      <AppText variant="title">{t("settings:title")}</AppText>
      <AppText variant="body" muted>
        {t("settings:subtitle")}
      </AppText>

      <LanguagePicker />

      <ProfileSwitcher
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitch={switchProfile}
        onAddProfile={() => router.push(`${ROUTES.onboardingName}?mode=add`)}
        onRemoveProfile={removeProfile}
      />

      <LearningPlanEditor
        key={activeProfile.id}
        initialConfig={initial}
        profile={activeProfile}
        onSave={handleSave}
        onDraftChange={(config, personal, isDirty) => {
          draftRef.current = { config, personal };
          setDirty(isDirty);
          setDraftCanSave(
            validateLearningConfig(config).valid &&
            personal.name.trim().length > 0 &&
              personal.profileName.trim().length > 0 &&
              personal.age !== null,
          );
        }}
      />
      </AppScreen>
    </>
  );
}

const styles = StyleSheet.create({
  headerSave: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
});
