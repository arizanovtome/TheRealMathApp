import {
  normalizeDivisionConfig,
  normalizeMultiplicationConfig,
} from '@/features/learning-plan/learningPlan.utils';

describe('normalizeMultiplicationConfig', () => {
  it('uses legacy left/right ranges to infer factors 1–10', () => {
    const result = normalizeMultiplicationConfig({
      enabled: true,
      leftMin: 1,
      leftMax: 5,
      rightMin: 2,
      rightMax: 10,
    });
    expect(result.factors).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.secondFactorSource).toBe('selection_only');
    expect(result.randomizeFactorOrder).toBe(false);
  });

  it('prefers explicit factors when present', () => {
    const result = normalizeMultiplicationConfig({
      enabled: true,
      factors: [2, 5, 10],
    });
    expect(result.factors).toEqual([2, 5, 10]);
    expect(result.secondFactorSource).toBe('selection_only');
    expect(result.randomizeFactorOrder).toBe(false);
  });

  it('preserves randomizeFactorOrder when true', () => {
    const result = normalizeMultiplicationConfig({
      enabled: true,
      factors: [5],
      secondFactorSource: 'one_to_ten',
      randomizeFactorOrder: true,
    });
    expect(result.randomizeFactorOrder).toBe(true);
  });

  it('preserves secondFactorSource when valid', () => {
    const result = normalizeMultiplicationConfig({
      enabled: true,
      factors: [3, 4],
      secondFactorSource: 'one_to_twenty',
    });
    expect(result.secondFactorSource).toBe('one_to_twenty');
  });
});

describe('normalizeDivisionConfig', () => {
  it('maps legacy divisor range onto 1–10 choices', () => {
    const result = normalizeDivisionConfig({
      enabled: true,
      answerMin: 1,
      answerMax: 10,
      divisorMin: 2,
      divisorMax: 5,
    });
    expect(result.divisors).toEqual([2, 3, 4, 5]);
  });
});
