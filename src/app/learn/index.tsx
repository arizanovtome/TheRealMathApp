import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppScreen } from '@/components/common/AppScreen';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { ROUTES } from '@/constants/routes';
import { getLearnTopics } from '@/features/learn/learnTopics';
import { useAppTranslation } from '@/i18n/useAppTranslation';

export default function LearnIndexScreen() {
  const { t, locale } = useAppTranslation(['home', 'common']);
  const router = useRouter();
  const topics = getLearnTopics(locale);

  return (
    <AppScreen scroll>
      <AppText variant="title">{t('home:learnTitle')}</AppText>
      <AppText variant="body" muted>
        {t('home:learnIntro')}
      </AppText>

      <View style={styles.list}>
        {topics.map((topic) => (
          <Pressable
            key={topic.id}
            accessibilityRole="button"
            accessibilityLabel={t('home:learnAbout', { title: topic.title })}
            onPress={() => router.push(ROUTES.learnTopic(topic.id))}
          >
            <Card>
              <AppText variant="subtitle">{topic.title}</AppText>
              <AppText variant="body" muted>
                {topic.summary}
              </AppText>
            </Card>
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    marginTop: 8,
  },
});
