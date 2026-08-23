import { getEnabledEquivalentExpressionSubtypes } from './equivalentExpressionsConfig.utils';
import type { EquivalentExpressionSubtype } from './equivalentExpressions.types';
import type { AnswerOptionsCount, MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { gcd } from '@/features/questions/fractions';
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

function buildExpressionMcOptions(
  correctAnswer: string,
  distractors: string[],
  optionCount: AnswerOptionsCount,
): string[] {
  const pool = [...new Set(distractors.filter((d) => d !== correctAnswer))];
  const options = [correctAnswer];
  const shuffledPool = shuffled(pool);
  while (options.length < optionCount && shuffledPool.length > 0) {
    options.push(shuffledPool.pop()!);
  }
  return shuffled(options);
}

/** Fully factored form using the GCF, e.g. 72x + 72 → 72(x + 1). */
function formatFactored(g: number, coeffX: number, constTerm: number): string {
  const inner = coeffX === 1 ? `x + ${constTerm}` : `${coeffX}x + ${constTerm}`;
  return `${g}(${inner})`;
}

function makeQuestion(
  subtype: EquivalentExpressionSubtype,
  questionText: string,
  correctAnswer: string,
  distractors: string[],
  optionCount: AnswerOptionsCount,
): Draft {
  return {
    kind: 'equivalent_expression',
    operation: 'equivalent_expressions',
    subtype,
    questionText,
    correctAnswer,
    answerOptions: buildExpressionMcOptions(correctAnswer, distractors, optionCount),
    requiresMultipleChoice: true,
  };
}

function parenthesesQuestion(
  subtype: 'parentheses_after_addition' | 'parentheses_after_subtraction',
  optionCount: AnswerOptionsCount,
): Draft {
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
  ], optionCount);
}

export function generateEquivalentExpressionQuestion(
  subtype: EquivalentExpressionSubtype,
  optionCount: AnswerOptionsCount = 4,
): Draft {
  switch (subtype) {
    case 'square_of_sum':
      return makeQuestion(subtype, '(a + b)² =', 'a² + 2ab + b²', [
        'a² + b²', 'a² + ab + b²', 'a² − 2ab + b²', '(a + b)(a − b)',
      ], optionCount);
    case 'square_of_difference':
      return makeQuestion(subtype, '(a − b)² =', 'a² − 2ab + b²', [
        'a² − b²', 'a² + 2ab + b²', 'a² − 2ab − b²', '(a + b)(a − b)',
      ], optionCount);
    case 'parentheses_after_addition':
    case 'parentheses_after_subtraction':
      return parenthesesQuestion(subtype, optionCount);
    case 'distributive_property': {
      const coefficient = randomIntInclusive(2, 9);
      const constant = randomIntInclusive(2, 9);
      return makeQuestion(subtype, `${coefficient}(x + ${constant}) =`, `${coefficient}x + ${coefficient * constant}`, [
        `${coefficient}x + ${constant}`,
        `${coefficient + 1}x + ${coefficient * constant}`,
        `${coefficient * constant}x`,
        `${coefficient}x − ${coefficient * constant}`,
      ], optionCount);
    }
    case 'difference_of_squares':
      return makeQuestion(subtype, 'a² − b² =', '(a + b)(a − b)', [
        '(a − b)²', '(a + b)²', '(a − b)(a − b)', 'a(a − b)',
      ], optionCount);
    case 'factorization': {
      const k = randomIntInclusive(2, 9);
      const m = randomIntInclusive(1, 9);
      const n = randomIntInclusive(2, 9);
      const expandedCoeff = k * m;
      const expandedConst = k * n;
      const g = gcd(expandedCoeff, expandedConst);
      const cx = expandedCoeff / g;
      const c0 = expandedConst / g;
      const correctAnswer = formatFactored(g, cx, c0);
      const distractors = [
        formatFactored(g, cx, c0 + 1),
        c0 > 1 ? formatFactored(g, cx, c0 - 1) : formatFactored(g, cx, c0 + 2),
        g > k ? formatFactored(k, m, n) : formatFactored(k, m, n + 1),
        `${k}(${m}x − ${n})`,
        `${m}(${k}x + ${n})`,
        `${expandedCoeff}(x + ${n})`,
      ].filter((d) => d !== correctAnswer);
      return makeQuestion(
        subtype,
        `${expandedCoeff}x + ${expandedConst} =`,
        correctAnswer,
        distractors,
        optionCount,
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
  return generateEquivalentExpressionQuestion(subtype, config.answerOptionsCount);
}
