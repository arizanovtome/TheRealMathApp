import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Slider from '@react-native-community/slider';

import { AppText } from '@/components/common/AppText';
import {
  TIMED_DURATION_MINUTES_OPTIONS,
  type TimedDurationMinutes,
} from '@/features/learning-plan/learningPlan.types';
import { formatTimedDurationCompact } from '@/features/learning-plan/timedRun.utils';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export type DiscreteMinuteSliderProps = {
  valueMinutes: TimedDurationMinutes;
  onChange: (minutes: TimedDurationMinutes) => void;
  disabled?: boolean;
  accessibilityLabel: string;
};

function nearestMinute(m: number): TimedDurationMinutes {
  let best: TimedDurationMinutes = TIMED_DURATION_MINUTES_OPTIONS[0]!;
  for (const v of TIMED_DURATION_MINUTES_OPTIONS) {
    const dv = Math.abs(v - m);
    const db = Math.abs(best - m);
    if (dv < db) best = v;
    else if (dv === db && v > best) best = v;
  }
  return best;
}

export function DiscreteMinuteSlider({
  valueMinutes,
  onChange,
  disabled,
  accessibilityLabel,
}: DiscreteMinuteSliderProps) {
  const { t } = useAppTranslation('settings');
  const snapped = nearestMinute(valueMinutes);
  const propIndex = TIMED_DURATION_MINUTES_OPTIONS.indexOf(snapped);
  const [localIndex, setLocalIndex] = useState(propIndex >= 0 ? propIndex : 0);

  useEffect(() => {
    const i = TIMED_DURATION_MINUTES_OPTIONS.indexOf(snapped);
    if (i >= 0) setLocalIndex(i);
  }, [snapped]);

  const currentMinutes = TIMED_DURATION_MINUTES_OPTIONS[localIndex]!;
  const valueLabel = formatTimedDurationCompact(currentMinutes);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <AppText variant="label">{t('settings:totalTimeLabel')}</AppText>
        <AppText
          variant="subtitle"
          style={styles.value}
          accessibilityLabel={`${accessibilityLabel}: ${valueLabel}`}
        >
          {valueLabel}
        </AppText>
      </View>
      <Slider
        style={styles.slider}
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: valueLabel }}
        disabled={disabled}
        minimumValue={0}
        maximumValue={TIMED_DURATION_MINUTES_OPTIONS.length - 1}
        step={1}
        value={localIndex}
        onValueChange={(raw) => {
          const i = Math.min(
            TIMED_DURATION_MINUTES_OPTIONS.length - 1,
            Math.max(0, Math.round(raw)),
          );
          setLocalIndex(i);
          onChange(TIMED_DURATION_MINUTES_OPTIONS[i]!);
        }}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  value: {
    color: colors.primary,
  },
  slider: {
    width: '100%',
    height: 44,
  },
});
