import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import type { ChildProfile } from '@/features/onboarding/onboarding.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

function profileChipColors(selected: boolean) {
  return {
    edit: selected ? colors.buttonPrimaryText : colors.text,
    remove: selected ? colors.feedbackIncorrectText : colors.error,
    name: colors.text,
    detail: selected ? 'rgba(242, 239, 230, 0.88)' : colors.text,
    placeholder: colors.textMuted,
  };
}

type ProfileSwitcherProps = {
  profiles: ChildProfile[];
  activeProfileId: string | null;
  onSwitch: (profileId: string) => void;
  onAddProfile: () => void;
  onEditProfile?: (profileId: string) => void;
  onRemoveProfile?: (profileId: string) => void;
  hideAddButton?: boolean;
};

export function ProfileSwitcher({
  profiles,
  activeProfileId,
  onSwitch,
  onAddProfile,
  onEditProfile,
  onRemoveProfile,
  hideAddButton = false,
}: ProfileSwitcherProps) {
  const { t } = useAppTranslation('common');

  return (
    <Card>
      <AppText variant="label">{t('common:profiles')}</AppText>
      <View style={styles.list}>
        {profiles.map((profile) => {
          const selected = profile.id === activeProfileId;
          const canRemove = onRemoveProfile && profiles.length > 1;
          const showActions = onEditProfile || canRemove;
          const chipColors = profileChipColors(selected);

          return (
            <View
              key={profile.id}
              style={[styles.profileChip, selected && styles.profileChipSelected]}
            >
              <View style={styles.cardHeader}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common:switchToProfile', {
                    profileName: profile.profileName,
                  })}
                  accessibilityState={{ selected }}
                  disabled={selected}
                  onPress={() => onSwitch(profile.id)}
                  style={styles.cardBodyPressable}
                >
                  <AppText
                    variant={selected ? 'subtitle' : 'body'}
                    style={{ color: chipColors.name }}
                    numberOfLines={2}
                  >
                    {profile.profileName}
                  </AppText>
                  <AppText
                    variant="body"
                    style={{
                      color: profile.name.trim()
                        ? chipColors.detail
                        : chipColors.placeholder,
                    }}
                    numberOfLines={2}
                  >
                    {profile.name.trim() || t('common:noNameYet')}
                  </AppText>
                </Pressable>

                {showActions ? (
                  <View style={styles.iconColumn}>
                    {onEditProfile ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('common:editProfile')}
                        hitSlop={8}
                        onPress={() => onEditProfile(profile.id)}
                        style={styles.editIconButton}
                      >
                        <Ionicons name="create-outline" size={24} color={chipColors.edit} />
                      </Pressable>
                    ) : null}
                    {canRemove ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('common:removeProfile', {
                          profileName: profile.profileName,
                        })}
                        hitSlop={8}
                        onPress={() => onRemoveProfile(profile.id)}
                        style={styles.removeIconButton}
                      >
                        <Ionicons name="trash-outline" size={22} color={chipColors.remove} />
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
      {!hideAddButton ? (
        <AppButton
          label={t('common:addProfile')}
          variant="secondary"
          onPress={onAddProfile}
          accessibilityHint={t('common:addProfileHint')}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  profileChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  profileChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardBodyPressable: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  iconColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editIconButton: {
    padding: spacing.xs,
  },
  removeIconButton: {
    padding: spacing.xs,
  },
});
