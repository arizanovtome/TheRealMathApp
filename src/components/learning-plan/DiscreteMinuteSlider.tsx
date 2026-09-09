import { useEffect, useState } from 'react';

import { SettingsSlider } from '@/components/learning-plan/SettingsSlider';
import {
  TIMED_DURATION_MINUTES_OPTIONS,
  type TimedDurationMinutes,
} from '@/features/learning-plan/learningPlan.types';
import { formatTimedDurationCompact } from '@/features/learning-plan/timedRun.utils';
import { useAppTranslation } from '@/i18n/useAppTranslation';

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
    <SettingsSlider
      label={t('settings:totalTimeLabel')}
      valueLabel={valueLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityValueText={valueLabel}
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
    />
  );
}
