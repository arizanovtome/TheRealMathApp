import { fractionsEqual, reduceFraction, type Fraction } from '@/features/questions/fractions';
import { parseNumberAnswer } from '@/utils/parseIntegerAnswer';

/** Parses typed answers like `3/4`, `2`, `0.25`, or `-1/2`. Returns reduced fraction or null. */
export function parseFractionAnswer(raw: string): Fraction | null {
  const t = raw.trim().replace(/\u2212/g, '-');
  if (t === '' || t === '-' || t === '+') return null;

  const slash = t.indexOf('/');
  if (slash === -1) {
    if (/^[-+]?\d+$/.test(t)) {
      const n = Number(t);
      if (!Number.isSafeInteger(n)) return null;
      return reduceFraction({ numerator: n, denominator: 1 });
    }
    const decimal = parseNumberAnswer(t);
    if (decimal === null) return null;
    return decimalToReducedFraction(decimal);
  }

  const numPart = t.slice(0, slash).trim();
  const denPart = t.slice(slash + 1).trim();
  if (!/^[-+]?\d+$/.test(numPart) || !/^[-+]?\d+$/.test(denPart)) return null;
  const numerator = Number(numPart);
  const denominator = Number(denPart);
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator) || denominator === 0) {
    return null;
  }
  return reduceFraction({ numerator, denominator });
}

/** True when the typed value is complete enough to submit (fraction, whole number, or decimal). */
export function isCompleteFractionAnswer(raw: string): boolean {
  return parseFractionAnswer(raw) !== null;
}

/** Whether a typed answer matches the correct reduced fraction (supports decimals). */
export function fractionAnswerMatches(input: string, correct: Fraction): boolean {
  const trimmed = input.trim();
  if (trimmed.includes('/')) {
    const parsed = parseFractionAnswer(trimmed);
    return parsed !== null && fractionsEqual(parsed, correct);
  }

  const decimal = parseNumberAnswer(trimmed);
  if (decimal !== null) {
    const expected = correct.numerator / correct.denominator;
    const tolerance = Math.max(1e-4, 0.55 / correct.denominator);
    if (Math.abs(decimal - expected) <= tolerance) return true;
  }

  const parsed = parseFractionAnswer(trimmed);
  return parsed !== null && fractionsEqual(parsed, correct);
}

function decimalToReducedFraction(value: number, maxDenominator = 1000): Fraction | null {
  if (!Number.isFinite(value)) return null;
  for (let denominator = 1; denominator <= maxDenominator; denominator += 1) {
    const numerator = Math.round(value * denominator);
    if (Math.abs(numerator / denominator - value) <= 1e-6) {
      return reduceFraction({ numerator, denominator });
    }
  }
  return reduceFraction({ numerator: Math.round(value * 1000), denominator: 1000 });
}
