import Slider from '@react-native-community/slider';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type SettingsSliderProps = {
  accessibilityLabel: string;
  accessibilityValueText?: string;
  label?: string;
  valueLabel?: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
};

/** Shared label/value/track presentation for every learning-plan slider. */
export function SettingsSlider({
  accessibilityLabel,
  accessibilityValueText,
  label,
  valueLabel,
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
  disabled,
}: SettingsSliderProps) {
  const hasHeader = Boolean(label || valueLabel);

  return (
    <View style={hasHeader ? styles.wrapWithHeader : undefined}>
      {hasHeader ? (
        <View style={styles.row}>
          {label ? (
            <AppText variant="label" style={styles.label} numberOfLines={2}>
              {label}
            </AppText>
          ) : null}
          {valueLabel ? (
            <AppText
              variant="subtitle"
              style={styles.value}
              accessibilityLabel={`${accessibilityLabel}: ${accessibilityValueText ?? valueLabel}`}
            >
              {valueLabel}
            </AppText>
          ) : null}
        </View>
      ) : null}
      <Slider
        style={[styles.slider, hasHeader && styles.sliderWithHeader]}
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={
          accessibilityValueText ? { text: accessibilityValueText } : undefined
        }
        disabled={disabled}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapWithHeader: {
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    color: colors.primary,
    flexShrink: 0,
  },
  slider: {
    alignSelf: 'stretch',
    height: 44,
    marginHorizontal: -spacing.md,
  },
  sliderWithHeader: {
    marginTop: -spacing.xs,
  },
});
