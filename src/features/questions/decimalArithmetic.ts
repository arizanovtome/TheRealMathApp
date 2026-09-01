import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import {
  formatAddExpression,
  formatDivideExpression,
  formatMultiplyExpression,
  formatNumber,
  formatSubtractExpression,
} from '@/features/questions/mathExpressionFormat';
import { pickRandom, randomIntInclusive } from '@/utils/random';

export const DECIMAL_PLACES = 1;
export const DECIMAL_SCALE = 10;

function coinFlip(): boolean {
  return randomIntInclusive(0, 1) === 1;
}

export function roundDecimal(n: number): number {
  return Math.round(n * DECIMAL_SCALE) / DECIMAL_SCALE;
}

/** Exact product of operands that each have at most one decimal place. */
export function multiplyDecimalOperands(left: number, right: number): number {
  const leftTenths = Math.round(left * DECIMAL_SCALE);
  const rightTenths = Math.round(right * DECIMAL_SCALE);
  return (leftTenths * rightTenths) / (DECIMAL_SCALE * DECIMAL_SCALE);
}

export function isDecimalValue(n: number): boolean {
  return !Number.isInteger(n);
}

/** Pick a decimal in [min, max] with one decimal place. */
export function randomDecimalInRange(
  min: number,
  max: number,
  allowNegative: boolean,
): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const whole = randomIntInclusive(lo, hi);
  const tenth = randomIntInclusive(0, 9);
  let value = roundDecimal(whole + tenth / DECIMAL_SCALE);
  if (value === 0 && tenth === 0) value = roundDecimal(randomIntInclusive(1, Math.max(1, hi)));
  if (allowNegative && coinFlip()) value = -value;
  return value;
}

export function randomMaybeDecimal(
  min: number,
  max: number,
  allowNegative: boolean,
  allowDecimals: boolean,
): number {
  if (!allowDecimals) {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const magnitude = randomIntInclusive(lo, hi);
    return allowNegative && coinFlip() ? -magnitude : magnitude;
  }
  return randomDecimalInRange(min, max, allowNegative);
}

export type DecimalStandardDraft = {
  kind: 'arithmetic';
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
  questionText: string;
  correctAnswer: number;
  operandSnapshot: Record<string, number>;
};

export function generateDecimalAddition(config: MathLearningConfig): DecimalStandardDraft {
  const { leftMin, leftMax, rightMin, rightMax, allowNegativeNumbers } = config.addition;
  const left = randomMaybeDecimal(leftMin, leftMax, allowNegativeNumbers, true);
  const right = randomMaybeDecimal(rightMin, rightMax, allowNegativeNumbers, true);
  const result = roundDecimal(left + right);
  return {
    kind: 'arithmetic',
    operation: 'addition',
    questionText: `${formatAddExpression(left, right)} = ?`,
    correctAnswer: result,
    operandSnapshot: { left, right, result },
  };
}

export function generateDecimalSubtraction(config: MathLearningConfig): DecimalStandardDraft {
  const {
    firstMin,
    firstMax,
    secondMin,
    secondMax,
    allowNegativeAnswers,
    allowNegativeNumbers,
  } = config.subtraction;
  let first = randomMaybeDecimal(firstMin, firstMax, allowNegativeNumbers, true);
  let second = randomMaybeDecimal(secondMin, secondMax, allowNegativeNumbers, true);
  if (!allowNegativeNumbers && !allowNegativeAnswers && second > first) {
    const tmp = first;
    first = second;
    second = tmp;
  }
  const result = roundDecimal(first - second);
  return {
    kind: 'arithmetic',
    operation: 'subtraction',
    questionText: `${formatSubtractExpression(first, second)} = ?`,
    correctAnswer: result,
    operandSnapshot: { first, second, result },
  };
}

export function generateDecimalMultiplication(config: MathLearningConfig): DecimalStandardDraft {
  const { factors, randomizeFactorOrder, allowNegativeNumbers } = config.multiplication;
  const selectedMagnitude = pickRandom(factors);
  const firstWhole = randomMaybeDecimal(
    selectedMagnitude,
    selectedMagnitude,
    allowNegativeNumbers,
    coinFlip(),
  );
  const secondPool = config.multiplication.factors.length > 0 ? factors : [2, 3, 4, 5];
  const secondMag = pickRandom(secondPool);
  const secondWhole = randomMaybeDecimal(secondMag, secondMag, allowNegativeNumbers, true);
  let left = firstWhole;
  let right = secondWhole;
  if (randomizeFactorOrder && coinFlip()) {
    left = secondWhole;
    right = firstWhole;
  }
  const result = multiplyDecimalOperands(left, right);
  return {
    kind: 'arithmetic',
    operation: 'multiplication',
    questionText: `${formatMultiplyExpression(left, right)} = ?`,
    correctAnswer: result,
    operandSnapshot: { left, right, result },
  };
}

export function generateDecimalDivision(config: MathLearningConfig): DecimalStandardDraft {
  const { answerMin, answerMax, divisors, allowNegativeNumbers } = config.division;
  const divisorMag = pickRandom(divisors);
  const divisor = randomMaybeDecimal(divisorMag, divisorMag, allowNegativeNumbers, false);
  const absDivisor = Math.abs(divisor) || 1;
  for (let attempt = 0; attempt < 80; attempt++) {
    const quotientWhole = randomIntInclusive(Math.max(1, answerMin), Math.max(1, answerMax));
    const quotientTenth = randomIntInclusive(0, 9);
    let quotient = roundDecimal(quotientWhole + quotientTenth / DECIMAL_SCALE);
    if (allowNegativeNumbers && coinFlip()) quotient = -quotient;
    const dividend = roundDecimal(absDivisor * quotient);
    if (Math.abs(dividend) < 0.05) continue;
    const signedDivisor = divisor;
    const signedDividend = signedDivisor < 0 ? -Math.abs(dividend) : dividend;
    return {
      kind: 'arithmetic',
      operation: 'division',
      questionText: `${formatDivideExpression(signedDividend, signedDivisor)} = ?`,
      correctAnswer: quotient,
      operandSnapshot: { dividend: signedDividend, divisor: signedDivisor, quotient },
    };
  }
  const quotient = roundDecimal(randomIntInclusive(Math.max(1, answerMin), Math.max(1, answerMax)));
  const dividend = roundDecimal(absDivisor * quotient);
  return {
    kind: 'arithmetic',
    operation: 'division',
    questionText: `${formatDivideExpression(dividend, divisor)} = ?`,
    correctAnswer: quotient,
    operandSnapshot: { dividend, divisor, quotient },
  };
}

export function formatDecimalAnswer(n: number): string {
  return formatNumber(n);
}
