import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";

import { AppButton } from "@/components/common/AppButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { HomeAboutLinks } from "@/components/home/HomeAboutLinks";
import { LanguageQuickSwitch } from "@/components/settings/LanguageQuickSwitch";
import { GentleAdaptationCard } from "@/components/progress/GentleAdaptationCard";
import { ROUTES } from "@/constants/routes";
import { getEnabledOperations } from "@/features/learning-plan/learningPlan.utils";
import { computeAdaptationSuggestion } from "@/features/progress/adaptation";
import { useStoreHydration } from "@/hooks/useStoreHydration";
import { useAppStore } from "@/store/useAppStore";
import {
  selectActiveLearningConfig,
  selectActiveProfile,
  selectActiveSessionHistory,
} from "@/store/profileSelectors";
import { useAppTranslation } from "@/i18n/useAppTranslation";
import { colors } from "@/theme/colors";

export const options = { headerShown: false as const };

export default function HomeScreen() {
  const { t } = useAppTranslation(["home", "common"]);
  const hydrated = useStoreHydration();
  const router = useRouter();
  const activeProfile = useAppStore(selectActiveProfile);
  const learningConfig = useAppStore(selectActiveLearningConfig);
  const sessionHistory = useAppStore(selectActiveSessionHistory);
  const onboardingComplete = useAppStore((s) => s.isOnboardingCompleted);
  const profiles = useAppStore((s) => s.profiles);

  const adaptationSuggestion = useMemo(() => {
    if (!learningConfig) return null;
    return computeAdaptationSuggestion(
      sessionHistory,
      getEnabledOperations(learningConfig),
    );
  }, [sessionHistory, learningConfig]);

  if (!hydrated) {
    return (
      <SafeAreaView
        style={styles.loading}
        edges={["top", "bottom", "left", "right"]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
          accessibilityLabel={t("common:loadingSettings")}
        />
      </SafeAreaView>
    );
  }

  if (!onboardingComplete || profiles.length === 0) {
    return <Redirect href={ROUTES.onboardingName} />;
  }

  const greetingName = activeProfile?.name?.trim() || t("common:friend");
  const profileLabel =
    profiles.length > 1 && activeProfile?.profileName
      ? activeProfile.profileName
      : null;

  return (
    <AppScreen scroll includeTopSafeArea>
      <View style={styles.titleRow}>
        <AppText variant="title" style={styles.title}>
          {t("home:greeting", { name: greetingName })}
        </AppText>
        <LanguageQuickSwitch />
      </View>
      {profileLabel ? (
        <AppText variant="body" muted>
          {t("home:activeProfile", { profileLabel })}
        </AppText>
      ) : null}
      <AppText variant="body" muted>
        {t("home:intro")}
      </AppText>

      <AppButton
        label={t("common:practice")}
        icon="barbell-outline"
        onPress={() => router.push(ROUTES.practice)}
        accessibilityHint={t("home:hintPractice")}
      />
      <AppButton
        label={t("common:quiz")}
        icon="calculator-outline"
        variant="secondary"
        onPress={() => router.push(ROUTES.quiz)}
        accessibilityHint={t("home:hintQuiz")}
      />
      <AppButton
        label={t("common:timed")}
        icon="timer-outline"
        variant="secondary"
        onPress={() => router.push(ROUTES.timed)}
        accessibilityHint={t("home:hintTimed")}
      />
      <AppButton
        label={t("home:learnTitle")}
        icon="book-outline"
        variant="secondary"
        onPress={() => router.push(ROUTES.learn)}
        accessibilityHint={t("home:hintLearn")}
      />
      <AppButton
        label={t("progress:title")}
        icon="stats-chart-outline"
        variant="secondary"
        onPress={() => router.push(ROUTES.progress)}
        accessibilityHint={t("home:hintProgress")}
      />
      <AppButton
        label={t("settings:title")}
        icon="settings-outline"
        variant="secondary"
        onPress={() => router.push(ROUTES.learningPlan)}
        accessibilityHint={t("home:hintSettings")}
      />

      <HomeAboutLinks />

      {adaptationSuggestion ? (
        <GentleAdaptationCard suggestion={adaptationSuggestion} />
      ) : null}

      {!learningConfig ? (
        <AppText variant="body" muted>
          {t("home:noSetup")}
        </AppText>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    flexShrink: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
