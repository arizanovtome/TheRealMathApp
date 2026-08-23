import type { MathQuestion } from '@/features/questions/question.types';

/** Whether a question type can accept typed keyboard answers (when the setting is on). */
export type QuestionKeyboardSupport = 'keyboard' | 'multiple_choice_only';

/** Natural choice counts that must always be shown in full (never truncated by settings). */
export const FIXED_ANSWER_OPTION_SETS = {
  oddEven: 2,
  compareQuantities: 3,
  comparisonSymbols: 3,
} as const;

/** Per number-sense subtype keyboard support. */
export const NUMBER_SENSE_KEYBOARD_INPUT = {
  numberRecognition: 'multiple_choice_only',
  countObjects: 'keyboard',
  beforeAfter: 'keyboard',
  missingNumber: 'keyboard',
  compareQuantities: 'multiple_choice_only',
  oddEven: 'multiple_choice_only',
} as const satisfies Record<
  MathQuestion extends { kind: 'number_sense' } ? MathQuestion['subtype'] : never,
  QuestionKeyboardSupport
>;

/**
 * Central map: which question kinds support keyboard input.
 * Open this file first when adding a new question type or changing answer UI.
 *
 * Geometry uses per-question `requiresMultipleChoice` from the generator (formula / π → MC only).
 * Number sense uses NUMBER_SENSE_KEYBOARD_INPUT per subtype.
 */
export const QUESTION_KEYBOARD_INPUT = {
  arithmetic: 'keyboard',
  equation_unknown: 'keyboard',
  equation_two_unknown: 'keyboard',
  geometry: 'per_question',
  comparison: 'multiple_choice_only',
  equivalent_expression: 'multiple_choice_only',
  fraction_visual: 'multiple_choice_only',
  shape_recognition: 'multiple_choice_only',
  clock: 'multiple_choice_only',
  pattern: 'multiple_choice_only',
  calculus: 'multiple_choice_only',
  trigonometry: 'multiple_choice_only',
  logarithm: 'multiple_choice_only',
  number_sense: 'per_subtype',
} as const;

/** True when the question can be answered via keyboard (if the user enabled keyboard answers). */
export function supportsKeyboardInput(q: MathQuestion): boolean {
  switch (q.kind) {
    case 'arithmetic':
      return q.answerKind !== 'quotient_remainder';
    case 'equation_unknown':
    case 'equation_two_unknown':
      return true;
    case 'geometry':
      return !q.requiresMultipleChoice;
    case 'number_sense':
      return NUMBER_SENSE_KEYBOARD_INPUT[q.subtype] === 'keyboard';
    case 'comparison':
    case 'equivalent_expression':
    case 'fraction_visual':
    case 'shape_recognition':
    case 'clock':
    case 'pattern':
    case 'calculus':
    case 'trigonometry':
    case 'logarithm':
      return false;
    default:
      return false;
  }
}

/** True when the session must show multiple-choice buttons (never keyboard). */
export function requiresMultipleChoiceQuestion(q: MathQuestion): boolean {
  return !supportsKeyboardInput(q);
}
