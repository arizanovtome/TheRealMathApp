import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppTextLink } from '@/components/common/AppTextLink';
import { ROUTES } from '@/constants/routes';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { spacing } from '@/theme/spacing';

export function HomeAboutLinks() {
  const { t } = useAppTranslation(['home', 'common']);
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <AppTextLink
        label={t('common:privacyPolicy')}
        onPress={() => router.push(ROUTES.privacy)}
        accessibilityHint={t('home:hintPrivacy')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
});
