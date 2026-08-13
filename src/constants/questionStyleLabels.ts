import type { QuestionStyle } from '@/features/learning-plan/learningPlan.types';
import { questionStyleLabel } from '@/i18n/labels';
import type { TFunction } from 'i18next';

/** @deprecated Use getQuestionStyleLabel(style, t) instead */
export const QUESTION_STYLE_LABELS: Record<QuestionStyle, string> = {
  standard: 'Standard calculation',
  missing_number: 'Missing number',
  fraction: 'Fractions',
  word_problem: 'Word problems',
};

/** @deprecated English-only hints; use settings copy via i18n where needed */
export const QUESTION_STYLE_HINTS: Record<QuestionStyle, string> = {
  standard: 'Classic problems like 8 + 5 = ?',
  missing_number: 'Find the hidden number, e.g. 8 + ? = 13',
  fraction: 'Calculate with fractions, e.g. 1/4 + 2/4 = ?',
  word_problem: 'Short story problems using your number ranges',
};

export function getQuestionStyleLabel(style: QuestionStyle, t: TFunction): string {
  return questionStyleLabel(style, t);
}
