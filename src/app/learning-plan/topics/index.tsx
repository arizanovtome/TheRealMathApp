import { useRouter } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { SETTINGS_TOPIC_CATEGORIES } from '@/components/settings/settingsTopicCategories';
import { ROUTES } from '@/constants/routes';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { selectActiveProfile } from '@/store/profileSelectors';
import { useAppStore } from '@/store/useAppStore';

export default function TopicSettingsHubScreen() {
  const { t } = useAppTranslation('settings');
  const router = useRouter();
  const activeProfile = useAppStore(selectActiveProfile);

  return (
    <AppScreen scroll>
      <AppText variant="title">{t('topics')}</AppText>
      <AppText variant="body" muted>{t('topicsHint')}</AppText>
      {activeProfile ? <AppText variant="label" muted>{t('settingsForProfile', { profile: activeProfile.profileName })}</AppText> : null}
      {SETTINGS_TOPIC_CATEGORIES.map((category) => (
        <AppButton
          key={category.id}
          label={t(category.titleKey)}
          variant="secondary"
          accessibilityHint={t(category.descriptionKey)}
          onPress={() => router.push(ROUTES.settingsTopicCategory(category.id))}
        />
      ))}
    </AppScreen>
  );
}
