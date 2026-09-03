import { calculusAnswersMatch } from '@/features/calculus/calculusFormat';
import {
  formulasMatch,
  piFormsMatch,
} from '@/features/geometry/geometryFormulas';
import { logAnswersMatch } from '@/features/logarithm/logarithmFormat';
import { trigAnswersMatch } from '@/features/trigonometry/trigonometryFormulas';
import type { MathOperation } from '@/features/learning-plan/learningPlan.types';
import {
  formatQuotientRemainder,
  parseQuotientRemainderString,
  quotientRemainderEquals,
} from '@/features/questions/divisionRemainder';
import { formatFraction } from '@/features/questions/fractions';
import { equationAnswerMatches, normalizeEquationAnswerInput } from '@/features/questions/equationUnknown';
import { formatNumber, formatRoundingNumber } from '@/features/questions/mathExpressionFormat';
import type { MathQuestion } from '@/features/questions/question.types';
import {
  isArithmeticQuestion,
  isComparisonQuestion,
  isEquivalentExpressionQuestion,
  isEquationTwoUnknownQuestion,
  isEquationUnknownQuestion,
  isFractionVisualQuestion,
  isShapeRecognitionQuestion,
  isClockQuestion,
  isPatternQuestion,
  isCalculusQuestion,
  isTrigonometryQuestion,
  isLogarithmQuestion,
  isNumberSenseQuestion,
  isFractionQuestion,
  isGeometryQuestion,
  isRemainderQuestion,
} from '@/features/questions/question.types';
import { parseIntegerAnswer } from '@/utils/parseIntegerAnswer';
import { fractionAnswerMatches } from '@/utils/parseFractionAnswer';
import { capitalizeFirst } from '@/utils/textCase';

export type OperationAttemptStats = {
  attempted: number;
  wrong: number;
};

/** Per-operation totals for one session (wrong answers enable adaptation hints). */
export type OperationStatsRollup = Partial<Record<MathOperation, OperationAttemptStats>>;

function numericAnswersMatch(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}

export function correctAnswerDisplayLabel(q: MathQuestion): string {
  if (q.kind === 'advanced_equation' || q.kind === 'limit') return q.correctAnswer;
  if (isArithmeticQuestion(q)) {
    if (isFractionQuestion(q) && q.correctFraction) {
      return formatFraction(q.correctFraction);
    }
    if (isRemainderQuestion(q) && q.quotientRemainder) {
      const { quotient, remainder } = q.quotientRemainder;
      return formatQuotientRemainder(quotient, remainder);
    }
    if (q.operation === 'rounding') {
      return formatRoundingNumber(q.correctAnswer, q.roundingNearest);
    }
    if (!Number.isInteger(q.correctAnswer)) {
      return formatNumber(q.correctAnswer);
    }
    return String(q.correctAnswer);
  }
  if (isGeometryQuestion(q)) {
    return String(q.correctAnswer);
  }
  if (isShapeRecognitionQuestion(q) || isPatternQuestion(q)) {
    return capitalizeFirst(String(q.correctAnswer));
  }
  if (isComparisonQuestion(q) || isEquivalentExpressionQuestion(q) || isFractionVisualQuestion(q) || isClockQuestion(q) || isCalculusQuestion(q) || isTrigonometryQuestion(q) || isLogarithmQuestion(q) || isNumberSenseQuestion(q)) {
    return String(q.correctAnswer);
  }
  if (isEquationTwoUnknownQuestion(q)) {
    return String(q.correctAnswer);
  }
  return `x=${q.correctExpression}`;
}

/** Answer text embedded after prose such as “The correct answer is …”. */
export function correctAnswerFeedbackLabel(q: MathQuestion): string {
  if (isShapeRecognitionQuestion(q) || isPatternQuestion(q)) {
    return String(q.correctAnswer);
  }
  return correctAnswerDisplayLabel(q);
}

export function answerOptionDisplayLabel(q: MathQuestion, option: number | string): string {
  if (isArithmeticQuestion(q) && q.operation === 'rounding' && typeof option === 'number') {
    return formatRoundingNumber(option, q.roundingNearest);
  }
  if (isArithmeticQuestion(q) && typeof option === 'number' && !Number.isInteger(option)) {
    return formatNumber(option);
  }
  if (isShapeRecognitionQuestion(q) || isPatternQuestion(q)) {
    return capitalizeFirst(String(option));
  }
  if (isFractionVisualQuestion(q) || isComparisonQuestion(q) || isEquivalentExpressionQuestion(q) || isClockQuestion(q) || isCalculusQuestion(q) || isTrigonometryQuestion(q) || isLogarithmQuestion(q) || isNumberSenseQuestion(q)) {
    return String(option);
  }
  return String(option);
}

