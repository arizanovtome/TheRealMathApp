import Slider from '@react-native-community/slider';
import { StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import {
  TIMER_SECONDS_DEFAULT,
  TIMER_SECONDS_MAX,
  TIMER_SECONDS_MIN,
  TIMER_SECONDS_STEP,
} from '@/features/learning-plan/learningPlan.types';
import { clampTimerSeconds } from '@/features/learning-plan/learningPlan.utils';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type TimerSettingsProps = {
  enabled: boolean;
  secondsPerQuestion: number;
  onEnabledChange: (enabled: boolean) => void;
  onSecondsChange: (seconds: number) => void;
};

export function TimerSettings({
  enabled,
  secondsPerQuestion,
  onEnabledChange,
  onSecondsChange,
}: TimerSettingsProps) {
  const { t } = useAppTranslation(['settings', 'common']);
  const seconds = clampTimerSeconds(secondsPerQuestion);

  return (
    <Card>
      <View style={styles.rowBetween}>
        <AppText variant="subtitle">{t('settings:questionTimer')}</AppText>
        <Switch
          accessibilityLabel={t('settings:questionTimer')}
          value={enabled}
          onValueChange={onEnabledChange}
          thumbColor="#ffffff"
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>
      {enabled ? (
        <>
          <AppText variant="body" muted>
            {t('settings:timerEnabled', { seconds })}{' '}
            {t('settings:questionTimerNotOnTimedRun')}
          </AppText>
          <Slider
            accessibilityLabel={t('settings:questionTimer')}
            minimumValue={TIMER_SECONDS_MIN}
            maximumValue={TIMER_SECONDS_MAX}
            step={TIMER_SECONDS_STEP}
            value={seconds}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
            onValueChange={(v) => onSecondsChange(clampTimerSeconds(v))}
          />
          <AppText variant="label" muted>
            {t('settings:timerRange', {
              min: TIMER_SECONDS_MIN,
              max: TIMER_SECONDS_MAX,
              step: TIMER_SECONDS_STEP,
            })}
          </AppText>
        </>
      ) : (
        <AppText variant="body" muted>
          {t('settings:timerOff', { default: TIMER_SECONDS_DEFAULT })}{' '}
          {t('settings:questionTimerNotOnTimedRun')}
        </AppText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});
