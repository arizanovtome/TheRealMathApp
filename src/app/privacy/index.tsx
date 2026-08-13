import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import {
  getPrivacyPolicySections,
  PRIVACY_POLICY_LAST_UPDATED,
} from '@/i18n/privacyPolicy';
import { useAppTranslation } from '@/i18n/useAppTranslation';

export default function PrivacyPolicyScreen() {
  const { t } = useAppTranslation(['privacy', 'common']);
  const sections = getPrivacyPolicySections(t);

  return (
    <AppScreen scroll>
      <AppText variant="title">{t('common:privacyPolicy')}</AppText>
      <AppText variant="body" muted>
        {t('common:lastUpdated', { date: PRIVACY_POLICY_LAST_UPDATED })}
      </AppText>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <AppText variant="subtitle">{section.title}</AppText>
          {section.paragraphs.map((paragraph) => (
            <AppText key={paragraph} variant="body" muted style={styles.paragraph}>
              {paragraph}
            </AppText>
          ))}
          {section.bullets?.map((bullet) => (
            <AppText key={bullet} variant="body" muted style={styles.bullet}>
              {'\u2022 '}
              {bullet}
            </AppText>
          ))}
        </View>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  paragraph: {
    lineHeight: 22,
  },
  bullet: {
    lineHeight: 22,
    paddingLeft: 4,
  },
});