/** Two-column choices are reserved for scalar numbers/fractions; symbolic labels stay full-width. */
export function answerOptionsArePlainNumbers(q: MathQuestion): boolean {
  if (isEquationUnknownQuestion(q)) return false;
  return q.answerOptions.every((option) => {
    if (typeof option === 'number') return Number.isFinite(option);
    const label = option.trim();
    return /^[-+]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(label) ||
      /^[-+]?\d+\s*\/\s*\d+$/.test(label);
  });
}

/** Full-width rows for symbolic labels and for exactly three choices (avoids a lone third button). */
export function shouldStackAnswerOptions(q: MathQuestion): boolean {
  if (q.answerOptions.length === 3) return true;
  return !answerOptionsArePlainNumbers(q);
}

export function chosenAnswerDisplayLabel(q: MathQuestion, chosen: number | string | null): string {
  if (chosen === null) return '—';
  if (q.kind === 'advanced_equation' || q.kind === 'limit') return String(chosen);
  if (isArithmeticQuestion(q)) return answerOptionDisplayLabel(q, chosen);
  if (isGeometryQuestion(q)) return String(chosen);
  if (isComparisonQuestion(q) || isEquivalentExpressionQuestion(q) || isFractionVisualQuestion(q) || isShapeRecognitionQuestion(q) || isClockQuestion(q) || isPatternQuestion(q) || isCalculusQuestion(q) || isTrigonometryQuestion(q) || isLogarithmQuestion(q) || isNumberSenseQuestion(q)) return String(chosen);
  if (isEquationTwoUnknownQuestion(q)) return String(chosen);
  const raw = typeof chosen === 'string' ? chosen : String(chosen);
  const body = normalizeEquationAnswerInput(raw.replace(/^\s*x\s*=\s*/i, ''));
  return `x=${body}`;
}

export function submittedAnswerIsCorrect(q: MathQuestion, answer: number | string | null): boolean {
  if (answer === null) return false;
  if (q.kind === 'advanced_equation' || q.kind === 'limit') return String(answer) === q.correctAnswer;
  if (isArithmeticQuestion(q)) {
    if (isFractionQuestion(q) && q.correctFraction) {
      if (typeof answer !== 'string') return false;
      return fractionAnswerMatches(answer, q.correctFraction);
    }
    if (isRemainderQuestion(q) && q.quotientRemainder) {
      if (typeof answer !== 'string') return false;
      const parsed = parseQuotientRemainderString(answer);
      return parsed !== null && quotientRemainderEquals(parsed, q.quotientRemainder);
    }
    return typeof answer === 'number' && numericAnswersMatch(answer, q.correctAnswer);
  }
  if (isEquationUnknownQuestion(q)) {
    const raw = typeof answer === 'string' ? answer : String(answer);
    return equationAnswerMatches(q.correctAnswer, q.correctExpression, raw);
  }
  if (isGeometryQuestion(q)) {
    if (q.answerKind === 'number') {
      const n =
        typeof answer === 'number'
          ? answer
          : parseIntegerAnswer(typeof answer === 'string' ? answer : String(answer));
      return n !== null && n === q.correctAnswer;
    }
    if (typeof answer !== 'string') return false;
    if (q.answerKind === 'formula') {
      return formulasMatch(answer, String(q.correctAnswer));
    }
    return piFormsMatch(answer, String(q.correctAnswer));
  }
  if (isNumberSenseQuestion(q)) {
    return String(answer).trim() === q.correctAnswer.trim();
  }
  if (isFractionVisualQuestion(q)) {
    if (typeof answer !== 'string') return false;
    return fractionAnswerMatches(answer, q.shaded);
  }
  if (isComparisonQuestion(q) || isEquivalentExpressionQuestion(q) || isShapeRecognitionQuestion(q) || isClockQuestion(q) || isPatternQuestion(q) || isCalculusQuestion(q) || isTrigonometryQuestion(q) || isLogarithmQuestion(q)) {
    if (typeof answer !== 'string') return false;
    return (
      trigAnswersMatch(answer, q.correctAnswer) ||
      calculusAnswersMatch(answer, q.correctAnswer) ||
      logAnswersMatch(answer, q.correctAnswer) ||
      answer === q.correctAnswer
    );
  }
  if (isEquationTwoUnknownQuestion(q)) {
    const n =
      typeof answer === 'number'
        ? answer
        : parseIntegerAnswer(typeof answer === 'string' ? answer : String(answer));
    return n !== null && n === q.correctAnswer;
  }
  return false;
}

