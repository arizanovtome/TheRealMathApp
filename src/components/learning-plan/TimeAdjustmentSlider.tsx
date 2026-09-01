import Slider from '@react-native-community/slider';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type TimeAdjustmentSliderProps = {
  accessibilityLabel: string;
  label: string;
  value: number;
  maximumValue: number;
  onChange: (seconds: number) => void;
};

export function TimeAdjustmentSlider({
  accessibilityLabel,
  label,
  value,
  maximumValue,
  onChange,
}: TimeAdjustmentSliderProps) {
  const seconds = Math.min(maximumValue, Math.max(0, Math.round(value)));
  const valueLabel = `${seconds}s`;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <AppText variant="label" style={styles.label} numberOfLines={2}>
          {label}
        </AppText>
        <AppText variant="subtitle" style={styles.value}>
          {valueLabel}
        </AppText>
      </View>
      <Slider
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: valueLabel }}
        minimumValue={0}
        maximumValue={maximumValue}
        step={1}
        value={seconds}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        onValueChange={(next) => onChange(Math.round(next))}
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
  label: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    color: colors.primary,
    flexShrink: 0,
  },
});
