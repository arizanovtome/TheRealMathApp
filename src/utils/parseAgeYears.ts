import { MAX_PROFILE_AGE, MIN_CHILD_AGE } from '@/constants/ageDefaults';
import { parseIntegerAnswer } from '@/utils/parseIntegerAnswer';

/** Parses age in whole years; returns null if empty or out of allowed range. */
export function parseAgeYears(raw: string): number | null {
  const n = parseIntegerAnswer(raw);
  if (n === null || n < MIN_CHILD_AGE || n > MAX_PROFILE_AGE) return null;
  return n;
}

export function formatAgeYears(age: number): string {
  return String(age);
}
