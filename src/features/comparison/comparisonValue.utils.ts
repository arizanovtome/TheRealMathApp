import type { ComparisonSymbol } from '@/features/comparison/comparison.types';
import { FRACTION_DENOMINATOR_POOL } from '@/constants/fractions';
import {
  formatFraction,
  reduceFraction,
  type Fraction,
} from '@/features/questions/fractions';
import { pickRandom, randomIntInclusive } from '@/utils/random';

export function compareValues(a: number, b: number): ComparisonSymbol {
  if (a < b) return '<';
  if (a > b) return '>';
  return '=';
}

export function fractionToDecimalValue(f: Fraction): number {
  return f.numerator / f.denominator;
}

export function formatDecimalValue(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, '');
}

function pickProperFraction(): Fraction {
  const denominator = pickRandom([...FRACTION_DENOMINATOR_POOL]);
  const numerator = randomIntInclusive(1, denominator - 1);
  return reduceFraction({ numerator, denominator });
}

function pickUnequalDecimal(f: Fraction): string {
  const exact = fractionToDecimalValue(f);
  const offsets = [0.1, 0.25, -0.1, -0.25, 0.5, -0.5];
  for (const off of offsets) {
    const candidate = exact + off;
    if (candidate > 0 && Math.abs(candidate - exact) > 0.001) {
      return formatDecimalValue(candidate);
    }
  }
  return formatDecimalValue(exact + 0.1);
}

export function buildFractionVsDecimalPair(): {
  left: string;
  right: string;
  correct: ComparisonSymbol;
} {
  const fraction = pickProperFraction();
  const left = formatFraction(fraction);
  const equal = Math.random() > 0.35;
  const right = equal
    ? formatDecimalValue(fractionToDecimalValue(fraction))
    : pickUnequalDecimal(fraction);
  const leftVal = fractionToDecimalValue(fraction);
  const rightVal = Number(right);
  return { left, right, correct: compareValues(leftVal, rightVal) };
}

const PERCENT_FRACTION_PAIRS: { percent: number; fraction: Fraction }[] = [
  { percent: 10, fraction: { numerator: 1, denominator: 10 } },
  { percent: 20, fraction: { numerator: 1, denominator: 5 } },
  { percent: 25, fraction: { numerator: 1, denominator: 4 } },
  { percent: 50, fraction: { numerator: 1, denominator: 2 } },
  { percent: 75, fraction: { numerator: 3, denominator: 4 } },
  { percent: 100, fraction: { numerator: 1, denominator: 1 } },
];

export function buildPercentVsFractionPair(): {
  left: string;
  right: string;
  correct: ComparisonSymbol;
} {
  const base = pickRandom(PERCENT_FRACTION_PAIRS);
  const equal = Math.random() > 0.35;
  let fraction = base.fraction;
  if (!equal) {
    const alt = pickRandom(PERCENT_FRACTION_PAIRS.filter((p) => p.percent !== base.percent));
    fraction = alt.fraction;
  }
  const left = `${base.percent}%`;
  const right = formatFraction(fraction);
  const leftVal = base.percent / 100;
  const rightVal = fractionToDecimalValue(fraction);
  return { left, right, correct: compareValues(leftVal, rightVal) };
}

function pickFractionWithDenominator(denominator: number): Fraction {
  const numerator = randomIntInclusive(1, denominator - 1);
  return reduceFraction({ numerator, denominator });
}

function pickDenominatorExcluding(exclude: number): number {
  const pool = FRACTION_DENOMINATOR_POOL.filter((d) => d !== exclude);
  return pickRandom([...pool]);
}

function formatFractionUnreduced(f: Fraction): string {
  if (f.denominator === 1) return String(f.numerator);
  return `${f.numerator}/${f.denominator}`;
}

/** Equivalent fraction with a different denominator (may be unreduced for display). */
function pickEquivalentWithDifferentDenominator(left: Fraction): Fraction | null {
  const leftVal = fractionToDecimalValue(left);
  const candidates = FRACTION_DENOMINATOR_POOL.filter((d) => d !== left.denominator);
  for (const d of candidates) {
    const n = leftVal * d;
    if (!Number.isInteger(n) || n < 1 || n >= d) continue;
    return { numerator: n, denominator: d };
  }
  return null;
}

