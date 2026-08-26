import type { AnswerOptionsCount } from '@/features/learning-plan/learningPlan.types';
import { randomIntInclusive } from '@/utils/random';

/** Primary wrong-answer offsets (shuffled). Includes ±10 and ±1…±3. */
const WRONG_DELTAS_PRIMARY = [-10, -3, -2, -1, 1, 2, 3, 10] as const;

/** Extra nearby offsets if primary/bounds leave too few choices (still close to correct). */
const WRONG_DELTAS_FALLBACK = [-9, -8, -7, -6, -5, -4, 4, 5, 6, 7, 8, 9] as const;

export type AnswerDistractorBounds = {
  min: number;
  max: number;
};

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomIntInclusive(0, i);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function tryAddWrong(
  wrong: Set<number>,
  correctAnswer: number,
  value: number,
  allowNegativeDistractors: boolean,
  bounds?: AnswerDistractorBounds,
): boolean {
  if (!Number.isFinite(value) || !Number.isInteger(value)) return false;
  if (value === correctAnswer || wrong.has(value)) return false;
  if (!allowNegativeDistractors && value < 0) return false;
  if (bounds !== undefined && (value < bounds.min || value > bounds.max)) return false;
  wrong.add(value);
  return true;
}

/**
 * Returns at most `maxCount` options. Fixed categorical sets (e.g. Even/Odd, < > =)
 * are always returned in full and never truncated.
 */
export function limitAnswerOptions<T>(
  options: T[],
  maxCount: AnswerOptionsCount,
  opts?: { fixedSet?: boolean },
): T[] {
  if (opts?.fixedSet || options.length <= maxCount) {
    return options;
  }
  return options.slice(0, maxCount);
}

