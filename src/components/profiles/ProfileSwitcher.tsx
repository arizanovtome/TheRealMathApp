import { Pressable, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppText } from "@/components/common/AppText";
import { Card } from "@/components/common/Card";
import type { ChildProfile } from "@/features/onboarding/onboarding.types";
import { useAppTranslation } from "@/i18n/useAppTranslation";
import { colors } from "@/theme/colors";
import { radii, spacing } from "@/theme/spacing";

type ProfileSwitcherProps = {
  profiles: ChildProfile[];
  activeProfileId: string | null;
  onSwitch: (profileId: string) => void;
  onAddProfile: () => void;
  onRemoveProfile?: (profileId: string) => void;
};

export function ProfileSwitcher({
  profiles,
  activeProfileId,
  onSwitch,
  onAddProfile,
  onRemoveProfile,
}: ProfileSwitcherProps) {
  const { t } = useAppTranslation("common");

  return (
    <Card>
      <AppText variant="label">{t("common:profiles")}</AppText>
      <View style={styles.list}>
        {profiles.map((profile) => {
          const selected = profile.id === activeProfileId;
          return (
            <View key={profile.id} style={styles.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("common:switchToProfile", {
                  profileName: profile.profileName,
                })}
                accessibilityState={{ selected }}
                onPress={() => onSwitch(profile.id)}
                style={[
                  styles.profileChip,
                  selected && styles.profileChipSelected,
                ]}
              >
                <AppText
                  variant="subtitle"
                  style={
                    selected ? styles.profileTextSelected : styles.profileText
                  }
                >
                  {profile.profileName}
                </AppText>
                <AppText variant="body" muted>
                  {profile.name.trim() || t("common:noNameYet")}
                </AppText>
              </Pressable>
              {onRemoveProfile && profiles.length > 1 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("common:removeProfile", {
                    profileName: profile.profileName,
                  })}
                  onPress={() => onRemoveProfile(profile.id)}
                  style={styles.removeButton}
                >
                  <AppText variant="label" style={styles.removeText}>
                    {t("common:remove")}
                  </AppText>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>
      <AppButton
        label={t("common:addProfile")}
        variant="secondary"
        onPress={onAddProfile}
        accessibilityHint={t("common:addProfileHint")}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.xs,
  },
  profileChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  profileChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
  profileText: {
    color: colors.text,
  },
  profileTextSelected: {
    color: colors.primary,
  },
  removeButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
  },
  removeText: {
    color: colors.textMuted,
  },
});
