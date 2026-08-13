import { FRACTION_DENOMINATOR_POOL } from '@/constants/fractions';
import type { FractionDenominatorMode, MathOperation } from '@/features/learning-plan/learningPlan.types';
import { pickRandom, randomIntInclusive } from '@/utils/random';

export type Fraction = { numerator: number; denominator: number };

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function reduceFraction(f: Fraction): Fraction {
  if (f.denominator === 0) throw new Error('Zero denominator');
  const sign = f.denominator < 0 ? -1 : f.numerator < 0 ? -1 : 1;
  const num = Math.abs(f.numerator);
  const den = Math.abs(f.denominator);
  const g = gcd(num, den);
  return {
    numerator: sign * (num / g),
    denominator: den / g,
  };
}

export function fractionsEqual(a: Fraction, b: Fraction): boolean {
  const ra = reduceFraction(a);
  const rb = reduceFraction(b);
  return ra.numerator === rb.numerator && ra.denominator === rb.denominator;
}

export function formatFraction(f: Fraction): string {
  const r = reduceFraction(f);
  if (r.denominator === 1) return String(r.numerator);
  return `${r.numerator}/${r.denominator}`;
}

export function addFractions(a: Fraction, b: Fraction): Fraction {
  const num = a.numerator * b.denominator + b.numerator * a.denominator;
  const den = a.denominator * b.denominator;
  return reduceFraction({ numerator: num, denominator: den });
}

export function subtractFractions(a: Fraction, b: Fraction): Fraction {
  const num = a.numerator * b.denominator - b.numerator * a.denominator;
  const den = a.denominator * b.denominator;
  return reduceFraction({ numerator: num, denominator: den });
}

export function multiplyFractions(a: Fraction, b: Fraction): Fraction {
  return reduceFraction({
    numerator: a.numerator * b.numerator,
    denominator: a.denominator * b.denominator,
  });
}

export function divideFractions(a: Fraction, b: Fraction): Fraction {
  if (b.numerator === 0) throw new Error('Divide by zero fraction');
  return reduceFraction({
    numerator: a.numerator * b.denominator,
    denominator: a.denominator * b.numerator,
  });
}

function coinFlip(): boolean {
  return randomIntInclusive(0, 1) === 1;
}

function pickDenominator(): number {
  return pickRandom([...FRACTION_DENOMINATOR_POOL]);
}

function pickProperNumerator(denominator: number): number {
  if (denominator <= 1) return 1;
  return randomIntInclusive(1, denominator - 1);
}

function pickProperFraction(): Fraction {
  const denominator = pickDenominator();
  return reduceFraction({
    numerator: pickProperNumerator(denominator),
    denominator,
  });
}

function resolveDenominatorMode(mode: FractionDenominatorMode): 'same' | 'different' {
  if (mode === 'same_only') return 'same';
  if (mode === 'different_only') return 'different';
  return coinFlip() ? 'same' : 'different';
}

function pickOperandPair(
  mode: FractionDenominatorMode,
): [Fraction, Fraction, number | undefined] {
  const kind = resolveDenominatorMode(mode);
  if (kind === 'same') {
    const denominator = pickDenominator();
    let leftNum = pickProperNumerator(denominator);
    let rightNum = pickProperNumerator(denominator);
    if (leftNum === rightNum) {
      rightNum = Math.min(denominator - 1, leftNum + 1);
    }
    const left = reduceFraction({ numerator: leftNum, denominator });
    const right = reduceFraction({ numerator: rightNum, denominator });
    return [left, right, denominator];
  }

  let left = pickProperFraction();
  let right = pickProperFraction();
  for (let attempt = 0; attempt < 20; attempt++) {
    if (left.denominator !== right.denominator) return [left, right, undefined];
    right = pickProperFraction();
  }
  const altDen = FRACTION_DENOMINATOR_POOL.find((d) => d !== left.denominator) ?? 3;
  right = reduceFraction({
    numerator: pickProperNumerator(altDen),
    denominator: altDen,
  });
  return [left, right, undefined];
}

function pickDivisionPair(): [Fraction, Fraction] {
  const divisor = pickProperFraction();
  const quotient = pickProperFraction();
  const dividend = multiplyFractions(divisor, quotient);
  return [dividend, divisor];
}

function formatOperand(f: Fraction, commonDenominator?: number): string {
  if (commonDenominator !== undefined && f.denominator !== commonDenominator) {
    const num = (f.numerator * commonDenominator) / f.denominator;
    return `${num}/${commonDenominator}`;
  }
  return formatFraction(f);
}

