import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { getOperationLabel } from '@/constants/operationLabels';
import { ROUTES } from '@/constants/routes';
import type { AdaptationSuggestion } from '@/features/progress/adaptation';
import { ADAPTATION_SESSION_WINDOW } from '@/features/progress/adaptation';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { spacing } from '@/theme/spacing';

type GentleAdaptationCardProps = {
  suggestion: AdaptationSuggestion;
};

export function GentleAdaptationCard({ suggestion }: GentleAdaptationCardProps) {
  const router = useRouter();
  const { t } = useAppTranslation(['home', 'common']);
  const label = getOperationLabel(suggestion.operation, t);
  const pct = Math.round(suggestion.wrongRate * 100);

  return (
    <Card>
      <AppText variant="subtitle">{t('home:adaptationTitle')}</AppText>
      <AppText variant="body">
        {t('home:adaptationBody', {
          n: ADAPTATION_SESSION_WINDOW,
          wrong: suggestion.wrong,
          operation: label,
          pct,
        })}
      </AppText>
      <View style={styles.actions}>
        <AppButton
          label={t('home:practiceOperation', { operation: label })}
          onPress={() =>
            router.push({
              pathname: ROUTES.practice,
              params: { focus: suggestion.operation },
            })
          }
          accessibilityHint={t('home:hintPractice')}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: spacing.xs,
  },
});
