import { Redirect, useLocalSearchParams } from 'expo-router';

import { ProfileScopedSettingsScreen } from '@/components/settings/ProfileScopedSettingsScreen';
import { getSettingsTopicCategory } from '@/components/settings/settingsTopicCategories';
import { ROUTES } from '@/constants/routes';
import { useAppTranslation } from '@/i18n/useAppTranslation';

export default function TopicCategorySettingsScreen() {
  const { t } = useAppTranslation('settings');
  const params = useLocalSearchParams<{ category?: string | string[] }>();
  const category = getSettingsTopicCategory(params.category);

  if (!category) return <Redirect href={ROUTES.settingsTopics} />;

  return (
    <ProfileScopedSettingsScreen
      scope="topics"
      title={t(category.titleKey)}
      subtitle={t(category.descriptionKey)}
      visibleOperations={category.operations}
    />
  );
}
