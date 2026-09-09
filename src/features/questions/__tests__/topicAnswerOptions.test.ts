import { ANSWER_OPTIONS_COUNT_OPTIONS } from '@/features/learning-plan/learningPlan.types';
import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { buildCalculusMcOptions } from '@/features/calculus/calculusExpression.utils';
import { normalizeCalculusAnswer } from '@/features/calculus/calculusFormat';
import { buildLogMcOptions, buildNumericMcOptions } from '@/features/logarithm/logarithmExpression.utils';
import { tryGenerateClockQuestion } from '@/features/clock/clockGenerator';
import { tryGenerateGeometryQuestion } from '@/features/geometry/geometryGenerator';
import { DEFAULT_GEOMETRY_CONFIG, PLANAR_SHAPES, VOLUME_SHAPES } from '@/features/geometry/geometry.types';
import { buildPickFormulaNumericDistractors, buildTrigMcOptions, formatNumericRatioLabel } from '@/features/trigonometry/trigonometryFormulas';
import { tryGenerateLimitQuestion } from '@/features/limits/limitsGenerator';
import { tryGenerateFractionVisualQuestion } from '@/features/questions/fractionVisualGenerator';
import { tryGenerateAdvancedEquationQuestion } from '@/features/advanced-equations/advancedEquationsGenerator';
import { buildAnswerOptions, buildDecimalAnswerOptions, buildFixedAnswerOptions } from '@/features/questions/answerOptionsGenerator';
import { buildRemainderMcOptions } from '@/features/questions/divisionRemainder';
import { buildFractionMcOptions } from '@/features/questions/fractions';
import * as random from '@/utils/random';

function expectChoices(options: string[], correct: string, count: number) {
  expect(options).toHaveLength(count);
  expect(new Set(options).size).toBe(count);
  expect(options.filter((option) => option === correct)).toHaveLength(1);
}

afterEach(() => jest.restoreAllMocks());

describe.each(ANSWER_OPTIONS_COUNT_OPTIONS)('%i answer choices across topics', (count) => {
  it('fills sparse calculus pools without repeated answers', () => {
    jest.spyOn(random, 'randomIntInclusive').mockImplementation((min) => min);
    for (const correct of ['1x + C', '0', 'cos x', 'x²/2 + C']) {
      const options = buildCalculusMcOptions(correct, [correct, '0', ' 0 '], count);
      expectChoices(options, correct, count);
      expect(new Set(options.map(normalizeCalculusAnswer)).size).toBe(count);
    }
  });

  it('fills sparse symbolic and numeric logarithm pools even with repeated random draws', () => {
    jest.spyOn(random, 'randomIntInclusive').mockImplementation((min) => min);
    expectChoices(buildLogMcOptions('log 2 + log 2', ['log 4'], count), 'log 2 + log 2', count);
    for (let correct = 0; correct <= 12; correct++) {
      expectChoices(buildNumericMcOptions(correct, count), String(correct), count);
    }
  });

  it.each([12, 24] as const)('fills clock choices in %i-hour format with repeated random draws', (hourFormat) => {
    jest.spyOn(random, 'randomIntInclusive').mockImplementation((min) => min);
    const base = getRecommendedLearningPlan(8);
    const question = tryGenerateClockQuestion({ ...base, answerOptionsCount: count,
      clock: { ...base.clock, enabled: true, readAnalog: true, elapsedTime: false, hourFormat } })!;
    expectChoices(question.answerOptions, String(question.correctAnswer), count);
  });

  it('provides enough geometry formula choices for every measure and shape', () => {
    const base = getRecommendedLearningPlan(14);
    for (const [measure, shapes] of [
      ['perimeter', PLANAR_SHAPES], ['area', PLANAR_SHAPES], ['volume', VOLUME_SHAPES],
    ] as const) {
      for (const shape of shapes) {
        let geometry = { ...DEFAULT_GEOMETRY_CONFIG, enabled: true,
          questionKinds: { formula: true, calculate: false },
          perimeter: { ...DEFAULT_GEOMETRY_CONFIG.perimeter, enabled: false },
          area: { ...DEFAULT_GEOMETRY_CONFIG.area, enabled: false },
          volume: { ...DEFAULT_GEOMETRY_CONFIG.volume, enabled: false } };
        geometry = { ...geometry, [measure]: { enabled: true, shapes: Object.fromEntries(shapes.map((key) => [key, key === shape])) } };
        const question = tryGenerateGeometryQuestion({ ...base, answerOptionsCount: count, geometry })!;
        expectChoices(question.answerOptions, String(question.correctAnswer), count);
      }
    }
  });

  it('fills trigonometry choices for one-known-side and equal-leg diagrams', () => {
    for (const [ratio, values, unknown] of [
      ['tan', { adjacent: 5 }, 'opposite'],
      ['tan', { opposite: 5, adjacent: 5 }, 'angle'],
      ['sin', { hypotenuse: 10 }, 'opposite'],
    ] as const) {
      const correct = formatNumericRatioLabel(ratio, values, unknown);
      const options = buildTrigMcOptions(correct, buildPickFormulaNumericDistractors(ratio, values, unknown), count);
      expectChoices(options, correct, count);
      expect(options.every((option) => (option.match(/\?/g) ?? []).length < 2)).toBe(true);
    }
  });

  it('covers integer, decimal, remainder, and fraction answer builders', () => {
    for (const correct of [0, 1, 2, 5, 10, 100]) {
      expectChoices(buildAnswerOptions(correct, count, false, { min: 0, max: 100 }).map(String), String(correct), count);
      expectChoices(buildDecimalAnswerOptions(correct + 0.25, count, false).map(String), String(correct + 0.25), count);
      expectChoices(buildRemainderMcOptions({ quotient: correct, remainder: 1 }, count), `${correct} R 1`, count);
    }
    expectChoices(buildFractionMcOptions({ numerator: 1, denominator: 2 }, count), '1/2', count);
    expect(buildFixedAnswerOptions(['Even', 'Odd'], count)).toHaveLength(2);
    expect(buildFixedAnswerOptions(['<', '>', '='], count)).toHaveLength(3);
  });

  it('covers limits, visual fractions, and advanced equations with a repeatable random sequence', () => {
    let seed = 12345;
    jest.spyOn(Math, 'random').mockImplementation(() => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    });
    const base = getRecommendedLearningPlan(15);
    const config = { ...base, answerOptionsCount: count,
      limits: { enabled: true, directSubstitution: true, factorAndCancel: true, limitsAtInfinity: true, rationalization: true },
      fractionVisual: { ...base.fractionVisual, enabled: true },
      advancedEquations: { ...base.advancedEquations, enabled: true } };
    for (let i = 0; i < 100; i++) {
      for (const generate of [tryGenerateLimitQuestion, tryGenerateFractionVisualQuestion, tryGenerateAdvancedEquationQuestion]) {
        const question = generate(config)!;
        expectChoices(question.answerOptions, String(question.correctAnswer), count);
      }
    }
  });
});
