import { FRACTION_DENOMINATOR_POOL } from '@/constants/fractions';
import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { tryGenerateFractionVisualQuestion } from '@/features/questions/fractionVisualGenerator';

describe('fractionVisualGenerator', () => {
  it('generates a fraction identification question that supports keyboard entry', () => {
    const config = {
      ...getRecommendedLearningPlan(8),
      fractionVisual: { enabled: true },
      answerOptionsCount: 4 as const,
    };
    const q = tryGenerateFractionVisualQuestion(config);
    expect(q).not.toBeNull();
    expect(q!.questionText).toBe('What fraction is shaded?');
    expect(['bar', 'circle']).toContain(q!.model);
    expect(q!.shaded.numerator).toBeGreaterThan(0);
    expect(q!.shaded.numerator).toBeLessThan(q!.shaded.denominator);
    expect(q!.answerOptions).toContain(q!.correctAnswer);
    expect(q!.answerOptions.length).toBe(4);
    expect(q!.requiresMultipleChoice).toBe(false);
  });

  it('randomizes between bar and circle models', () => {
    const config = {
      ...getRecommendedLearningPlan(8),
      fractionVisual: { enabled: true },
      answerOptionsCount: 4 as const,
    };
    const models = new Set(
      Array.from({ length: 100 }, () => tryGenerateFractionVisualQuestion(config)?.model),
    );

    expect(models).toEqual(new Set(['bar', 'circle']));
  });

  it('matches visual slice count to the reduced correct fraction', () => {
    const config = {
      ...getRecommendedLearningPlan(8),
      fractionVisual: { enabled: true },
      answerOptionsCount: 4 as const,
    };
    for (let i = 0; i < 40; i++) {
      const q = tryGenerateFractionVisualQuestion(config);
      expect(q).not.toBeNull();
      expect(q!.correctAnswer).toBe(`${q!.shaded.numerator}/${q!.shaded.denominator}`);
      expect(FRACTION_DENOMINATOR_POOL).toContain(q!.shaded.denominator);
    }
  });
});
