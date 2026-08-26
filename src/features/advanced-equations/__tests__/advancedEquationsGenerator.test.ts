import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { tryGenerateAdvancedEquationQuestion } from '../advancedEquationsGenerator';

describe('advanced equations generator', () => {
  const base = getRecommendedLearningPlan(15);
  const subtypes = [
    ['multiStepLinear', 'multi_step_linear'],
    ['variablesBothSides', 'variables_both_sides'],
    ['linearParentheses', 'linear_parentheses'],
    ['factorableQuadratic', 'factorable_quadratic'],
  ] as const;

  it.each(subtypes)('generates %s questions with the correct option', (key, subtype) => {
    const config = { ...base, advancedEquations: { ...base.advancedEquations, enabled: true, multiStepLinear: false, variablesBothSides: false, linearParentheses: false, factorableQuadratic: false, [key]: true } };
    for (let i = 0; i < 25; i++) {
      const q = tryGenerateAdvancedEquationQuestion(config);
      expect(q?.subtype).toBe(subtype);
      expect(q?.questionText).toMatch(/^Find x:\n/);
      expect(q?.answerOptions).toContain(q?.correctAnswer);
      expect(new Set(q?.answerOptions).size).toBe(q?.answerOptions.length);
    }
  });

  it('respects the configured answer-choice count', () => {
    const config = {
      ...base,
      answerOptionsCount: 4 as const,
      advancedEquations: { ...base.advancedEquations, enabled: true },
    };
    for (let i = 0; i < 30; i++) {
      expect(tryGenerateAdvancedEquationQuestion(config)?.answerOptions).toHaveLength(4);
    }
  });
});
