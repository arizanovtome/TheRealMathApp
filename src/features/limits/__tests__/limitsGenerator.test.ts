import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { tryGenerateLimitQuestion } from '../limitsGenerator';

describe('limits generator', () => {
  const base = getRecommendedLearningPlan(15);
  const subtypes = [
    ['directSubstitution', 'direct_substitution'],
    ['factorAndCancel', 'factor_and_cancel'],
    ['limitsAtInfinity', 'limits_at_infinity'],
    ['rationalization', 'rationalization'],
  ] as const;

  it.each(subtypes)('generates %s questions with finite answer options', (key, subtype) => {
    const config = { ...base, limits: { ...base.limits, enabled: true, directSubstitution: false, factorAndCancel: false, limitsAtInfinity: false, rationalization: false, [key]: true } };
    for (let i = 0; i < 40; i++) {
      const q = tryGenerateLimitQuestion(config);
      expect(q?.subtype).toBe(subtype);
      expect(q?.answerOptions).toContain(q?.correctAnswer);
      if (subtype === 'rationalization') {
        expect(q?.correctAnswer).toMatch(/^1\/\d+$/);
      } else {
        expect(Number.isFinite(Number(q?.correctAnswer))).toBe(true);
      }
      if (subtype !== 'direct_substitution') {
        expect(q?.expressionFraction?.numerator).toBeTruthy();
        expect(q?.expressionFraction?.denominator).toBeTruthy();
      }
    }
  });

  it('respects the configured answer-choice count', () => {
    const config = {
      ...base,
      answerOptionsCount: 3 as const,
      limits: { ...base.limits, enabled: true },
    };
    for (let i = 0; i < 30; i++) {
      expect(tryGenerateLimitQuestion(config)?.answerOptions).toHaveLength(3);
    }
  });

  it('shows Evaluate above compact limit notation', () => {
    const config = {
      ...base,
      limits: { ...base.limits, enabled: true, limitsAtInfinity: false },
    };
    const q = tryGenerateLimitQuestion(config);
    expect(q?.questionText).toMatch(/^Evaluate\nlimₓ→[₋₀₁₂₃₄₅₆₇₈₉]+ /);
  });

  it('cycles through every enabled subtype before repeating', () => {
    const config = { ...base, limits: { ...base.limits, enabled: true } };
    const generated = Array.from({ length: 4 }, () => tryGenerateLimitQuestion(config)?.subtype);
    expect(new Set(generated)).toEqual(new Set([
      'direct_substitution',
      'factor_and_cancel',
      'limits_at_infinity',
      'rationalization',
    ]));
  });
});
