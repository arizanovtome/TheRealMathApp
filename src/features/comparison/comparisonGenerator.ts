import type { AnswerOptionsCount } from '@/features/learning-plan/learningPlan.types';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import {
  getComparisonNumberBounds,
  getEnabledComparisonSubtypes,
  getExpressionCompareOperations,
} from '@/features/comparison/comparisonConfig.utils';
import type { ComparisonSubtype, ComparisonSymbol } from '@/features/comparison/comparison.types';
import {
  buildFractionVsDecimalPair,
  buildFractionVsFractionPair,
  buildMeasurementComparePair,
  buildPercentVsFractionPair,
  compareValues,
} from '@/features/comparison/comparisonValue.utils';
import {
  formatAddExpression,
  formatDivideExpression,
  formatMultiplyExpression,
  formatSubtractExpression,
} from '@/features/questions/mathExpressionFormat';
import type { ComparisonMathQuestion } from '@/features/questions/question.types';
import { pickRandom, randomIntInclusive } from '@/utils/random';

const SYMBOLS: ComparisonSymbol[] = ['<', '>', '='];

function buildSymbolMcOptions(correct: ComparisonSymbol): ComparisonSymbol[] {
  return [...SYMBOLS].sort(() => (Math.random() > 0.5 ? 1 : -1));
}

function randomInBounds(min: number, max: number): number {
  return randomIntInclusive(min, max);
}

function pickDistinctValues(count: number, min: number, max: number): number[] {
  const values = new Set<number>();
  for (let attempt = 0; attempt < 200 && values.size < count; attempt++) {
    values.add(randomInBounds(min, max));
  }
  while (values.size < count) {
    values.add(randomInBounds(min, max));
  }
  return [...values];
}

function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) {
      result.push([arr[i]!, ...p]);
    }
  }
  return result;
}

function formatOrderingAnswer(values: number[]): string {
  return values.join(', ');
}

