import { CalculusSettingsCard } from '@/components/learning-plan/CalculusSettingsCard';
import type { CalculusOpConfig } from '@/features/calculus/calculus.types';

type IntegrationSettingsCardProps = {
  integration: CalculusOpConfig;
  onChange: (integration: CalculusOpConfig) => void;
};

export function IntegrationSettingsCard({
  integration,
  onChange,
}: IntegrationSettingsCardProps) {
  return (
    <CalculusSettingsCard
      operation="integration"
      config={integration}
      onChange={onChange}
    />
  );
}
