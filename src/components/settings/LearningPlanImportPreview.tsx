import { AppText } from '@/components/common/AppText';
import { ALL_MATH_OPERATIONS, type MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { operationLabel } from '@/i18n/labels';
import { useAppTranslation } from '@/i18n/useAppTranslation';

export function LearningPlanImportPreview({ config }: { config: MathLearningConfig }) {
  const { t } = useAppTranslation(['settings', 'common']);
  const names = ALL_MATH_OPERATIONS.filter((operation) => {
    const key = operation === 'pattern' ? 'patterns' : operation.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
    const setting = config[key as keyof MathLearningConfig];
    return typeof setting === 'object' && setting !== null && 'enabled' in setting && setting.enabled;
  }).map((operation) => operationLabel(operation, t));
  if (config.equationUnknown.enabled) names.push(t('settings:importPreviewEquations'));
  if (config.equationTwoUnknowns.enabled) names.push(t('settings:importPreviewTwoUnknowns'));
  return <>
    <AppText variant="subtitle">{t('settings:importPreviewTitle')}</AppText>
    <AppText>{t('settings:importPreviewTopics', { topics: names.join(', ') || t('settings:importPreviewNoTopics') })}</AppText>
    <AppText>{t('settings:importPreviewSession', { mode: t(`settings:importPreviewMode_${config.mode}`), count: config.questionsCount })}</AppText>
    <AppText>{config.mode === 'timed'
      ? t('settings:importPreviewTimed', { minutes: config.timedDurationMinutes, bonus: config.timedCorrectBonusSeconds, penalty: config.timedWrongPenaltySeconds })
      : t('settings:importPreviewTimer', { seconds: config.timerEnabled ? config.timerSecondsPerQuestion : 0 })}</AppText>
  </>;
}
