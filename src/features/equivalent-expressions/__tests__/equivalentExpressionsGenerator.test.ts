import { getEnabledEquivalentExpressionSubtypes } from '../equivalentExpressionsConfig.utils';
import {
  generateEquivalentExpressionQuestion,
  tryGenerateEquivalentExpressionQuestion,
} from '../equivalentExpressionsGenerator';
import type { EquivalentExpressionSubtype } from '../equivalentExpressions.types';
import { applyPracticeFocusOverride } from '@/features/learning-plan/learningPlan.utils';
import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { ANSWER_OPTIONS_COUNT_OPTIONS } from '@/features/learning-plan/learningPlan.types';
import * as random from '@/utils/random';
import { gcd } from '@/features/questions/fractions';
import { createSessionQuestions } from '@/features/questions/questionGenerator';
import { submittedAnswerIsCorrect } from '@/features/questions/questionScoring';

const ALL_SUBTYPES: EquivalentExpressionSubtype[] = [
  'square_of_sum',
  'square_of_difference',
  'parentheses_after_addition',
  'parentheses_after_subtraction',
  'distributive_property',
  'difference_of_squares',
  'factorization',
];

describe('equivalent expressions generator', () => {
  const base = getRecommendedLearningPlan(14);
  const config = {
    ...base,
    equivalentExpressions: { ...base.equivalentExpressions, enabled: true },
  };

  it.each(ALL_SUBTYPES)('generates valid multiple-choice data for %s', (subtype) => {
    const question = tryGenerateEquivalentExpressionQuestion(config, subtype);
    expect(question).not.toBeNull();
    expect(question!.kind).toBe('equivalent_expression');
    expect(question!.operation).toBe('equivalent_expressions');
    expect(question!.subtype).toBe(subtype);
    expect(question!.requiresMultipleChoice).toBe(true);
    expect(question!.answerOptions).toContain(question!.correctAnswer);
    expect(new Set(question!.answerOptions).size).toBe(question!.answerOptions.length);
    expect(question!.answerOptions.length).toBe(config.answerOptionsCount);
  });

  it('respects answerOptionsCount when fewer than all distractors are needed', () => {
    const fourChoices = { ...config, answerOptionsCount: 4 as const };
    for (const subtype of ALL_SUBTYPES) {
      const question = tryGenerateEquivalentExpressionQuestion(fourChoices, subtype);
      expect(question!.answerOptions).toHaveLength(4);
    }
  });

  afterEach(() => jest.restoreAllMocks());

  it.each(ANSWER_OPTIONS_COUNT_OPTIONS)('provides exactly %i unique choices for every subtype', (count) => {
    jest.spyOn(random, 'randomIntInclusive').mockImplementation((min) => min);
    for (const subtype of ALL_SUBTYPES) {
      const question = tryGenerateEquivalentExpressionQuestion({ ...config, answerOptionsCount: count }, subtype)!;
      expect(question.answerOptions).toHaveLength(count);
      expect(new Set(question.answerOptions).size).toBe(count);
      expect(question.answerOptions.filter((option) => option === question.correctAnswer)).toHaveLength(1);
    }
  });

  it('provides six choices with only one equivalent answer for every parentheses operand/sign combination', () => {
    const rng = jest.spyOn(random, 'randomIntInclusive').mockImplementation((min) => min);
    const valueOf = (expression: string) => {
      const match = /^(\d+) ([+−]) (\d+) ([+−]) (\d+)$/.exec(expression)!;
      return Number(match[1]) + (match[2] === '+' ? 1 : -1) * Number(match[3])
        + (match[4] === '+' ? 1 : -1) * Number(match[5]);
    };
    for (const subtype of ['parentheses_after_addition', 'parentheses_after_subtraction'] as const) {
      for (let b = 2; b <= 20; b++) {
        for (let c = 2; c <= 20; c++) {
          for (const sign of [0, 1]) {
            rng.mockReturnValueOnce(20).mockReturnValueOnce(b).mockReturnValueOnce(c).mockReturnValueOnce(sign);
            const question = generateEquivalentExpressionQuestion(subtype, 6);
            expect(question.answerOptions).toHaveLength(6);
            expect(new Set(question.answerOptions).size).toBe(6);
            expect(question.answerOptions.filter((option) => valueOf(option) === valueOf(question.correctAnswer)))
              .toEqual([question.correctAnswer]);
          }
        }
      }
    }
  });

  it('provides six unique choices and only one equivalent factorization for every generated coefficient', () => {
    const rng = jest.spyOn(random, 'randomIntInclusive').mockImplementation((min) => min);
    for (let k = 2; k <= 9; k++) {
      for (let m = 1; m <= 9; m++) {
        for (let n = 2; n <= 9; n++) {
          rng.mockReturnValueOnce(k).mockReturnValueOnce(m).mockReturnValueOnce(n);
          const question = generateEquivalentExpressionQuestion('factorization', 6);
          expect(question.answerOptions).toHaveLength(6);
          expect(new Set(question.answerOptions).size).toBe(6);
          const equivalent = question.answerOptions.filter((option) => {
            const match = /^(\d+)\((\d*)x ([+−]) (\d+)\)$/.exec(option)!;
            const factor = Number(match[1]);
            return factor * Number(match[2] || 1) === k * m
              && factor * (match[3] === '+' ? 1 : -1) * Number(match[4]) === k * n;
          });
          expect(equivalent).toEqual([question.correctAnswer]);
        }
      }
    }
  });

  it('uses the correct binomial-square identities', () => {
    expect(generateEquivalentExpressionQuestion('square_of_sum').correctAnswer).toBe(
      'a² + 2ab + b²',
    );
    expect(generateEquivalentExpressionQuestion('square_of_difference').correctAnswer).toBe(
      'a² − 2ab + b²',
    );
  });

  it('uses the correct difference-of-squares identity', () => {
    expect(generateEquivalentExpressionQuestion('difference_of_squares').correctAnswer).toBe(
      '(a + b)(a − b)',
    );
  });

  it('distributes a coefficient to both terms', () => {
    for (let i = 0; i < 30; i++) {
      const question = generateEquivalentExpressionQuestion('distributive_property');
      const prompt = /^(\d+)\(x \+ (\d+)\) =$/.exec(question.questionText);
      const answer = /^(\d+)x \+ (\d+)$/.exec(question.correctAnswer);
      expect(prompt).not.toBeNull();
      expect(answer).not.toBeNull();
      expect(Number(answer![1])).toBe(Number(prompt![1]));
      expect(Number(answer![2])).toBe(Number(prompt![1]) * Number(prompt![2]));
    }
  });

  it('removes parentheses with the correct signs', () => {
    for (const subtype of ['parentheses_after_addition', 'parentheses_after_subtraction'] as const) {
      for (let i = 0; i < 30; i++) {
        const question = generateEquivalentExpressionQuestion(subtype);
        const prompt = /^(\d+) ([+−]) \((\d+) ([+−]) (\d+)\) =$/.exec(question.questionText)!;
        const answer = /^(\d+) ([+−]) (\d+) ([+−]) (\d+)$/.exec(question.correctAnswer)!;
        const signed = (sign: string, value: number) => (sign === '+' ? value : -value);
        const promptValue = Number(prompt[1]) + signed(prompt[2], Number(prompt[3]) + signed(prompt[4], Number(prompt[5])));
        const answerValue = Number(answer[1]) + signed(answer[2], Number(answer[3])) + signed(answer[4], Number(answer[5]));
        expect(answerValue).toBe(promptValue);
      }
    }
  });

  it('factors using the greatest common factor', () => {
    for (let i = 0; i < 50; i++) {
      const question = generateEquivalentExpressionQuestion('factorization');
      const prompt = /^(\d+)x \+ (\d+) =$/.exec(question.questionText)!;
      const a = Number(prompt[1]);
      const b = Number(prompt[2]);
      const g = gcd(a, b);
      const cx = a / g;
      const c0 = b / g;
      const expected = cx === 1 ? `${g}(x + ${c0})` : `${g}(${cx}x + ${c0})`;
      expect(question.correctAnswer).toBe(expected);
    }
  });

  it('factors 72x + 72 as 72(x + 1) when those terms are generated', () => {
    for (let i = 0; i < 200; i++) {
      const question = generateEquivalentExpressionQuestion('factorization');
      if (question.questionText !== '72x + 72 =') continue;
      expect(question.correctAnswer).toBe('72(x + 1)');
      expect(question.answerOptions).toContain('72(x + 1)');
      expect(question.answerOptions).not.toContain('72(x + 9)');
      return;
    }
    expect(true).toBe(true);
  });

  it('excludes disabled subtypes', () => {
    const onlyFactorization = {
      ...config,
      equivalentExpressions: {
        ...config.equivalentExpressions,
        squareOfSum: false,
        squareOfDifference: false,
        parenthesesAfterAddition: false,
        parenthesesAfterSubtraction: false,
        distributiveProperty: false,
        differenceOfSquares: false,
        factorization: true,
      },
    };
    expect(getEnabledEquivalentExpressionSubtypes(onlyFactorization)).toEqual(['factorization']);
    expect(tryGenerateEquivalentExpressionQuestion(onlyFactorization, 'square_of_sum')).toBeNull();
  });

  it('scores only the correct selected expression', () => {
    const draft = generateEquivalentExpressionQuestion('square_of_sum');
    const question = { ...draft, id: 'equivalent-test' };
    expect(submittedAnswerIsCorrect(question, question.correctAnswer)).toBe(true);
    const wrong = question.answerOptions.find((option) => option !== question.correctAnswer)!;
    expect(submittedAnswerIsCorrect(question, wrong)).toBe(false);
  });

  it('generates full sessions when it is the only enabled operation', () => {
    const focused = applyPracticeFocusOverride({ ...config, answerOptionsCount: 6 }, 'equivalent_expressions', { force: true });
    const questions = createSessionQuestions(focused, 20);
    expect(questions).toHaveLength(20);
    expect(questions.every((question) => question.answerOptions.length === 6)).toBe(true);
    expect(questions.every((question) => question.kind === 'equivalent_expression')).toBe(true);
  });
});
