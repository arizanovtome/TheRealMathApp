import { randomIntInclusive } from '@/utils/random';

export type QuotientRemainder = { quotient: number; remainder: number };

export function formatQuotientRemainder(q: number, r: number): string {
  return `${q} R ${r}`;
}

/** Parses "3 R 2", "-7 R 1", or "3R2" (case-insensitive). Remainder is non-negative. */
export function parseQuotientRemainderString(raw: string): QuotientRemainder | null {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  const m = /^(-?\d+)\s*[rR]\s*(\d+)$/.exec(trimmed);
  if (!m) return null;
  const quotient = Number(m[1]);
  const remainder = Number(m[2]);
  if (!Number.isInteger(quotient) || !Number.isInteger(remainder) || remainder < 0) {
    return null;
  }
  return { quotient, remainder };
}

export function quotientRemainderEquals(
  a: QuotientRemainder,
  b: QuotientRemainder,
): boolean {
  return a.quotient === b.quotient && a.remainder === b.remainder;
}

export function buildRemainderMcOptions(
  correct: QuotientRemainder,
  optionCount: number,
): string[] {
  const correctStr = formatQuotientRemainder(correct.quotient, correct.remainder);
  const wrong = new Set<string>();
  const candidates: QuotientRemainder[] = [
    { quotient: correct.quotient + 1, remainder: correct.remainder },
    { quotient: correct.quotient - 1, remainder: correct.remainder },
    { quotient: correct.quotient, remainder: Math.max(0, correct.remainder - 1) },
    { quotient: correct.quotient, remainder: correct.remainder + 1 },
    { quotient: correct.quotient + 1, remainder: correct.remainder + 1 },
    { quotient: correct.quotient, remainder: 0 },
  ];
  for (const c of candidates) {
    if (wrong.size >= optionCount - 1) break;
    const s = formatQuotientRemainder(c.quotient, c.remainder);
    if (s !== correctStr) wrong.add(s);
  }
  let guard = 0;
  const qLo = correct.quotient - 2;
  const qHi = correct.quotient + 2;
  while (wrong.size < optionCount - 1 && guard < 200) {
    guard += 1;
    const q = randomIntInclusive(Math.min(qLo, qHi), Math.max(qLo, qHi));
    const r = randomIntInclusive(0, Math.max(correct.remainder + 2, 3));
    const s = formatQuotientRemainder(q, r);
    if (s !== correctStr) wrong.add(s);
  }
  const wrongArr = [...wrong].slice(0, optionCount - 1);
  return shuffleStrings([correctStr, ...wrongArr]);
}

function shuffleStrings(arr: string[]): string[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomIntInclusive(0, i);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}
