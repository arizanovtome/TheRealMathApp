import { StyleSheet, View } from 'react-native';
import Slider from '@react-native-community/slider';

import { AppText } from '@/components/common/AppText';
import {
  ADDITION_SUBTRACTION_MAX_OPTIONS,
  type AdditionAnswerMax,
} from '@/constants/ranges';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatThousandsDots } from '@/utils/numbers';

type DiscreteMaxSliderBaseProps = {
  disabled?: boolean;
  accessibilityLabel: string;
  /** Shown before “from 1 up to …” (default “Numbers”). */
  lineLabel?: string;
  /** Preset stops on the slider. Defaults to {@link ADDITION_SUBTRACTION_MAX_OPTIONS}. */
  options?: readonly number[];
};

export type DiscreteMaxSliderProps =
  | (DiscreteMaxSliderBaseProps & {
      valueMax: number;
      onChange: (max: number) => void;
      allowUnlimited?: false;
    })
  | (DiscreteMaxSliderBaseProps & {
      valueMax: AdditionAnswerMax;
      onChange: (max: AdditionAnswerMax) => void;
      allowUnlimited: true;
    });

function nearestOption(
  max: number,
  options: readonly number[],
): number {
  let best: number = options[0]!;
  for (const v of options) {
    const dv = Math.abs(v - max);
    const db = Math.abs(best - max);
    if (dv < db) best = v;
    else if (dv === db && v > best) best = v;
  }
  return best;
}

function valueToSliderIndex(
  valueMax: number | AdditionAnswerMax,
  options: readonly number[],
  allowUnlimited: boolean,
): number {
  if (allowUnlimited && valueMax === 'unlimited') {
    return options.length;
  }
  const numeric = typeof valueMax === 'number' ? valueMax : options[0]!;
  const snapped = nearestOption(numeric, options);
  const i = options.indexOf(snapped);
  return i >= 0 ? i : 0;
}

function sliderIndexToValue(
  index: number,
  options: readonly number[],
  allowUnlimited: boolean,
): number | AdditionAnswerMax {
  if (allowUnlimited && index >= options.length) {
    return 'unlimited';
  }
  return options[Math.min(options.length - 1, Math.max(0, index))]!;
}

export function DiscreteMaxSlider(props: DiscreteMaxSliderProps) {
  const { t } = useAppTranslation(['settings', 'common']);
  const {
    valueMax,
    onChange,
    disabled,
    accessibilityLabel,
    lineLabel,
    options = ADDITION_SUBTRACTION_MAX_OPTIONS,
  } = props;
  const resolvedLineLabel = lineLabel ?? t('common:numbers');
  const allowUnlimited = props.allowUnlimited === true;
  const maxIndex = allowUnlimited ? options.length : options.length - 1;
  const propIndex = valueToSliderIndex(valueMax, options, allowUnlimited);
  const currentValue = sliderIndexToValue(propIndex, options, allowUnlimited);
  const summaryLabel =
    currentValue === 'unlimited'
      ? t('common:unlimited')
      : formatThousandsDots(currentValue);

  return (
    <View style={styles.wrap}>
      <AppText variant="label" accessibilityLabel={accessibilityLabel}>
        {t('common:rangeFrom1To', { lineLabel: resolvedLineLabel, value: summaryLabel })}
      </AppText>
      <Slider
        style={styles.slider}
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        minimumValue={0}
        maximumValue={maxIndex}
        step={1}
        value={propIndex}
        onValueChange={(raw) => {
          const i = Math.min(maxIndex, Math.max(0, Math.round(raw)));
          if (allowUnlimited) {
            const next = sliderIndexToValue(i, options, true) as AdditionAnswerMax;
            (onChange as (max: AdditionAnswerMax) => void)(next);
          } else {
            const next = sliderIndexToValue(i, options, false) as number;
            (onChange as (max: number) => void)(next);
          }
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
    gap: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 44,
  },
});
