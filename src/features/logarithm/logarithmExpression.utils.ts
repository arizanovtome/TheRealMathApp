import { logAnswersEquivalentForMc } from '@/features/logarithm/logarithmFormat';
import { pickRandom, randomIntInclusive } from '@/utils/random';

export const NUMERIC_LOG_BASES = [2, 3, 5, 10] as const;

export type NumericLogSpec =
  | { kind: 'power'; base: (typeof NUMERIC_LOG_BASES)[number]; exponent: number }
  | { kind: 'product'; base: 10; expA: number; expB: number };

function pickExponentForBase(base: (typeof NUMERIC_LOG_BASES)[number]): number {
  switch (base) {
    case 2:
      return randomIntInclusive(2, 5);
    case 3:
      return randomIntInclusive(2, 4);
    case 5:
      return randomIntInclusive(2, 3);
    case 10:
      return randomIntInclusive(1, 4);
  }
}

/** Simple integer-answer log questions: log_b(b^n), plus occasional log₁₀ products. */
export function pickNumericLogSpec(): NumericLogSpec {
  if (Math.random() < 0.25) {
    return {
      kind: 'product',
      base: 10,
      expA: randomIntInclusive(1, 3),
      expB: randomIntInclusive(1, 3),
    };
  }
  const base = pickRandom([...NUMERIC_LOG_BASES]);
  return { kind: 'power', base, exponent: pickExponentForBase(base) };
}

export function buildLogMcOptions(
  correct: string,
  distractors: string[],
  count: number,
): string[] {
  const pool = new Set<string>();
  for (const d of distractors) {
    if (!logAnswersEquivalentForMc(d, correct)) pool.add(d);
  }
  const options = [correct];
  const available = [...pool];
  while (options.length < count && available.length > 0) {
    const idx = randomIntInclusive(0, available.length - 1);
    const candidate = available.splice(idx, 1)[0]!;
    if (options.every((opt) => !logAnswersEquivalentForMc(opt, candidate))) {
      options.push(candidate);
    }
  }
  for (let value = 2; options.length < count; value++) {
    const candidate = `log ${value}`;
    if (options.every((opt) => !logAnswersEquivalentForMc(opt, candidate)
      && !logAnswersEquivalentForMc(candidate, opt))) options.push(candidate);
  }
  return options.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export function pickLogFactors(): { a: number; b: number } {
  const a = randomIntInclusive(2, 9);
  const b = randomIntInclusive(2, 9);
  return { a, b };
}

export function pickLogQuotient(): { dividend: number; divisor: number } {
  const divisor = randomIntInclusive(2, 9);
  const quotient = randomIntInclusive(2, 9);
  const dividend = divisor * quotient + randomIntInclusive(1, divisor - 1);
  return { dividend, divisor };
}

export function pickLogPowerExponent(): number {
  return randomIntInclusive(2, 5);
}

export function buildNumericMcOptions(correct: number, count: number): string[] {
  const correctStr = String(correct);
  const pool = new Set<number>();
  for (const delta of [1, -1, 2, -2, 3]) {
    const candidate = correct + delta;
    if (candidate >= 0) pool.add(candidate);
  }
  const options = [correctStr];
  for (const n of pool) {
    if (options.length >= count) break;
    const s = String(n);
    if (!options.includes(s)) options.push(s);
  }
  for (let value = 0; options.length < count; value++) {
    const candidate = String(value);
    if (!options.includes(candidate)) options.push(candidate);
  }
  return options.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export function pickLnExponent(): number {
  return randomIntInclusive(1, 4);
}
