import { AppText } from '@/components/common/AppText';
import { OperationConfigCard } from '@/components/learning-plan/OperationConfigCard';
import type { FractionVisualConfig } from '@/features/learning-plan/learningPlan.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';

type FractionVisualSettingsCardProps = {
  fractionVisual: FractionVisualConfig;
  onChange: (fractionVisual: FractionVisualConfig) => void;
};

export function FractionVisualSettingsCard({
  fractionVisual,
  onChange,
}: FractionVisualSettingsCardProps) {
  const { t } = useAppTranslation(['settings', 'common']);

  return (
    <OperationConfigCard
      operation="fraction_visual"
      enabled={fractionVisual.enabled}
      onToggle={(enabled) => onChange({ ...fractionVisual, enabled })}
    >
      <AppText variant="body" muted>
        {t('settings:fractionRecognitionDesc')}
      </AppText>
    </OperationConfigCard>
  );
}
