import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { DEFAULT_INTEGRATION_CONFIG } from '@/features/calculus/calculus.types';
import { tryGenerateIntegrationQuestion } from '@/features/calculus/integrationGenerator';

describe('integrationGenerator', () => {
  it('enables the full integration rule set by default', () => {
    expect(DEFAULT_INTEGRATION_CONFIG).toMatchObject({
      powerRule: true,
      constantRule: true,
      simpleSum: true,
      naturalLogRule: true,
      trigRule: true,
      quotientRule: true,
    });
  });

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

  it('generates varied questions when all integration rules are enabled', () => {
    const config = getRecommendedLearningPlan(12);
    config.integration = { ...DEFAULT_INTEGRATION_CONFIG, enabled: true };
    const families = new Set<string>();

    for (let i = 0; i < 180; i++) {
      const text = tryGenerateIntegrationQuestion(config)!.questionText;
      if (text.includes('sin') || text.includes('cos')) families.add('trig');
      else if (text.includes('1/x')) families.add('natural_log');
      else if (text.includes('/x')) families.add('quotient');
      else if (text.includes(' + ')) families.add('sum');
      else if (/∫\d+ dx/.test(text)) families.add('constant');
      else families.add('power');
    }

    expect(families).toEqual(
      new Set(['power', 'constant', 'sum', 'natural_log', 'trig', 'quotient']),
    );
  });
});
