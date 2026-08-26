import type { MathQuestion } from '@/features/questions/question.types';
import { usesCompactQuestionCard } from '@/features/questions/question.types';

function arithmeticQuestion(answerOptions: number[]): MathQuestion {
  return {
    kind: 'arithmetic',
    id: 'layout-test',
    operation: 'addition',
    questionStyle: 'standard',
    answerKind: 'number',
    questionText: '7 + 7 = ?',
    correctAnswer: 14,
    answerOptions,
  };
}

describe('question-card layout', () => {
  it('uses the compact card when four or more answers need vertical space', () => {
    expect(usesCompactQuestionCard(arithmeticQuestion([12, 13, 14]))).toBe(false);
    expect(usesCompactQuestionCard(arithmeticQuestion([11, 12, 13, 14]))).toBe(true);
  });
});
