import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { AccessibilityInfo, Animated, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { ROUTES } from "@/constants/routes";
import { useAppTranslation } from "@/i18n/useAppTranslation";
import { selectActiveProfile } from "@/store/profileSelectors";
import { useAppStore } from "@/store/useAppStore";
import { colors } from "@/theme/colors";
import { radii } from "@/theme/spacing";

export default function SettingsHubScreen() {
  const { t } = useAppTranslation("settings");
  const router = useRouter();
  const activeProfile = useAppStore(selectActiveProfile);
  const { highlightSetup } = useLocalSearchParams<{ highlightSetup?: string }>();
  const [highlightOpacity] = useState(() => new Animated.Value(0));
  const highlighted = useRef(false);

  useFocusEffect(useCallback(() => {
    if (highlightSetup !== 'true' || highlighted.current) return;
    highlighted.current = true;
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!active) return;
      if (reduceMotion) {
        highlightOpacity.setValue(1);
        timeout = setTimeout(() => highlightOpacity.setValue(0), 4000);
        return;
      }
      animation = Animated.sequence([
        Animated.delay(350),
        Animated.loop(Animated.sequence([
          Animated.timing(highlightOpacity, { toValue: 1, duration: 550, useNativeDriver: true }),
          Animated.timing(highlightOpacity, { toValue: 0, duration: 550, useNativeDriver: true }),
        ]), { iterations: 3 }),
      ]);
      animation.start();
    });
    return () => {
      active = false;
      animation?.stop();
      if (timeout) clearTimeout(timeout);
      highlightOpacity.setValue(0);
    };
  }, [highlightOpacity, highlightSetup]));

  if (!activeProfile) return <Redirect href={ROUTES.onboardingName} />;

  return (
    <AppScreen scroll>
      <AppText variant="title">{t("settings:title")}</AppText>
      <AppText variant="body" muted>
        {t("settings:hubSubtitle")}
      </AppText>
      <AppButton
        label={t("settings:profileDetails")}
        icon="person-outline"
        variant="secondary"
        onPress={() => router.push(ROUTES.settingsProfile)}
      />
      <View>
      <AppButton
        label={t("settings:sessionSettings")}
        icon="options-outline"
        variant="secondary"
        onPress={() => router.push(ROUTES.settingsSession)}
      />
      <Animated.View pointerEvents="none" style={[styles.highlight, { opacity: highlightOpacity }]} />
      </View>
      <View>
      <AppButton
        label={t("settings:topics")}
        icon="grid-outline"
        variant="secondary"
        onPress={() => router.push(ROUTES.settingsTopics)}
      />
      <Animated.View pointerEvents="none" style={[styles.highlight, { opacity: highlightOpacity }]} />
      </View>
      <AppButton
        label={t("settings:sharePlanSection")}
        icon="share-social-outline"
        variant="secondary"
        onPress={() => router.push(ROUTES.settingsSharePlan)}
      />
      <AppButton
        label={t("settings:aboutTitle")}
        icon="information"
        variant="secondary"
        onPress={() => router.push(ROUTES.about)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
});
