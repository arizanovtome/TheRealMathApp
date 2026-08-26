import {
  buildPracticeSessionResult,
  buildQuizSessionResult,
  buildSessionResult,
  buildTimedSessionResult,
  answerOptionsArePlainNumbers,
  computeScorePercentage,
  chosenAnswerDisplayLabel,
  correctAnswerDisplayLabel,
  submittedAnswerIsCorrect,
} from '@/features/questions/questionScoring';
import type { MathQuestion } from '@/features/questions/question.types';

describe('questionScoring', () => {
  it('uses the compact answer grid for numbers and simple fractions only', () => {
    const limit = (answerOptions: string[]): MathQuestion => ({
      kind: 'limit',
      id: 'limit-layout',
      operation: 'limits',
      subtype: 'rationalization',
      questionText: 'limit',
      correctAnswer: answerOptions[0]!,
      answerOptions,
      requiresMultipleChoice: true,
      approach: '0',
      expression: 'x',
    });

    expect(answerOptionsArePlainNumbers(limit(['8', '1/4', '0', '1/8']))).toBe(true);
    expect(answerOptionsArePlainNumbers(limit(['sin θ', 'cos θ']))).toBe(false);
  });

  it('computes rounded percentages', () => {
    expect(computeScorePercentage(8, 10)).toBe(80);
    expect(computeScorePercentage(0, 10)).toBe(0);
  });

  it('builds practice session summaries with operation stats', () => {
    const questions: MathQuestion[] = Array.from({ length: 10 }, (_, i) => ({
      kind: 'arithmetic' as const,
      id: `q-${i}`,
      operation: 'addition' as const,
      questionStyle: 'standard' as const,
      answerKind: 'number' as const,
      questionText: `${i} + 1 = ?`,
      correctAnswer: i + 1,
      answerOptions: [],
    }));
    const answers = questions.map((_, i) => (i < 7 ? i + 1 : 0));
    const result = buildPracticeSessionResult(questions, answers);
    expect(result.totalQuestions).toBe(10);
    expect(result.correctAnswers).toBe(7);
    expect(result.wrongAnswers).toBe(3);
    expect(result.scorePercentage).toBe(70);
    expect(result.sessionMode).toBe('practice');
    expect(result.quizQuestionOutcomes).toBeUndefined();
    expect(result.operationStats?.addition).toEqual({ attempted: 10, wrong: 3 });
  });

  it('buildSessionResult legacy helper omits operation stats', () => {
    expect(buildSessionResult(4, 5)).toMatchObject({
      correctAnswers: 4,
      totalQuestions: 5,
      scorePercentage: 80,
      sessionMode: 'practice',
    });
  });

  it('builds quiz outcomes with traffic-light data', () => {
    const questions: MathQuestion[] = [
      {
        kind: 'arithmetic',
        id: '1',
        operation: 'addition',
        questionStyle: 'standard',
        answerKind: 'number',
        questionText: '1 + 1 = ?',
        correctAnswer: 2,
        answerOptions: [1, 2, 3, 4],
      },
      {
        kind: 'arithmetic',
        id: '2',
        operation: 'addition',
        questionStyle: 'standard',
        answerKind: 'number',
        questionText: '2 + 2 = ?',
        correctAnswer: 4,
        answerOptions: [3, 4, 5, 6],
      },
    ];
    const answers = [2, 3];
    const result = buildQuizSessionResult(questions, answers);
    expect(result.sessionMode).toBe('quiz');
    expect(result.correctAnswers).toBe(1);
    expect(result.wrongAnswers).toBe(1);
    expect(result.scorePercentage).toBe(50);
    expect(result.quizQuestionOutcomes).toHaveLength(2);
    expect(result.quizQuestionOutcomes![0]).toMatchObject({
      isCorrect: true,
      chosenAnswer: 2,
      chosenAnswerLabel: '2',
      correctAnswer: 2,
      correctAnswerLabel: '2',
    });
    expect(result.quizQuestionOutcomes![1]).toMatchObject({
      isCorrect: false,
      chosenAnswer: 3,
      chosenAnswerLabel: '3',
      correctAnswer: 4,
      correctAnswerLabel: '4',
    });
    expect(result.operationStats?.addition).toEqual({ attempted: 2, wrong: 1 });
  });

  it('scores fraction answers from decimal or fraction strings', () => {
    const q: MathQuestion = {
      kind: 'arithmetic',
      id: 'f1',
      operation: 'addition',
      questionStyle: 'fraction',
      answerKind: 'fraction',
      questionText: '1/4 + 2/4 = ?',
      correctAnswer: 0,
      correctFraction: { numerator: 3, denominator: 4 },
      answerOptions: ['1/2', '3/4', '2/3', '5/8'],
    };
    expect(submittedAnswerIsCorrect(q, '3/4')).toBe(true);
    expect(submittedAnswerIsCorrect(q, '6/8')).toBe(true);
    expect(submittedAnswerIsCorrect(q, '0.75')).toBe(true);
    expect(submittedAnswerIsCorrect(q, '1/2')).toBe(false);
    expect(correctAnswerDisplayLabel(q)).toBe('3/4');
  });

  it('scores number-sense string answers directly', () => {
    const q: MathQuestion = {
      kind: 'number_sense',
      id: 'number-sense-1',
      operation: 'number_sense',
      subtype: 'oddEven',
      questionText: 'Is 0 odd or even?',
      correctAnswer: 'Even',
      answerOptions: ['Even', 'Odd'],
      requiresMultipleChoice: true,
    };

    expect(submittedAnswerIsCorrect(q, 'Even')).toBe(true);
    expect(submittedAnswerIsCorrect(q, 'Odd')).toBe(false);
    expect(chosenAnswerDisplayLabel(q, 'Even')).toBe('Even');
  });

  it('scores quantity-comparison answers directly', () => {
    const q: MathQuestion = {
      kind: 'number_sense',
      id: 'number-sense-2',
      operation: 'number_sense',
      subtype: 'compareQuantities',
      questionText: 'Which group has more?',
      correctAnswer: 'Group B',
      answerOptions: ['Group A', 'Group B', 'Same'],
      requiresMultipleChoice: true,
    };

    expect(submittedAnswerIsCorrect(q, 'Group B')).toBe(true);
    expect(submittedAnswerIsCorrect(q, 'Group A')).toBe(false);
  });

  it('builds timed session like quiz but tags sessionMode timed', () => {
    const questions: MathQuestion[] = [
      {
        kind: 'arithmetic',
        id: '1',
        operation: 'addition',
        questionStyle: 'standard',
        answerKind: 'number',
        questionText: '1 + 1 = ?',
        correctAnswer: 2,
        answerOptions: [1, 2, 3, 4],
      },
    ];
    const result = buildTimedSessionResult(questions, [2]);
    expect(result.sessionMode).toBe('timed');
    expect(result.correctAnswers).toBe(1);
    expect(result.quizQuestionOutcomes).toHaveLength(1);
  });
});
