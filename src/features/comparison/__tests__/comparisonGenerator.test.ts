import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import {
  getEnabledComparisonSubtypes,
  hasComparisonQuestionSource,
} from '@/features/comparison/comparisonConfig.utils';
import { tryGenerateComparisonQuestion } from '@/features/comparison/comparisonGenerator';
import { submittedAnswerIsCorrect } from '@/features/questions/questionScoring';

describe('comparisonGenerator', () => {
  const base = getRecommendedLearningPlan(8);

  const withComparison = {
    ...base,
    comparison: {
      enabled: true,
      relational: true,
      ordering: true,
      expressionCompare: true,
      fractionVsDecimal: false,
      percentVsFraction: false,
      fractionVsFraction: false,
      measurementUnitConversion: false,
    },
  };

  it('hasComparisonQuestionSource when comparison enabled', () => {
    expect(hasComparisonQuestionSource(withComparison)).toBe(true);
    expect(getEnabledComparisonSubtypes(withComparison)).toContain('relational');
    expect(getEnabledComparisonSubtypes(withComparison)).toContain('ordering');
    expect(getEnabledComparisonSubtypes(withComparison)).toContain('expression');
  });

  it('generates relational comparison with symbol answers', () => {
    const q = tryGenerateComparisonQuestion(withComparison, 'relational');
    expect(q).not.toBeNull();
    expect(q!.subtype).toBe('relational');
    expect(q!.answerOptions).toEqual(expect.arrayContaining(['<', '>', '=']));
    expect(q!.answerOptions).toContain(String(q!.correctAnswer));
  });

  it('generates ordering with permutation options', () => {
    const q = tryGenerateComparisonQuestion(withComparison, 'ordering');
    expect(q).not.toBeNull();
    expect(q!.subtype).toBe('ordering');
    expect(q!.answerOptions.length).toBeGreaterThanOrEqual(2);
    expect(q!.answerOptions).toContain(q!.correctAnswer);
  });

  it('expression compare requires enabled basic ops', () => {
    const noOps = {
      ...withComparison,
      addition: { ...withComparison.addition, enabled: false },
      subtraction: { ...withComparison.subtraction, enabled: false },
      multiplication: { ...withComparison.multiplication, enabled: false },
      division: { ...withComparison.division, enabled: false },
    };
    expect(getEnabledComparisonSubtypes(noOps)).not.toContain('expression');
  });

  it('respects expression compare toggle off', () => {
    const config = {
      ...withComparison,
      comparison: { ...withComparison.comparison, expressionCompare: false },
    };
    expect(getEnabledComparisonSubtypes(config)).not.toContain('expression');
  });

  it('generates fraction vs decimal questions when enabled', () => {
    const config = {
      ...withComparison,
      comparison: { ...withComparison.comparison, fractionVsDecimal: true },
    };
    const q = tryGenerateComparisonQuestion(config, 'fraction_vs_decimal');
    expect(q).not.toBeNull();
    expect(q!.subtype).toBe('fraction_vs_decimal');
    expect(q!.questionText).toMatch(/ __ /);
    expect(q!.answerOptions).toContain(q!.correctAnswer);
    expect(submittedAnswerIsCorrect(q!, q!.correctAnswer)).toBe(true);
  });

  it('generates percent vs fraction questions when enabled', () => {
    const config = {
      ...withComparison,
      comparison: { ...withComparison.comparison, percentVsFraction: true },
    };
    const q = tryGenerateComparisonQuestion(config, 'percent_vs_fraction');
    expect(q).not.toBeNull();
    expect(q!.questionText).toMatch(/% __ /);
    expect(submittedAnswerIsCorrect(q!, q!.correctAnswer)).toBe(true);
  });

  it('generates fraction vs fraction questions when enabled', () => {
    const config = {
      ...withComparison,
      comparison: { ...withComparison.comparison, fractionVsFraction: true },
    };
    const q = tryGenerateComparisonQuestion(config, 'fraction_vs_fraction');
    expect(q).not.toBeNull();
    expect(q!.questionText).toMatch(/\d+\/\d+ __ \d+\/\d+/);
    expect(submittedAnswerIsCorrect(q!, q!.correctAnswer)).toBe(true);
  });

  it('generates measurement comparison questions when enabled', () => {
    const config = {
      ...withComparison,
      comparison: { ...withComparison.comparison, measurementUnitConversion: true },
    };
    const q = tryGenerateComparisonQuestion(config, 'measurement');
    expect(q).not.toBeNull();
    expect(q!.questionText).toMatch(/ __ /);
    expect(q!.answerOptions).toEqual(expect.arrayContaining(['<', '>', '=']));
    expect(submittedAnswerIsCorrect(q!, q!.correctAnswer)).toBe(true);
  });

  it('respects relational toggle off', () => {
    const config = {
      ...withComparison,
      comparison: { ...withComparison.comparison, relational: false },
    };
    expect(getEnabledComparisonSubtypes(config)).not.toContain('relational');
  });
});
