import type { MathQuestion } from '@/features/questions/question.types';
import {
  isArithmeticQuestion,
  isEquationTwoUnknownQuestion,
  isEquationUnknownQuestion,
  isFractionQuestion,
  isFractionVisualQuestion,
  isGeometryQuestion,
} from '@/features/questions/question.types';
import type { AnswerInputKind } from '@/utils/answerInputKeyboard';

export function answerInputKindForQuestion(q: MathQuestion): AnswerInputKind {
  if (isEquationUnknownQuestion(q)) return 'equation';
  if (
    (isArithmeticQuestion(q) && isFractionQuestion(q)) ||
    isFractionVisualQuestion(q)
  ) return 'fraction';
  return 'numeric';
}

export function geometryUsesNumericInput(q: MathQuestion): boolean {
  return isGeometryQuestion(q) && q.answerKind === 'number';
}

export function questionUsesNumericInput(q: MathQuestion): boolean {
  return (
    answerInputKindForQuestion(q) === 'numeric' ||
    geometryUsesNumericInput(q) ||
    isEquationTwoUnknownQuestion(q)
  );
}