function operatorSymbol(operation: MathOperation): string {
  switch (operation) {
    case 'addition':
      return '+';
    case 'subtraction':
      return '−';
    case 'multiplication':
      return '×';
    case 'division':
      return '÷';
    default:
      return '+';
  }
}

function computeResult(operation: MathOperation, left: Fraction, right: Fraction): Fraction {
  switch (operation) {
    case 'addition':
      return addFractions(left, right);
    case 'subtraction':
      return subtractFractions(left, right);
    case 'multiplication':
      return multiplyFractions(left, right);
    case 'division':
      return divideFractions(left, right);
    default:
      return addFractions(left, right);
  }
}

export type FractionQuestionDraft = {
  operation: MathOperation;
  questionText: string;
  correctFraction: Fraction;
  left: Fraction;
  right: Fraction;
};

function formatFractionInParens(f: Fraction): string {
  return `(${formatFraction(f)})`;
}

export function generateFractionSquareQuestion(): FractionQuestionDraft {
  const base = pickProperFraction();
  const result = multiplyFractions(base, base);
  return {
    operation: 'square',
    questionText: `${formatFractionInParens(base)}² = ?`,
    correctFraction: result,
    left: base,
    right: base,
  };
}

export function generateFractionSquareRootQuestion(): FractionQuestionDraft {
  const root = reduceFraction(pickProperFraction());
  const radicandText = `${root.numerator * root.numerator}/${root.denominator * root.denominator}`;
  return {
    operation: 'square_root',
    questionText: `√(${radicandText}) = ?`,
    correctFraction: root,
    left: multiplyFractions(root, root),
    right: root,
  };
}

export function generateFractionQuestion(
  operation: MathOperation,
  denominatorMode: FractionDenominatorMode,
): FractionQuestionDraft {
  if (operation === 'square') {
    return generateFractionSquareQuestion();
  }
  if (operation === 'square_root') {
    return generateFractionSquareRootQuestion();
  }

  if (operation === 'division') {
    let [left, right] = pickDivisionPair();
    let result = divideFractions(left, right);
    for (let attempt = 0; attempt < 30; attempt++) {
      if (result.numerator > 0) break;
      [left, right] = pickDivisionPair();
      result = divideFractions(left, right);
    }
    const op = operatorSymbol(operation);
    return {
      operation,
      questionText: `${formatOperand(left)} ${op} ${formatOperand(right)} = ?`,
      correctFraction: result,
      left,
      right,
    };
  }

  let [left, right, commonDen] = pickOperandPair(denominatorMode);

  if (operation === 'subtraction') {
    let result = subtractFractions(left, right);
    if (result.numerator <= 0) {
      const tmp = left;
      left = right;
      right = tmp;
      result = subtractFractions(left, right);
    }
    if (result.numerator <= 0) {
      left = reduceFraction({ numerator: 3, denominator: 4 });
      right = reduceFraction({ numerator: 1, denominator: 4 });
      commonDen = 4;
      result = subtractFractions(left, right);
    }
  }

  const result = computeResult(operation, left, right);
  const op = operatorSymbol(operation);
  return {
    operation,
    questionText: `${formatOperand(left, commonDen)} ${op} ${formatOperand(right, commonDen)} = ?`,
    correctFraction: result,
    left,
    right,
  };
}

export function buildFractionMcOptions(
  correct: Fraction,
  count: number,
): string[] {
  const correctLabel = formatFraction(correct);
  const options = new Set<string>([correctLabel]);
  const pool = [...FRACTION_DENOMINATOR_POOL];

  while (options.size < count) {
    const den = pickRandom(pool);
    const num = randomIntInclusive(1, Math.max(1, den - 1));
    const candidate = formatFraction(reduceFraction({ numerator: num, denominator: den }));
    if (candidate !== correctLabel) options.add(candidate);
  }

  if (options.size < count) {
    for (let delta = 1; options.size < count && delta < 6; delta++) {
      const wrong = reduceFraction({
        numerator: correct.numerator + delta,
        denominator: correct.denominator,
      });
      const label = formatFraction(wrong);
      if (label !== correctLabel) options.add(label);
      const wrong2 = reduceFraction({
        numerator: Math.max(1, correct.numerator - delta),
        denominator: correct.denominator,
      });
      const label2 = formatFraction(wrong2);
      if (label2 !== correctLabel) options.add(label2);
    }
  }

  const arr = [...options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomIntInclusive(0, i);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr.slice(0, count);
}