function buildOrderingMcOptions(
  sorted: number[],
  ascending: boolean,
  count: AnswerOptionsCount,
): string[] {
  const correct = formatOrderingAnswer(ascending ? sorted : [...sorted].reverse());
  const allPerms = permutations(sorted);
  const unique = new Set<string>();
  unique.add(correct);
  for (const p of allPerms) {
    unique.add(formatOrderingAnswer(p));
  }
  const pool = [...unique].filter((s) => s !== correct);
  const options = [correct];
  while (options.length < count && pool.length > 0) {
    const idx = randomIntInclusive(0, pool.length - 1);
    options.push(pool.splice(idx, 1)[0]!);
  }
  while (options.length < count) {
    const shuffled = [...sorted].sort(() => (Math.random() > 0.5 ? 1 : -1));
    const label = formatOrderingAnswer(shuffled);
    if (!options.includes(label)) options.push(label);
  }
  return options.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

type ExprSide = { text: string; value: number };

function buildExpressionSide(
  config: MathLearningConfig,
  op: 'addition' | 'subtraction' | 'multiplication' | 'division',
): ExprSide {
  const { min, max } = getComparisonNumberBounds(config);
  switch (op) {
    case 'addition': {
      const a = randomInBounds(min, max);
      const b = randomInBounds(min, max);
      return { text: formatAddExpression(a, b), value: a + b };
    }
    case 'subtraction': {
      let a = randomInBounds(min, max);
      let b = randomInBounds(min, max);
      if (b > a) [a, b] = [b, a];
      return { text: formatSubtractExpression(a, b), value: a - b };
    }
    case 'multiplication': {
      const a = randomInBounds(Math.max(1, min), Math.min(max, 12));
      const b = randomInBounds(Math.max(1, min), Math.min(max, 12));
      return { text: formatMultiplyExpression(a, b), value: a * b };
    }
    case 'division': {
      const divisor = randomInBounds(Math.max(1, min), Math.min(max, 12));
      const quotient = randomInBounds(Math.max(1, min), Math.min(max, 12));
      const dividend = divisor * quotient;
      return { text: formatDivideExpression(dividend, divisor), value: quotient };
    }
  }
}

function buildSymbolComparisonQuestion(
  subtype: ComparisonSubtype,
  questionText: string,
  correct: ComparisonSymbol,
): Omit<ComparisonMathQuestion, 'id'> {
  return {
    kind: 'comparison',
    operation: 'comparison',
    subtype,
    questionText,
    correctAnswer: correct,
    answerOptions: buildSymbolMcOptions(correct),
    requiresMultipleChoice: true,
  };
}

function generateRelational(config: MathLearningConfig): Omit<ComparisonMathQuestion, 'id'> {
  const { min, max } = getComparisonNumberBounds(config);
  const left = randomInBounds(min, max);
  const right = randomInBounds(min, max);
  const correct = compareValues(left, right);
  return buildSymbolComparisonQuestion('relational', `${left} __ ${right}`, correct);
}

function generateExpression(config: MathLearningConfig): Omit<ComparisonMathQuestion, 'id'> | null {
  const ops = getExpressionCompareOperations(config);
  if (ops.length === 0) return null;

  const leftOp = pickRandom(ops);
  let rightOp = pickRandom(ops);
  if (ops.length > 1 && Math.random() > 0.5) {
    rightOp = pickRandom(ops.filter((o) => o !== leftOp)) ?? rightOp;
  }

  const left = buildExpressionSide(config, leftOp);
  const right = buildExpressionSide(config, rightOp);
  const correct = compareValues(left.value, right.value);
  return buildSymbolComparisonQuestion(
    'expression',
    `${left.text} __ ${right.text}`,
    correct,
  );
}

function generateOrdering(config: MathLearningConfig): Omit<ComparisonMathQuestion, 'id'> {
  const { min, max } = getComparisonNumberBounds(config);
  const valueCount = randomIntInclusive(3, 4);
  const values = pickDistinctValues(valueCount, min, max);
  const sorted = [...values].sort((a, b) => a - b);
  const ascending = Math.random() > 0.5;
  const correct = formatOrderingAnswer(ascending ? sorted : [...sorted].reverse());
  const prompt = ascending
    ? `Order from smallest to largest: ${values.join(', ')}`
    : `Order from largest to smallest: ${values.join(', ')}`;
  return {
    kind: 'comparison',
    operation: 'comparison',
    subtype: 'ordering',
    questionText: prompt,
    correctAnswer: correct,
    answerOptions: buildOrderingMcOptions(sorted, ascending, config.answerOptionsCount),
    requiresMultipleChoice: true,
  };
}

function generateFractionVsDecimal(): Omit<ComparisonMathQuestion, 'id'> {
  const pair = buildFractionVsDecimalPair();
  return buildSymbolComparisonQuestion(
    'fraction_vs_decimal',
    `${pair.left} __ ${pair.right}`,
    pair.correct,
  );
}

function generatePercentVsFraction(): Omit<ComparisonMathQuestion, 'id'> {
  const pair = buildPercentVsFractionPair();
  return buildSymbolComparisonQuestion(
    'percent_vs_fraction',
    `${pair.left} __ ${pair.right}`,
    pair.correct,
  );
}

function generateFractionVsFraction(): Omit<ComparisonMathQuestion, 'id'> {
  const pair = buildFractionVsFractionPair();
  return buildSymbolComparisonQuestion(
    'fraction_vs_fraction',
    `${pair.left} __ ${pair.right}`,
    pair.correct,
  );
}

function generateMeasurement(): Omit<ComparisonMathQuestion, 'id'> {
  const pair = buildMeasurementComparePair();
  return buildSymbolComparisonQuestion(
    'measurement',
    `${pair.left} __ ${pair.right}`,
    pair.correct,
  );
}

function generateForSubtype(
  config: MathLearningConfig,
  subtype: ComparisonSubtype,
): Omit<ComparisonMathQuestion, 'id'> | null {
  switch (subtype) {
    case 'relational':
      return generateRelational(config);
    case 'expression':
      return generateExpression(config);
    case 'ordering':
      return generateOrdering(config);
    case 'fraction_vs_decimal':
      return generateFractionVsDecimal();
    case 'percent_vs_fraction':
      return generatePercentVsFraction();
    case 'fraction_vs_fraction':
      return generateFractionVsFraction();
    case 'measurement':
      return generateMeasurement();
    default:
      return null;
  }
}

export function tryGenerateComparisonQuestion(
  config: MathLearningConfig,
  subtype?: ComparisonSubtype,
): Omit<ComparisonMathQuestion, 'id'> | null {
  const subtypes = subtype ? [subtype] : getEnabledComparisonSubtypes(config);
  if (subtypes.length === 0) return null;

  for (let attempt = 0; attempt < 40; attempt++) {
    const pick = subtype ?? pickRandom(subtypes);
    const q = generateForSubtype(config, pick);
    if (q) return q;
  }

  for (const fallback of subtypes) {
    const q = generateForSubtype(config, fallback);
    if (q) return q;
  }
  return null;
}
