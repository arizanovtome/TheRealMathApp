import { reduceFraction, type Fraction } from '@/features/questions/fractions';

/** Parses typed answers like `3/4`, `2`, or `-1/2`. Returns reduced fraction or null. */
export function parseFractionAnswer(raw: string): Fraction | null {
  const t = raw.trim().replace(/\u2212/g, '-');
  if (t === '' || t === '-' || t === '+') return null;

  const slash = t.indexOf('/');
  if (slash === -1) {
    if (!/^[-+]?\d+$/.test(t)) return null;
    const n = Number(t);
    if (!Number.isSafeInteger(n)) return null;
    return reduceFraction({ numerator: n, denominator: 1 });
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
