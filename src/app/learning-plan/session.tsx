import { ProfileScopedSettingsScreen } from '@/components/settings/ProfileScopedSettingsScreen';
import { useAppTranslation } from '@/i18n/useAppTranslation';

export default function SessionSettingsScreen() {
  const { t } = useAppTranslation('settings');
  return <ProfileScopedSettingsScreen scope="session" title={t('sessionSettings')} subtitle={t('sessionSettingsHint')} />;
}