export function computeOperationStats(
  questions: MathQuestion[],
  answers: (number | string | null)[],
): OperationStatsRollup {
  const rollup: OperationStatsRollup = {};
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]!;
    const a = answers[i] ?? null;
    const ok = submittedAnswerIsCorrect(q, a);
    const op = q.operation;
    const cur = rollup[op] ?? { attempted: 0, wrong: 0 };
    cur.attempted += 1;
    if (!ok) cur.wrong += 1;
    rollup[op] = cur;
  }
  return rollup;
}

export type QuizQuestionOutcome = {
  questionText: string;
  chosenAnswer: number | string | null;
  chosenAnswerLabel: string;
  /** Correct answer value (numeric for arithmetic; string for geometry formulas / π forms). */
  correctAnswer: number | string;
  /** Human-readable correct response (e.g. `x=20:5`). */
  correctAnswerLabel: string;
  isCorrect: boolean;
};

export type SessionModeResult = 'practice' | 'quiz' | 'timed';

export type TimedRunSummary = {
  survivedSeconds: number;
  initialSeconds: number;
  bonusSeconds: number;
  penaltySeconds: number;
};

export type SessionResult = {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  scorePercentage: number;
  sessionMode?: SessionModeResult;
  quizQuestionOutcomes?: QuizQuestionOutcome[];
  operationStats?: OperationStatsRollup;
  timedRun?: TimedRunSummary;
};

export function computeScorePercentage(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

function summary(correctAnswers: number, totalQuestions: number) {
  const wrongAnswers = Math.max(0, totalQuestions - correctAnswers);
  return {
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    scorePercentage: computeScorePercentage(correctAnswers, totalQuestions),
  };
}

/** Summary after practice (aggregates only; no per-question review list). */
export function buildPracticeSessionResult(
  questions: MathQuestion[],
  answers: (number | string | null)[],
): SessionResult {
  const correct = questions.reduce((acc, q, i) => {
    const a = answers[i] ?? null;
    return acc + (submittedAnswerIsCorrect(q, a) ? 1 : 0);
  }, 0);
  return {
    ...summary(correct, questions.length),
    sessionMode: 'practice',
    operationStats: computeOperationStats(questions, answers),
  };
}

/** @deprecated Use buildPracticeSessionResult(questions, answers). */
export function buildSessionResult(correctAnswers: number, totalQuestions: number): SessionResult {
  return {
    ...summary(correctAnswers, totalQuestions),
    sessionMode: 'practice',
  };
}

export function buildQuizSessionResult(
  questions: MathQuestion[],
  answers: (number | string | null)[],
): SessionResult {
  const quizQuestionOutcomes: QuizQuestionOutcome[] = questions.map((q, i) => {
    const chosen = answers[i] ?? null;
    const isCorrect = submittedAnswerIsCorrect(q, chosen);
    return {
      questionText: q.questionText,
      chosenAnswer: chosen,
      chosenAnswerLabel: chosenAnswerDisplayLabel(q, chosen),
      correctAnswer: q.correctAnswer,
      correctAnswerLabel: correctAnswerDisplayLabel(q),
      isCorrect,
    };
  });
  const correct = quizQuestionOutcomes.filter((o) => o.isCorrect).length;
  return {
    ...summary(correct, questions.length),
    sessionMode: 'quiz',
    quizQuestionOutcomes,
    operationStats: computeOperationStats(questions, answers),
  };
}

/** Timed run: same per-question outcomes as quiz for review; `sessionMode` is `timed`. */
export function buildTimedSessionResult(
  questions: MathQuestion[],
  answers: (number | string | null)[],
  timedRun?: TimedRunSummary,
): SessionResult {
  const quizQuestionOutcomes: QuizQuestionOutcome[] = questions.map((q, i) => {
    const chosen = answers[i] ?? null;
    const isCorrect = submittedAnswerIsCorrect(q, chosen);
    return {
      questionText: q.questionText,
      chosenAnswer: chosen,
      chosenAnswerLabel: chosenAnswerDisplayLabel(q, chosen),
      correctAnswer: q.correctAnswer,
      correctAnswerLabel: correctAnswerDisplayLabel(q),
      isCorrect,
    };
  });
  const correct = quizQuestionOutcomes.filter((o) => o.isCorrect).length;
  return {
    ...summary(correct, questions.length),
    sessionMode: 'timed',
    quizQuestionOutcomes,
    operationStats: computeOperationStats(questions, answers),
    timedRun,
  };
}
