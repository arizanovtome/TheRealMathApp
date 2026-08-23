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
      naturalLogRule: false,
      trigRule: false,
      quotientRule: false,
    };
    const q = tryGenerateIntegrationQuestion(config);
    expect(q).not.toBeNull();
    expect(q!.kind).toBe('calculus');
    expect(q!.operation).toBe('integration');
    expect(q!.questionText).toMatch(/∫/);
    expect(q!.correctAnswer).toMatch(/\+ C$/);
    expect(q!.answerOptions).toContain(q!.correctAnswer);
  });

  it('generates trig integral questions', () => {
    const config = getRecommendedLearningPlan(12);
    config.integration = {
      enabled: true,
      powerRule: false,
      constantRule: false,
      simpleSum: false,
      naturalLogRule: false,
      trigRule: true,
      quotientRule: false,
    };
    let q = tryGenerateIntegrationQuestion(config);
    for (let i = 0; i < 20 && !q?.questionText.includes('sin') && !q?.questionText.includes('cos'); i++) {
      q = tryGenerateIntegrationQuestion(config);
    }
    expect(q!.questionText).toMatch(/sin|cos/);
    expect(q!.correctAnswer).toMatch(/\+ C$/);
  });

  it('generates quotient integral questions', () => {
    const config = getRecommendedLearningPlan(12);
    config.integration = {
      enabled: true,
      powerRule: false,
      constantRule: false,
      simpleSum: false,
      naturalLogRule: false,
      trigRule: false,
      quotientRule: true,
    };
    const q = tryGenerateIntegrationQuestion(config);
    expect(q!.questionText).toMatch(/\//);
    expect(q!.correctAnswer).toMatch(/\+ C$/);
  });
});