export function buildFractionVsFractionPair(): {
  left: string;
  right: string;
  correct: ComparisonSymbol;
} {
  const left = pickProperFraction();
  const leftVal = fractionToDecimalValue(left);
  const leftLabel = formatFraction(left);
  const wantEqual = Math.random() < 0.2;

  for (let attempt = 0; attempt < 80; attempt++) {
    if (wantEqual) {
      const equivalent = pickEquivalentWithDifferentDenominator(left);
      if (!equivalent) continue;
      const rightLabel = formatFractionUnreduced(equivalent);
      if (rightLabel === leftLabel) continue;
      return {
        left: leftLabel,
        right: rightLabel,
        correct: '=',
      };
    }

    const rightDenom = pickDenominatorExcluding(left.denominator);
    const right = pickFractionWithDenominator(rightDenom);
    const rightLabel = formatFraction(right);
    const rightVal = fractionToDecimalValue(right);

    if (rightLabel === leftLabel) continue;
    if (right.denominator === left.denominator) continue;
    if (Math.abs(rightVal - leftVal) < 0.001) continue;

    return {
      left: leftLabel,
      right: rightLabel,
      correct: compareValues(leftVal, rightVal),
    };
  }

  // Fallback: force unequal fractions with different denominators.
  for (let attempt = 0; attempt < 40; attempt++) {
    const rightDenom = pickDenominatorExcluding(left.denominator);
    const right = pickFractionWithDenominator(rightDenom);
    const rightLabel = formatFraction(right);
    const rightVal = fractionToDecimalValue(right);
    if (
      rightLabel !== leftLabel &&
      right.denominator !== left.denominator &&
      Math.abs(rightVal - leftVal) > 0.001
    ) {
      return {
        left: leftLabel,
        right: rightLabel,
        correct: compareValues(leftVal, rightVal),
      };
    }
  }

  return {
    left: '1/3',
    right: '1/4',
    correct: '>',
  };
}

type MeasurementUnit = { label: string; factorToBase: number };

const LENGTH_UNITS: MeasurementUnit[] = [
  { label: 'mm', factorToBase: 0.001 },
  { label: 'cm', factorToBase: 0.01 },
  { label: 'm', factorToBase: 1 },
  { label: 'km', factorToBase: 1000 },
];

const MASS_UNITS: MeasurementUnit[] = [
  { label: 'g', factorToBase: 1 },
  { label: 'kg', factorToBase: 1000 },
];

const VOLUME_UNITS: MeasurementUnit[] = [
  { label: 'mL', factorToBase: 1 },
  { label: 'L', factorToBase: 1000 },
];

const MEASUREMENT_FAMILIES: MeasurementUnit[][] = [LENGTH_UNITS, MASS_UNITS, VOLUME_UNITS];

function pickMeasurementDisplayValue(unit: MeasurementUnit): number {
  if (unit.label === 'mm') return pickRandom([100, 250, 500, 750, 1000]);
  if (unit.label === 'cm') return pickRandom([5, 10, 25, 50, 100, 500]);
  if (unit.label === 'm') return pickRandom([1, 2, 3, 5, 10]);
  if (unit.label === 'km') return pickRandom([1, 2, 3, 5]);
  if (unit.label === 'g') return pickRandom([100, 250, 500, 750, 1000]);
  if (unit.label === 'kg') return pickRandom([1, 2, 3, 5]);
  if (unit.label === 'mL') return pickRandom([100, 250, 500, 750, 1000]);
  if (unit.label === 'L') return pickRandom([1, 2, 3, 5]);
  return randomIntInclusive(1, 10);
}

export function buildMeasurementComparePair(): {
  left: string;
  right: string;
  correct: ComparisonSymbol;
} {
  const family = pickRandom(MEASUREMENT_FAMILIES);
  const leftUnit = pickRandom(family);
  let rightUnit = pickRandom(family.filter((u) => u.label !== leftUnit.label));
  if (!rightUnit) rightUnit = leftUnit;

  const equal = Math.random() > 0.4;
  let leftAmount = pickMeasurementDisplayValue(leftUnit);
  let rightAmount: number;

  if (equal) {
    const base = leftAmount * leftUnit.factorToBase;
    rightAmount = base / rightUnit.factorToBase;
    if (!Number.isInteger(rightAmount)) {
      rightAmount = Math.round(rightAmount * 10) / 10;
      leftAmount = (rightAmount * rightUnit.factorToBase) / leftUnit.factorToBase;
      if (!Number.isInteger(leftAmount)) {
        leftAmount = Math.round(leftAmount);
      }
    }
  } else {
    rightAmount = pickMeasurementDisplayValue(rightUnit);
    for (let i = 0; i < 15; i++) {
      const lv = leftAmount * leftUnit.factorToBase;
      const rv = rightAmount * rightUnit.factorToBase;
      if (Math.abs(lv - rv) > 0.001) break;
      rightAmount = pickMeasurementDisplayValue(rightUnit);
    }
  }

  const leftVal = leftAmount * leftUnit.factorToBase;
  const rightVal = rightAmount * rightUnit.factorToBase;
  return {
    left: `${leftAmount} ${leftUnit.label}`,
    right: `${rightAmount} ${rightUnit.label}`,
    correct: compareValues(leftVal, rightVal),
  };
}
