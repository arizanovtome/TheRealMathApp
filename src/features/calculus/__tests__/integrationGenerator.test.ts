import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { tryGenerateIntegrationQuestion } from '@/features/calculus/integrationGenerator';

describe('integrationGenerator', () => {
  it('returns null when integration is disabled', () => {
    const config = getRecommendedLearningPlan(10);
    expect(tryGenerateIntegrationQuestion(config)).toBeNull();
  });

  it('generates a symbolic MC question with + C when enabled', () => {
    const config = getRecommendedLearningPlan(10);
    config.integration = {
      enabled: true,
      powerRule: true,
      constantRule: true,
      simpleSum: false,
    };
    const q = tryGenerateIntegrationQuestion(config);
    expect(q).not.toBeNull();
    expect(q!.kind).toBe('calculus');
    expect(q!.operation).toBe('integration');
    expect(q!.questionText).toMatch(/∫/);
    expect(q!.correctAnswer).toMatch(/\+ C$/);
    expect(q!.answerOptions).toContain(q!.correctAnswer);
  });
});
