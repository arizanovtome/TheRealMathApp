import type { TFunction } from 'i18next';
import { Alert } from 'react-native';

export function showProfileReady(
  t: TFunction,
  onContinue: () => void,
  onReviewSettings: () => void,
): void {
  Alert.alert(
    t('onboarding:profileReadyTitle'),
    t('onboarding:profileReadyBody'),
    [
      { text: t('common:continue'), onPress: onContinue },
      { text: t('onboarding:reviewSettings'), onPress: onReviewSettings },
    ],
    { cancelable: false },
  );
}
