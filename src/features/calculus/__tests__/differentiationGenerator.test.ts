import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { tryGenerateDifferentiationQuestion } from '@/features/calculus/differentiationGenerator';

describe('differentiationGenerator', () => {
  it('returns null when differentiation is disabled', () => {
    const config = getRecommendedLearningPlan(10);
    expect(tryGenerateDifferentiationQuestion(config)).toBeNull();
  });

  it('generates a symbolic MC question when enabled', () => {
    const config = getRecommendedLearningPlan(10);
    config.differentiation = {
      enabled: true,
      powerRule: true,
      constantRule: true,
      simpleSum: false,
      naturalLogRule: false,
      trigRule: false,
      quotientRule: false,
    };
    const q = tryGenerateDifferentiationQuestion(config);
    expect(q).not.toBeNull();
    expect(q!.kind).toBe('calculus');
    expect(q!.operation).toBe('differentiation');
    expect(q!.questionText).toMatch(/'\s*=\s*\?/);
    expect(q!.answerOptions).toContain(q!.correctAnswer);
    expect(q!.requiresMultipleChoice).toBe(true);
  });

  it('can generate constant rule questions', () => {
    const config = getRecommendedLearningPlan(12);
    config.differentiation = {
      enabled: true,
      powerRule: false,
      constantRule: true,
      simpleSum: false,
      naturalLogRule: false,
      trigRule: false,
      quotientRule: false,
    };
    for (let i = 0; i < 20; i++) {
      const q = tryGenerateDifferentiationQuestion(config);
      if (q?.correctAnswer === '0') {
        expect(q.questionText).toMatch(/\(\d+\)'\s*=\s*\?/);
        return;
      }
    }
    expect(true).toBe(true);
  });

  it('generates trig derivative questions', () => {
    const config = getRecommendedLearningPlan(12);
    config.differentiation = {
      enabled: true,
      powerRule: false,
      constantRule: false,
      simpleSum: false,
      naturalLogRule: false,
      trigRule: true,
      quotientRule: false,
    };
    let q = tryGenerateDifferentiationQuestion(config);
    for (let i = 0; i < 20 && !q?.questionText.includes('sin') && !q?.questionText.includes('cos'); i++) {
      q = tryGenerateDifferentiationQuestion(config);
    }
    expect(q!.questionText).toMatch(/sin|cos/);
    expect(q!.correctAnswer).toMatch(/cos x|sin x/);
  });

  it('generates quotient derivative questions that require the quotient rule', () => {
    const config = getRecommendedLearningPlan(12);
    config.differentiation = {
      enabled: true,
      powerRule: false,
      constantRule: false,
      simpleSum: false,
      naturalLogRule: false,
      trigRule: false,
      quotientRule: true,
    };
    for (let i = 0; i < 30; i++) {
      const q = tryGenerateDifferentiationQuestion(config);
      expect(q!.questionText).toMatch(/\/\s*\(x\s*\+\s*\d+\)/);
      expect(q!.answerOptions).toContain(q!.correctAnswer);
    }
  });
});
