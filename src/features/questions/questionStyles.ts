import type {
  MathLearningConfig,
  MathOperation,
  QuestionStyle,
  RoundingNearest,
} from '@/features/learning-plan/learningPlan.types';
import { buildWordProblemText } from '@/features/questions/wordProblemTemplates';
import type { ArithmeticAnswerKind, Fraction } from '@/features/questions/question.types';
import type { QuotientRemainder } from '@/features/questions/divisionRemainder';
import {
  formatAddExpression,
  formatDivideExpression,
  formatInteger,
  formatMultiplyExpression,
  formatSubtractExpression,
} from '@/features/questions/mathExpressionFormat';
import { randomIntInclusive } from '@/utils/random';

export type OperandSnapshot =
  | { operation: 'addition'; left: number; right: number; result: number }
  | { operation: 'subtraction'; first: number; second: number; result: number }
  | { operation: 'multiplication'; left: number; right: number; result: number }
  | { operation: 'division'; dividend: number; divisor: number; quotient: number }
  | { operation: 'square'; base: number; result: number }
  | { operation: 'square_root'; radicand: number; root: number }
  | { operation: 'rounding'; value: number; rounded: number; unit: RoundingNearest }
  | { operation: 'order_of_operations'; a: number; b: number; c: number; result: number };

export type StyledArithmeticDraft = {
  kind: 'arithmetic';
  operation: MathOperation;
  questionText: string;
  questionStyle: QuestionStyle;
  answerKind: ArithmeticAnswerKind;
  correctAnswer: number;
  correctFraction?: Fraction;
  quotientRemainder?: QuotientRemainder;
  operandSnapshot?: OperandSnapshot;
  roundingNearest?: RoundingNearest;
  ooOperands?: { a: number; b: number; c: number };
};

function coinFlip(): boolean {
  return randomIntInclusive(0, 1) === 1;
}

export function snapshotFromStandardDraft(draft: {
  operation: MathOperation;
  questionText: string;
  correctAnswer: number;
  roundingNearest?: RoundingNearest;
  ooOperands?: { a: number; b: number; c: number };
}): OperandSnapshot | undefined {
  const { operation, questionText, correctAnswer } = draft;
  switch (operation) {
    case 'addition': {
      const m = /^(\d+) \+ (\d+) = \?$/.exec(questionText);
      if (!m) return undefined;
      const left = Number(m[1]);
      const right = Number(m[2]);
      return { operation: 'addition', left, right, result: correctAnswer };
    }
    case 'subtraction': {
      const m = /^(\d+) − (\d+) = \?$/.exec(questionText);
      if (!m) return undefined;
      return {
        operation: 'subtraction',
        first: Number(m[1]),
        second: Number(m[2]),
        result: correctAnswer,
      };
    }
    case 'multiplication': {
      const m = /^(\d+) × (\d+) = \?$/.exec(questionText);
      if (!m) return undefined;
      return {
        operation: 'multiplication',
        left: Number(m[1]),
        right: Number(m[2]),
        result: correctAnswer,
      };
    }
    case 'division': {
      const m = /^(\d+) ÷ (\d+) = \?$/.exec(questionText);
      if (!m) return undefined;
      return {
        operation: 'division',
        dividend: Number(m[1]),
        divisor: Number(m[2]),
        quotient: correctAnswer,
      };
    }
    case 'square': {
      const m = /^(\d+)² = \?$/.exec(questionText);
      if (!m) return undefined;
      const base = Number(m[1]);
      return { operation: 'square', base, result: correctAnswer };
    }
    case 'square_root': {
      const m = /^√(\d+) = \?$/.exec(questionText);
      if (!m) return undefined;
      const radicand = Number(m[1]);
      return { operation: 'square_root', radicand, root: correctAnswer };
    }
    case 'rounding': {
      const m10 = /^Round (\d+) to the nearest 10\.$/.exec(questionText);
      if (m10) {
        return {
          operation: 'rounding',
          value: Number(m10[1]),
          rounded: correctAnswer,
          unit: 10,
        };
      }
      const m100 = /^Round (\d+) to the nearest 100\.$/.exec(questionText);
      if (m100) {
        return {
          operation: 'rounding',
          value: Number(m100[1]),
          rounded: correctAnswer,
          unit: 100,
        };
      }
      return undefined;
    }
    case 'order_of_operations': {
      if (!draft.ooOperands) return undefined;
      const { a, b, c } = draft.ooOperands;
      return { operation: 'order_of_operations', a, b, c, result: correctAnswer };
    }
    default:
      return undefined;
  }
}

