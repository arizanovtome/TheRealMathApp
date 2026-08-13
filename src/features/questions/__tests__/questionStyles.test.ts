import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { applyQuestionStyle } from '@/features/questions/questionStyles';
import { generateArithmeticDraft } from '@/features/questions/questionGenerator';

describe('questionStyles', () => {
  const base = getRecommendedLearningPlan(8);

  it('builds missing-number addition from a standard draft', () => {
    const draft = {
      operation: 'addition' as const,
      questionText: '7 + 4 = ?',
      correctAnswer: 11,
      operandSnapshot: { operation: 'addition' as const, left: 7, right: 4, result: 11 },
    };
    const styled = applyQuestionStyle(draft, 'missing_number', base);
    expect(styled.questionStyle).toBe('missing_number');
    expect(styled.questionText).toMatch(/\?/);
    expect(styled.questionText).toContain('11');
    expect(styled.answerKind).toBe('number');
    expect([4, 7]).toContain(styled.correctAnswer);
  });

  it('hides exactly one operand in binary missing-number questions', () => {
    const drafts = [
      {
        operation: 'addition' as const,
        questionText: '7 + 4 = ?',
        correctAnswer: 11,
        operandSnapshot: { operation: 'addition' as const, left: 7, right: 4, result: 11 },
      },
      {
        operation: 'subtraction' as const,
        questionText: '9 − 3 = ?',
        correctAnswer: 6,
        operandSnapshot: { operation: 'subtraction' as const, first: 9, second: 3, result: 6 },
      },
      {
        operation: 'multiplication' as const,
        questionText: '6 × 5 = ?',
        correctAnswer: 30,
        operandSnapshot: { operation: 'multiplication' as const, left: 6, right: 5, result: 30 },
      },
    ];

    for (const draft of drafts) {
      for (let attempt = 0; attempt < 20; attempt++) {
        const styled = applyQuestionStyle(draft, 'missing_number', base);
        expect(styled.questionText.match(/\?/g)).toHaveLength(1);
      }
    }
  });

  it('builds word problem text for addition', () => {
    const draft = generateArithmeticDraft(base, 'addition');
    const styled = applyQuestionStyle(draft, 'word_problem', base);
    expect(styled.questionStyle).toBe('word_problem');
    expect(styled.questionText.length).toBeGreaterThan(10);
    expect(styled.questionText).not.toContain('= ?');
  });
});
