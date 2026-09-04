import { useCallback } from 'react';
import { Alert } from 'react-native';
import { Redirect, useRouter } from 'expo-router';

import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { ProfileSwitcher } from '@/components/profiles/ProfileSwitcher';
import { ROUTES } from '@/constants/routes';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { selectActiveProfile } from '@/store/profileSelectors';
import { useAppStore } from '@/store/useAppStore';

export function ProfileManagementScreen() {
  const { t } = useAppTranslation(['settings', 'common']);
  const router = useRouter();
  const profiles = useAppStore((state) => state.profiles);
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const activeProfile = useAppStore(selectActiveProfile);
  const switchProfile = useAppStore((state) => state.switchProfile);
  const removeProfile = useAppStore((state) => state.removeProfile);

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
            onPress: () => removeProfile(profileId),
          },
        ],
      );
    },
    [profiles, removeProfile, t],
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
        onAddProfile={() => router.push(`${ROUTES.settingsProfileForm}?mode=add`)}
        onEditProfile={(profileId) =>
          router.push({
            pathname: ROUTES.settingsProfileForm,
            params: { mode: 'edit', profileId },
          })
        }
        onRemoveProfile={handleRemoveProfile}
      />
    </AppScreen>
  );
}
