import { SettingsSlider } from '@/components/learning-plan/SettingsSlider';

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
    <SettingsSlider
      label={label}
      valueLabel={valueLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityValueText={valueLabel}
      minimumValue={0}
      maximumValue={maximumValue}
      step={1}
      value={seconds}
      onValueChange={(next) => onChange(Math.round(next))}
    />
  );
}