/** Shuffles a fixed set of categorical labels; never drops options below the natural count. */
export function buildFixedAnswerOptions(
  allOptions: string[],
  maxCount: AnswerOptionsCount,
): string[] {
  const capped = limitAnswerOptions(allOptions, maxCount, { fixedSet: true });
  return capped.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

/**
 * Builds shuffled multiple-choice options including the correct answer.
 * Wrong options prefer correct ± 1, ±2, ±3, ±10 (order randomized), then ±4…±9 if needed.
 * Optional `bounds` keeps distractors inside the session’s final-result range so choices stay sensible.
 * `preferredWrongAnswers` are attempted first for operation-specific misconceptions.
 */
export function buildAnswerOptions(
  correctAnswer: number,
  optionCount: AnswerOptionsCount,
  allowNegativeDistractors: boolean,
  bounds?: AnswerDistractorBounds,
  preferredWrongAnswers: readonly number[] = [],
): number[] {
  const wrongNeeded = optionCount - 1;
  const wrong = new Set<number>();

  const tryLocal = (value: number) =>
    tryAddWrong(wrong, correctAnswer, value, allowNegativeDistractors, bounds);

  for (const value of preferredWrongAnswers) {
    if (wrong.size >= wrongNeeded) break;
    tryLocal(value);
  }

  for (const d of shuffleInPlace([...WRONG_DELTAS_PRIMARY])) {
    if (wrong.size >= wrongNeeded) break;
    tryLocal(correctAnswer + d);
  }

  for (const d of shuffleInPlace([...WRONG_DELTAS_FALLBACK])) {
    if (wrong.size >= wrongNeeded) break;
    tryLocal(correctAnswer + d);
  }

  if (bounds !== undefined && wrong.size < wrongNeeded) {
    let guard = 0;
    while (wrong.size < wrongNeeded && guard < 8_000) {
      guard += 1;
      const candidate = randomIntInclusive(bounds.min, bounds.max);
      tryLocal(candidate);
    }
  }

  const options = [correctAnswer, ...wrong];
  return shuffleInPlace(options);
}

/**
 * Multiple-choice options for `a + b × c = ?` (multiply before add).
 * Prioritizes common mistakes: left-to-right (a+b)×c, sum of three terms, full product, etc.
 */
export function buildOrderOfOperationsAnswerOptions(
  a: number,
  b: number,
  c: number,
  correctAnswer: number,
  optionCount: AnswerOptionsCount,
  allowNegativeDistractors: boolean,
  bounds?: AnswerDistractorBounds,
): number[] {
  const wrongNeeded = optionCount - 1;
  const wrong = new Set<number>();
  const tryLocal = (value: number) =>
    tryAddWrong(wrong, correctAnswer, value, allowNegativeDistractors, bounds);

  for (const v of [(a + b) * c, a + b + c, a * b * c, b * c, a * b + c]) {
    if (wrong.size >= wrongNeeded) break;
    tryLocal(v);
  }

  if (wrong.size < wrongNeeded) {
    for (const d of shuffleInPlace([...WRONG_DELTAS_PRIMARY, ...WRONG_DELTAS_FALLBACK])) {
      if (wrong.size >= wrongNeeded) break;
      tryLocal(correctAnswer + d);
    }
  }

  if (wrong.size < wrongNeeded) {
    let guard = 0;
    const lo = bounds !== undefined ? bounds.min : correctAnswer - 500;
    const hi = bounds !== undefined ? bounds.max : correctAnswer + 500;
    while (wrong.size < wrongNeeded && guard < 12_000) {
      guard += 1;
      tryLocal(randomIntInclusive(lo, hi));
    }
  }

  const wrongArr = shuffleInPlace([...wrong]);
  return shuffleInPlace([correctAnswer, ...wrongArr.slice(0, wrongNeeded)]);
}

export function buildSteppedAnswerOptions(
  correctAnswer: number,
  optionCount: AnswerOptionsCount,
  step: number,
  preferredWrongAnswers: readonly number[] = [],
): number[] {
  const wrongNeeded = optionCount - 1;
  const decimals = Math.max(0, Math.ceil(-Math.log10(step)));
  const normalize = (n: number) => Number(n.toFixed(decimals));
  const wrong = new Set<number>();
  const offsets = shuffleInPlace([-3, -2, -1, 1, 2, 3, -4, 4, -5, 5]);

  for (const value of preferredWrongAnswers) {
    if (wrong.size >= wrongNeeded) break;
    const normalized = normalize(value);
    if (Number.isFinite(normalized) && normalized !== correctAnswer) {
      wrong.add(normalized);
    }
  }

  for (const offset of offsets) {
    if (wrong.size >= wrongNeeded) break;
    const value = normalize(correctAnswer + offset * step);
    if (value !== correctAnswer) wrong.add(value);
  }

  let guard = 0;
  while (wrong.size < wrongNeeded && guard < 1000) {
    guard += 1;
    const offset = randomIntInclusive(-9, 9);
    if (offset === 0) continue;
    const value = normalize(correctAnswer + offset * step);
    if (value !== correctAnswer) wrong.add(value);
  }

  return shuffleInPlace([correctAnswer, ...[...wrong].slice(0, wrongNeeded)]);
}

/** Multiple-choice options for one-decimal-place numeric answers. */
export function buildDecimalAnswerOptions(
  correctAnswer: number,
  optionCount: AnswerOptionsCount,
  allowNegativeDistractors: boolean,
  bounds?: AnswerDistractorBounds,
  preferredWrongAnswers: readonly number[] = [],
): number[] {
  return buildSteppedAnswerOptions(
    correctAnswer,
    optionCount,
    0.1,
    preferredWrongAnswers,
  );
}

/** Wrong answer near `correctAnswer` for timers when there are no MC options (keyboard mode). */
export function pickWrongDistractorNearCorrect(
  correctAnswer: number,
  allowNegativeDistractors: boolean,
  bounds: AnswerDistractorBounds,
): number {
  const deltas = shuffleInPlace([
    ...WRONG_DELTAS_PRIMARY,
    ...WRONG_DELTAS_FALLBACK,
  ]);
  for (const d of deltas) {
    const v = correctAnswer + d;
    if (!Number.isFinite(v) || !Number.isInteger(v)) continue;
    if (v === correctAnswer) continue;
    if (!allowNegativeDistractors && v < 0) continue;
    if (v < bounds.min || v > bounds.max) continue;
    return v;
  }
  for (let v = bounds.min; v <= bounds.max; v++) {
    if (v === correctAnswer) continue;
    if (!allowNegativeDistractors && v < 0) continue;
    return v;
  }
  return correctAnswer;
}

import { positiveFeedbackForCorrectCount as positiveFeedbackI18n } from '@/i18n/labels';
import { i18n } from '@/i18n';

/** Encouraging line for a correct answer, scaled by share of the session answered correctly. */
export function positiveFeedbackForCorrectCount(
  correctCount: number,
  totalCount: number,
): string {
  return positiveFeedbackI18n(correctCount, totalCount, i18n.t.bind(i18n));
}
