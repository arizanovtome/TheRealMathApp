import { CalculusSettingsCard } from '@/components/learning-plan/CalculusSettingsCard';
import type { CalculusOpConfig } from '@/features/calculus/calculus.types';

type DifferentiationSettingsCardProps = {
  differentiation: CalculusOpConfig;
  onChange: (differentiation: CalculusOpConfig) => void;
};

export function DifferentiationSettingsCard({
  differentiation,
  onChange,
}: DifferentiationSettingsCardProps) {
  return (
    <CalculusSettingsCard
      operation="differentiation"
      config={differentiation}
      onChange={onChange}
    />
  );
}