function buildMissingNumber(
  snap: OperandSnapshot,
): { questionText: string; correctAnswer: number } | null {
  const hideFirst = coinFlip();
  switch (snap.operation) {
    case 'addition': {
      const hidden = hideFirst ? snap.left : snap.right;
      const shownLeft = hideFirst ? '?' : String(snap.left);
      const shownRight = hideFirst ? snap.right : '?';
      return {
        questionText:
          shownRight === '?'
            ? `${shownLeft} + ? = ${formatInteger(snap.result)}`
            : `${formatAddExpression(shownLeft, shownRight)} = ${formatInteger(snap.result)}`,
        correctAnswer: hidden,
      };
    }
    case 'subtraction': {
      const hidden = hideFirst ? snap.first : snap.second;
      const shownFirst = hideFirst ? '?' : String(snap.first);
      const shownSecond = hideFirst ? snap.second : '?';
      return {
        questionText:
          shownSecond === '?'
            ? `${shownFirst} − ? = ${formatInteger(snap.result)}`
            : `${formatSubtractExpression(shownFirst, shownSecond)} = ${formatInteger(snap.result)}`,
        correctAnswer: hidden,
      };
    }
    case 'multiplication': {
      const hidden = hideFirst ? snap.left : snap.right;
      const shownLeft = hideFirst ? '?' : String(snap.left);
      const shownRight = hideFirst ? snap.right : '?';
      return {
        questionText: `${formatMultiplyExpression(shownLeft, shownRight)} = ${formatInteger(snap.result)}`,
        correctAnswer: hidden,
      };
    }
    case 'division': {
      const hidden = hideFirst ? snap.divisor : snap.quotient;
      if (hideFirst) {
        return {
          questionText: `${snap.dividend} ÷ ? = ${snap.quotient}`,
          correctAnswer: hidden,
        };
      }
      return {
        questionText: `${formatDivideExpression("?", snap.divisor)} = ${formatInteger(snap.quotient)}`,
        correctAnswer: snap.dividend,
      };
    }
    case 'square': {
      return {
        questionText: hideFirst ? `?² = ${formatInteger(snap.result)}` : `${formatInteger(snap.base)}² = ?`,
        correctAnswer: hideFirst ? snap.base : snap.result,
      };
    }
    case 'square_root': {
      return {
        questionText: hideFirst ? `√? = ${formatInteger(snap.root)}` : `√${formatInteger(snap.radicand)} = ?`,
        correctAnswer: hideFirst ? snap.radicand : snap.root,
      };
    }
    default:
      return null;
  }
}

export function applyQuestionStyle(
  draft: {
    operation: MathOperation;
    questionText: string;
    correctAnswer: number;
    roundingNearest?: RoundingNearest;
    ooOperands?: { a: number; b: number; c: number };
    operandSnapshot?: OperandSnapshot;
  },
  style: QuestionStyle,
  _config: MathLearningConfig,
): StyledArithmeticDraft {
  const base: StyledArithmeticDraft = {
    kind: 'arithmetic',
    operation: draft.operation,
    questionText: draft.questionText,
    questionStyle: style,
    answerKind: 'number',
    correctAnswer: draft.correctAnswer,
    operandSnapshot: draft.operandSnapshot ?? snapshotFromStandardDraft(draft),
    roundingNearest: draft.roundingNearest,
    ooOperands: draft.ooOperands,
  };

  if (style === 'standard' || style === 'word_problem') {
    if (style === 'word_problem') {
      const snap = base.operandSnapshot;
      if (snap?.operation === 'addition') {
        return {
          ...base,
          questionStyle: 'word_problem',
          questionText: buildWordProblemText(
            'addition',
            snap.left,
            snap.right,
            snap.result,
          ),
          correctAnswer: snap.result,
        };
      }
      if (snap?.operation === 'subtraction') {
        return {
          ...base,
          questionStyle: 'word_problem',
          questionText: buildWordProblemText(
            'subtraction',
            snap.first,
            snap.second,
            snap.result,
          ),
          correctAnswer: snap.result,
        };
      }
      if (snap?.operation === 'multiplication') {
        return {
          ...base,
          questionStyle: 'word_problem',
          questionText: buildWordProblemText(
            'multiplication',
            snap.left,
            snap.right,
            snap.result,
          ),
          correctAnswer: snap.result,
        };
      }
      if (snap?.operation === 'division') {
        return {
          ...base,
          questionStyle: 'word_problem',
          questionText: buildWordProblemText(
            'division',
            snap.dividend,
            snap.divisor,
            snap.quotient,
          ),
          correctAnswer: snap.quotient,
        };
      }
    }
    return { ...base, questionStyle: style === 'word_problem' ? 'word_problem' : 'standard' };
  }

  const snap = base.operandSnapshot ?? snapshotFromStandardDraft(draft);

  if (style === 'missing_number' && snap) {
    const mn = buildMissingNumber(snap);
    if (mn) {
      return {
        ...base,
        questionStyle: 'missing_number',
        questionText: mn.questionText,
        correctAnswer: mn.correctAnswer,
        answerKind: 'number',
      };
    }
  }

  return base;
}
