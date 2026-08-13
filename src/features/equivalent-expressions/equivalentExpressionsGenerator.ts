import { getEnabledEquivalentExpressionSubtypes } from './equivalentExpressionsConfig.utils';
import type { EquivalentExpressionSubtype } from './equivalentExpressions.types';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import type { EquivalentExpressionMathQuestion } from '@/features/questions/question.types';
import { pickRandom, randomIntInclusive } from '@/utils/random';

type Draft = Omit<EquivalentExpressionMathQuestion, 'id'>;

function shuffled<T>(values: readonly T[]): T[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomIntInclusive(0, i);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function makeQuestion(
  subtype: EquivalentExpressionSubtype,
  questionText: string,
  correctAnswer: string,
  distractors: string[],
): Draft {
  return {
    kind: 'equivalent_expression',
    operation: 'equivalent_expressions',
    subtype,
    questionText,
    correctAnswer,
    answerOptions: shuffled([...new Set([correctAnswer, ...distractors])]),
    requiresMultipleChoice: true,
  };
}

function parenthesesQuestion(subtype: 'parentheses_after_addition' | 'parentheses_after_subtraction'): Draft {
  const a = randomIntInclusive(20, 100);
  const b = randomIntInclusive(2, 20);
  const c = randomIntInclusive(2, 20);
  const innerPlus = randomIntInclusive(0, 1) === 1;
  const outerPlus = subtype === 'parentheses_after_addition';
  const prompt = `${a} ${outerPlus ? '+' : '−'} (${b} ${innerPlus ? '+' : '−'} ${c})`;
  const correctSecondSign = outerPlus ? (innerPlus ? '+' : '−') : innerPlus ? '−' : '+';
  const correct = `${a} ${outerPlus ? '+' : '−'} ${b} ${correctSecondSign} ${c}`;
  return makeQuestion(subtype, `${prompt} =`, correct, [
    `${a} + ${b} + ${c}`,
    `${a} + ${b} − ${c}`,
    `${a} − ${b} + ${c}`,
    `${a} − ${b} − ${c}`,
  ]);
}

export function generateEquivalentExpressionQuestion(
  subtype: EquivalentExpressionSubtype,
): Draft {
  switch (subtype) {
    case 'square_of_sum':
      return makeQuestion(subtype, '(a + b)² =', 'a² + 2ab + b²', [
        'a² + b²', 'a² + ab + b²', 'a² − 2ab + b²', '(a + b)(a − b)',
      ]);
    case 'square_of_difference':
      return makeQuestion(subtype, '(a − b)² =', 'a² − 2ab + b²', [
        'a² − b²', 'a² + 2ab + b²', 'a² − 2ab − b²', '(a + b)(a − b)',
      ]);
    case 'parentheses_after_addition':
    case 'parentheses_after_subtraction':
      return parenthesesQuestion(subtype);
    case 'distributive_property': {
      const coefficient = randomIntInclusive(2, 9);
      const constant = randomIntInclusive(2, 9);
      return makeQuestion(subtype, `${coefficient}(x + ${constant}) =`, `${coefficient}x + ${coefficient * constant}`, [
        `${coefficient}x + ${constant}`,
        `${coefficient + 1}x + ${coefficient * constant}`,
        `${coefficient * constant}x`,
        `${coefficient}x − ${coefficient * constant}`,
      ]);
    }
    case 'difference_of_squares':
      return makeQuestion(subtype, 'a² − b² =', '(a + b)(a − b)', [
        '(a − b)²', '(a + b)²', '(a − b)(a − b)', 'a(a − b)',
      ]);
    case 'factorization': {
      const factor = randomIntInclusive(2, 9);
      const xCoefficient = randomIntInclusive(2, 9);
      const constant = randomIntInclusive(2, 9);
      return makeQuestion(
        subtype,
        `${factor * xCoefficient}x + ${factor * constant} =`,
        `${factor}(${xCoefficient}x + ${constant})`,
        [
          `${factor}(${xCoefficient}x + ${factor * constant})`,
          `${xCoefficient}(${factor}x + ${constant})`,
          `${factor}(${xCoefficient}x − ${constant})`,
          `${factor * xCoefficient}(x + ${constant})`,
        ],
      );
    }
  }
}

export function tryGenerateEquivalentExpressionQuestion(
  config: MathLearningConfig,
  forcedSubtype?: EquivalentExpressionSubtype,
): Draft | null {
  const enabled = getEnabledEquivalentExpressionSubtypes(config);
  const subtype = forcedSubtype ?? (enabled.length > 0 ? pickRandom(enabled) : undefined);
  if (!subtype || !enabled.includes(subtype)) return null;
  return generateEquivalentExpressionQuestion(subtype);
}
