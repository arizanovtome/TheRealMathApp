import type {
  AnswerOptionsCount,
  QuestionStyle,
} from '@/features/learning-plan/learningPlan.types';
import type { OperandSnapshot } from '@/features/questions/questionStyles';
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

function magnitudeAwareWrongAnswers(correctAnswer: number): number[] {
  const magnitude = Math.abs(correctAnswer);
  if (magnitude < 10) {
    return [correctAnswer - 1, correctAnswer + 2, correctAnswer - 3, correctAnswer + 4];
  }
  if (magnitude < 100) {
    // Mixing units and both digits prevents a learner from checking only the ones digit.
    return [
      correctAnswer - 1,
      correctAnswer + 11,
      correctAnswer - 12,
      correctAnswer + 20,
      correctAnswer - 21,
      correctAnswer + 2,
    ];
  }

  const highestPlace = 10 ** Math.floor(Math.log10(magnitude));
  const broadPlace = Math.max(100, highestPlace / 10);
  const widerPlace = Math.max(1_000, highestPlace);
  return [
    correctAnswer - 1,
    correctAnswer + broadPlace,
    correctAnswer - widerPlace,
    correctAnswer + broadPlace + 10,
    correctAnswer - Math.max(100, broadPlace / 10),
    correctAnswer + 11,
  ];
}

function additionCarryMistakes(left: number, right: number, correctAnswer: number): number[] {
  if (left < 0 || right < 0) return [];
  const mistakes: number[] = [];
  let a = Math.abs(left);
  let b = Math.abs(right);
  let carry = 0;
  let place = 1;
  while (a > 0 || b > 0 || carry > 0) {
    const sum = (a % 10) + (b % 10) + carry;
    if (sum >= 10) mistakes.push(correctAnswer - place * 10);
    carry = Math.floor(sum / 10);
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
    place *= 10;
  }
  return mistakes;
}

function subtractionBorrowMistakes(first: number, second: number, correctAnswer: number): number[] {
  if (first < 0 || second < 0) return [];
  const mistakes: number[] = [];
  let a = Math.abs(first);
  let b = Math.abs(second);
  let place = 1;
  while (b > 0) {
    if (a % 10 < b % 10) mistakes.push(correctAnswer + place * 10);
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
    place *= 10;
  }
  return mistakes;
}

/**
 * Builds integer choices from likely arithmetic mistakes and answer-sized place values.
 * The generic nearby-offset generator remains the final fallback for tight bounds.
 */
export function buildArithmeticAnswerOptions(
  correctAnswer: number,
  optionCount: AnswerOptionsCount,
  allowNegativeDistractors: boolean,
  bounds: AnswerDistractorBounds | undefined,
  snapshot: OperandSnapshot | undefined,
  questionStyle: QuestionStyle,
  preferredWrongAnswers: readonly number[] = [],
): number[] {
  const misconceptionAnswers: number[] = [];

  // A missing-number answer is an operand rather than the snapshot's result, so result-column
  // mistakes would not describe the task the learner is solving.
  if (questionStyle !== 'missing_number' && snapshot) {
    switch (snapshot.operation) {
      case 'addition':
        misconceptionAnswers.push(
          ...additionCarryMistakes(snapshot.left, snapshot.right, correctAnswer),
        );
        break;
      case 'subtraction':
        misconceptionAnswers.push(
          ...subtractionBorrowMistakes(snapshot.first, snapshot.second, correctAnswer),
        );
        break;
      case 'multiplication':
        misconceptionAnswers.push(
          snapshot.left * (snapshot.right - 1),
          snapshot.left * (snapshot.right + 1),
          snapshot.left + snapshot.right,
        );
        break;
      case 'division':
        misconceptionAnswers.push(
          snapshot.quotient - 1,
          snapshot.quotient + 1,
          snapshot.dividend * snapshot.divisor,
        );
        break;
      case 'square':
        misconceptionAnswers.push(
          (snapshot.base - 1) ** 2,
          (snapshot.base + 1) ** 2,
          snapshot.base * 2,
        );
        break;
      case 'square_root':
        misconceptionAnswers.push(snapshot.root - 1, snapshot.root + 1, snapshot.radicand / 2);
        break;
      default:
        break;
    }
  }

  // Interleave a close error with place-value errors. This avoids sets where one option is the
  // only answer with a different prefix, while still retaining believable column mistakes.
  const scaled = magnitudeAwareWrongAnswers(correctAnswer);
  const balanced = [
    misconceptionAnswers[0],
    scaled[0],
    scaled[1],
    misconceptionAnswers[1],
    scaled[2],
    scaled[3],
    ...misconceptionAnswers.slice(2),
    ...scaled.slice(4),
  ].filter((value): value is number => value !== undefined);

  return buildAnswerOptions(
    correctAnswer,
    optionCount,
    allowNegativeDistractors,
    bounds,
    [...preferredWrongAnswers, ...balanced],
  );
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

/** Multiple-choice options matching the answer's decimal precision (tenths or hundredths). */
export function buildDecimalAnswerOptions(
  correctAnswer: number,
  optionCount: AnswerOptionsCount,
  allowNegativeDistractors: boolean,
  bounds?: AnswerDistractorBounds,
  preferredWrongAnswers: readonly number[] = [],
): number[] {
  const hasHundredths = Number(correctAnswer.toFixed(2)) !== Number(correctAnswer.toFixed(1));
  return buildSteppedAnswerOptions(
    correctAnswer,
    optionCount,
    hasHundredths ? 0.01 : 0.1,
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
