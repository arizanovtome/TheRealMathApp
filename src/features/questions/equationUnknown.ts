import type {
  AnswerOptionsCount,
  MathLearningConfig,
  MathOperation,
} from '@/features/learning-plan/learningPlan.types';
import {
  getMultiplicationSecondFactorPool,
  sanitizeOneToTenList,
  effectiveFinalResultNumericCap,
} from '@/features/learning-plan/learningPlan.utils';
import {
  formatAddExpression,
  formatColonExpression,
  formatEquationAnswerExpression,
  formatInteger,
  formatMultiplyExpression,
  formatSubtractExpression,
  formatSubtractUnknownExpression,
} from '@/features/questions/mathExpressionFormat';
import { pickRandom, randomIntInclusive } from '@/utils/random';

function coinFlip(): boolean {
  return randomIntInclusive(0, 1) === 1;
}

function randomMaybeNegative(min: number, max: number, allowNegative: boolean): number {
  const magnitude = randomIntInclusive(min, max);
  return allowNegative && coinFlip() ? -magnitude : magnitude;
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomIntInclusive(0, i);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function shuffle<T>(arr: T[]): T[] {
  return shuffleInPlace([...arr]);
}

export function stripSpaces(s: string): string {
  return s.replace(/\s+/g, '');
}

/** Normalizes typed or chip text for comparison (spaces, ÷ / −). */
export function normalizeEquationAnswerInput(raw: string): string {
  return stripSpaces(raw)
    .replace(/\u2212/g, '-')
    .replace(/÷/g, ':')
    .replace(/\//g, ':')
    .toLowerCase();
}

export function parseRatioColon(a: number, b: number): number | null {
  if (b === 0) return null;
  if (a % b !== 0) return null;
  return Math.trunc(a / b);
}

/** Parses a single expression token (no leading `x=`). */
export function tryParseEquationExpressionValue(normalized: string): number | null {
  if (normalized === '' || normalized === '-' || normalized === '+') return null;
  if (/^-?\d+$/.test(normalized)) {
    const n = Number(normalized);
    return Number.isSafeInteger(n) ? n : null;
  }
  const ratio = /^(-?\d+):(-?\d+)$/.exec(normalized);
  if (ratio) {
    return parseRatioColon(Number(ratio[1]), Number(ratio[2]));
  }
  const minus = /^(-?\d+)-(-?\d+)$/.exec(normalized);
  if (minus) {
    const a = Number(minus[1]);
    const b = Number(minus[2]);
    const v = a - b;
    return Number.isSafeInteger(v) ? v : null;
  }
  const plus = /^(-?\d+)\+(-?\d+)$/.exec(normalized);
  if (plus) {
    const a = Number(plus[1]);
    const b = Number(plus[2]);
    const v = a + b;
    return Number.isSafeInteger(v) ? v : null;
  }
  return null;
}

export function equationAnswerMatches(
  correctAnswer: number,
  correctExpression: string,
  rawInput: string,
): boolean {
  const norm = normalizeEquationAnswerInput(rawInput);
  if (norm === '') return false;
  if (normalizeEquationAnswerInput(correctExpression) === norm) return true;
  const v = tryParseEquationExpressionValue(norm);
  return v !== null && v === correctAnswer;
}

export function equationMcOptionMatches(correctExpression: string, chosen: string): boolean {
  return normalizeEquationAnswerInput(chosen) === normalizeEquationAnswerInput(correctExpression);
}

export type EquationMcContext =
  | { op: 'division'; dividend: number; rhsQuotient: number }
  | { op: 'multiplication'; product: number; leftFactor: number }
  | { op: 'addition'; sum: number; addend: number }
  | { op: 'subtraction'; variant: 'x_minus_c'; s: number; c: number }
  | { op: 'subtraction'; variant: 'c_minus_x'; c: number; s: number };

export type EquationUnknownBase = {
  kind: 'equation_unknown';
  operation: MathOperation;
  questionText: string;
  correctAnswer: number;
  correctExpression: string;
  fallbackWrongExpression: string;
  mcContext: EquationMcContext;
};

/**
 * Wrong choices for +/− equations: only the two numbers from the prompt, using + and −
 * in every order (e.g. 100−44, 44−100, 100+44) — never other literals, never × or ÷.
 */
function addWrongTwoNumberAddSub(
  a: number,
  b: number,
  correctExpression: string,
  correctAnswer: number,
  add: (expr: string) => void,
): void {
  const candidates = [`${a}+${b}`, `${b}+${a}`, `${a}-${b}`, `${b}-${a}`];
  for (const e of shuffle(candidates)) {
    add(e);
  }
}

/**
 * Wrong choices for ×/÷ equations: only the two numbers from the prompt and ":" — never +/−.
 * Uses `high:low` swap of the same pair as in the correct `high:low` form when it yields a different integer.
 */
function addWrongTwoNumberRatio(
  numerator: number,
  denominator: number,
  correctExpression: string,
  correctAnswer: number,
  add: (expr: string) => void,
): void {
  add(`${numerator}:${denominator}`);
  add(`${denominator}:${numerator}`);
}

function addNearMissIntegerWrongs(correctAnswer: number, add: (expr: string) => void): void {
  for (const d of [1, -1, 2, -2, 5, -5, 10, -10]) {
    add(String(correctAnswer + d));
  }
}

function fillWrongExpressionPool(
  wrong: Set<string>,
  needed: number,
  correctExpression: string,
  correctAnswer: number,
  add: (expr: string) => void,
  primaryNumbers: [number, number],
): void {
  const [a, b] = primaryNumbers;

  for (const d of [1, -1]) {
    if (wrong.size >= needed) return;
    add(`${a + d}+${b}`);
    add(`${a}+${b + d}`);
    add(`${a + d}-${b}`);
    add(`${a}-${b + d}`);
  }

  if (wrong.size >= needed) return;

  addWrongTwoNumberRatio(a, b, correctExpression, correctAnswer, add);

  if (wrong.size >= needed) return;

  addNearMissIntegerWrongs(correctAnswer, add);
}

function buildWrongExpressions(
  op: MathOperation,
  correctExpression: string,
  correctAnswer: number,
  needed: number,
  ctx: EquationMcContext,
): string[] {
  const wrong = new Set<string>();
  const add = (expr: string) => {
    if (normalizeEquationAnswerInput(expr) === normalizeEquationAnswerInput(correctExpression)) return;
    const v = tryParseEquationExpressionValue(normalizeEquationAnswerInput(expr));
    if (v === null || v === correctAnswer) return;
    wrong.add(normalizeEquationAnswerInput(expr));
  };

  switch (op) {
    case 'division': {
      const { dividend, rhsQuotient } = ctx as Extract<EquationMcContext, { op: 'division' }>;
      addWrongTwoNumberRatio(dividend, rhsQuotient, correctExpression, correctAnswer, add);
      break;
    }
    case 'multiplication': {
      const { product, leftFactor } = ctx as Extract<EquationMcContext, { op: 'multiplication' }>;
      addWrongTwoNumberRatio(product, leftFactor, correctExpression, correctAnswer, add);
      break;
    }
    case 'addition': {
      const { sum, addend } = ctx as Extract<EquationMcContext, { op: 'addition' }>;
      addWrongTwoNumberAddSub(sum, addend, correctExpression, correctAnswer, add);
      break;
    }
    case 'subtraction': {
      const sub = ctx as Extract<EquationMcContext, { op: 'subtraction' }>;
      if (sub.variant === 'x_minus_c') {
        const { s, c } = sub;
        addWrongTwoNumberAddSub(s, c, correctExpression, correctAnswer, add);
      } else {
        const { c, s } = sub;
        addWrongTwoNumberAddSub(c, s, correctExpression, correctAnswer, add);
      }
      break;
    }
    default:
      break;
  }

  const primaryNumbers: [number, number] | null = (() => {
    switch (ctx.op) {
      case 'division': {
        const { dividend, rhsQuotient } = ctx;
        return [dividend, rhsQuotient];
      }
      case 'multiplication': {
        const { product, leftFactor } = ctx;
        return [product, leftFactor];
      }
      case 'addition': {
        const { sum, addend } = ctx;
        return [sum, addend];
      }
      case 'subtraction':
        return ctx.variant === 'x_minus_c' ? [ctx.s, ctx.c] : [ctx.c, ctx.s];
      default:
        return null;
    }
  })();

  if (primaryNumbers) {
    fillWrongExpressionPool(wrong, needed, correctExpression, correctAnswer, add, primaryNumbers);
  } else {
    addNearMissIntegerWrongs(correctAnswer, add);
  }

  return shuffle([...wrong]).slice(0, needed);
}

export function buildEquationMcOptions(
  op: MathOperation,
  correctExpression: string,
  correctAnswer: number,
  optionCount: AnswerOptionsCount,
  ctx: EquationMcContext,
): string[] {
  const wrongNeeded = optionCount - 1;
  const wrong = buildWrongExpressions(op, correctExpression, correctAnswer, wrongNeeded, ctx);
  const merged = shuffle(
    [correctExpression, ...wrong]
      .map(normalizeEquationAnswerInput)
      .map(formatEquationAnswerExpression),
  );
  return merged.slice(0, Math.min(optionCount, merged.length));
}

function generateDivisionEquation(config: MathLearningConfig): EquationUnknownBase | null {
  const { answerMin, answerMax, divisors, allowNegativeNumbers } = config.division;
  const cap = effectiveFinalResultNumericCap(config, 'division');
  for (let t = 0; t < 240; t++) {
    const x = randomMaybeNegative(answerMin, answerMax, allowNegativeNumbers);
    if (Math.abs(x) > cap) continue;
    const rhsMagnitude = pickRandom(sanitizeOneToTenList(divisors));
    const rhsQuotient = randomMaybeNegative(rhsMagnitude, rhsMagnitude, allowNegativeNumbers);
    const dividend = x * rhsQuotient;
    const correctExpression = formatColonExpression(dividend, rhsQuotient);
    const mcContext: EquationMcContext = { op: 'division', dividend, rhsQuotient };
    const wrongPool = buildWrongExpressions('division', correctExpression, x, 5, mcContext);
    if (wrongPool.length === 0) continue;
    return {
      kind: 'equation_unknown',
      operation: 'division',
      questionText: `${formatInteger(dividend)} : x = ${formatInteger(rhsQuotient)}`,
      correctAnswer: x,
      correctExpression,
      fallbackWrongExpression: wrongPool[0]!,
      mcContext,
    };
  }
  return null;
}

function generateMultiplicationEquation(config: MathLearningConfig): EquationUnknownBase | null {
  const { factors, secondFactorSource, allowNegativeNumbers } = config.multiplication;
  const fac = sanitizeOneToTenList(factors);
  if (fac.length === 0) return null;
  const secondPool = getMultiplicationSecondFactorPool(fac, secondFactorSource);
  const cap = effectiveFinalResultNumericCap(config, 'multiplication');
  for (let t = 0; t < 280; t++) {
    const factorAMagnitude = pickRandom(fac);
    const factorBMagnitude = pickRandom(secondPool);
    const factorA = randomMaybeNegative(factorAMagnitude, factorAMagnitude, allowNegativeNumbers);
    const factorB = randomMaybeNegative(factorBMagnitude, factorBMagnitude, allowNegativeNumbers);
    let left = factorA;
    let right = factorB;
    if (config.multiplication.randomizeFactorOrder && coinFlip()) {
      left = factorB;
      right = factorA;
    }
    const product = left * right;
    if (Math.abs(product) > cap) continue;
    const x = right;
    const correctExpression = formatColonExpression(product, left);
    const mcContext: EquationMcContext = { op: 'multiplication', product, leftFactor: left };
    const wrongPool = buildWrongExpressions('multiplication', correctExpression, x, 5, mcContext);
    if (wrongPool.length === 0) continue;
    return {
      kind: 'equation_unknown',
      operation: 'multiplication',
      questionText: `${formatMultiplyExpression(left, "x")} = ${formatInteger(product)}`,
      correctAnswer: x,
      correctExpression,
      fallbackWrongExpression: wrongPool[0]!,
      mcContext,
    };
  }
  return null;
}

function generateAdditionEquation(config: MathLearningConfig): EquationUnknownBase | null {
  const { leftMin, leftMax, rightMin, rightMax, allowNegativeNumbers } = config.addition;
  const cap = effectiveFinalResultNumericCap(config, 'addition');
  for (let t = 0; t < 220; t++) {
    const c = randomMaybeNegative(rightMin, rightMax, allowNegativeNumbers);
    const x = randomMaybeNegative(leftMin, leftMax, allowNegativeNumbers);
    const s = x + c;
    if (Math.abs(s) > cap || Math.abs(x) > cap) continue;
    const correctExpression = formatSubtractExpression(s, c);
    const mcContext: EquationMcContext = { op: 'addition', sum: s, addend: c };
    const wrongPool = buildWrongExpressions('addition', correctExpression, x, 5, mcContext);
    if (wrongPool.length === 0) continue;
    return {
      kind: 'equation_unknown',
      operation: 'addition',
      questionText: `${formatAddExpression("x", c)} = ${formatInteger(s)}`,
      correctAnswer: x,
      correctExpression,
      fallbackWrongExpression: wrongPool[0]!,
      mcContext,
    };
  }
  return null;
}

function generateSubtractionEquation(config: MathLearningConfig): EquationUnknownBase | null {
  const {
    firstMin,
    firstMax,
    secondMin,
    secondMax,
    allowNegativeAnswers,
    allowNegativeNumbers,
  } = config.subtraction;
  const cap = effectiveFinalResultNumericCap(config, 'subtraction');
  for (let t = 0; t < 300; t++) {
    if (coinFlip()) {
      const c = randomMaybeNegative(secondMin, secondMax, allowNegativeNumbers);
      const s = randomMaybeNegative(firstMin, firstMax, allowNegativeNumbers);
      const x = s + c;
      if (Math.abs(x) > cap) continue;
      if (!allowNegativeNumbers && !allowNegativeAnswers && s < 0) continue;
      const correctExpression = formatAddExpression(s, c);
      const mcContext: EquationMcContext = { op: 'subtraction', variant: 'x_minus_c', s, c };
      const wrongPool = buildWrongExpressions('subtraction', correctExpression, x, 5, mcContext);
      if (wrongPool.length === 0) continue;
      return {
        kind: 'equation_unknown',
        operation: 'subtraction',
        questionText: `${formatSubtractExpression("x", c)} = ${formatInteger(s)}`,
        correctAnswer: x,
        correctExpression,
        fallbackWrongExpression: wrongPool[0]!,
        mcContext,
      };
    }
    const c = randomMaybeNegative(firstMin, firstMax, allowNegativeNumbers);
    const s = randomMaybeNegative(secondMin, secondMax, allowNegativeNumbers);
    const x = c - s;
    if (!Number.isSafeInteger(x)) continue;
    if (!allowNegativeNumbers && !allowNegativeAnswers && x < 0) continue;
    if (x > cap || Math.abs(x) > cap) continue;
    const correctExpression = formatSubtractExpression(c, s);
    const mcContext: EquationMcContext = { op: 'subtraction', variant: 'c_minus_x', c, s };
    const wrongPool = buildWrongExpressions('subtraction', correctExpression, x, 5, mcContext);
    if (wrongPool.length === 0) continue;
    return {
      kind: 'equation_unknown',
      operation: 'subtraction',
      questionText: `${formatSubtractUnknownExpression(c)} = ${formatInteger(s)}`,
      correctAnswer: x,
      correctExpression,
      fallbackWrongExpression: wrongPool[0]!,
      mcContext,
    };
  }
  return null;
}

export function generateEquationUnknownQuestion(
  config: MathLearningConfig,
  op: MathOperation,
): EquationUnknownBase | null {
  switch (op) {
    case 'division':
      return generateDivisionEquation(config);
    case 'multiplication':
      return generateMultiplicationEquation(config);
    case 'addition':
      return generateAdditionEquation(config);
    case 'subtraction':
      return generateSubtractionEquation(config);
    case 'square':
    case 'square_root':
    case 'rounding':
    case 'order_of_operations':
    case 'equivalent_expressions':
    case 'geometry':
    case 'comparison':
    case 'fraction_visual':
    case 'shape_recognition':
    case 'number_sense':
    case 'clock':
    case 'pattern':
    case 'differentiation':
    case 'integration':
    case 'trigonometry':
      return null;
    default: {
      const _exhaustive: never = op;
      return _exhaustive;
    }
  }
}
