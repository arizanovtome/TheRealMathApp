import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';

describe('getRecommendedLearningPlan', () => {
  it('returns small addition-focused defaults for ages 4–5', () => {
    const plan = getRecommendedLearningPlan(4);
    expect(plan.addition.enabled).toBe(true);
    expect(plan.subtraction.enabled).toBe(false);
    expect(plan.questionsCount).toBe(5);
    expect(plan.answerEntryMode).toBe('multiple_choice');
    expect(plan.answerOptionsCount).toBe(2);
    expect(plan.maxFinalResult).toBe(10);
    expect(plan.timedDurationMinutes).toBe(1);
    expect(plan.timedWrongPenaltySeconds).toBe(5);
    expect(plan.timedCorrectBonusSeconds).toBe(2);
  });

  it('enables multiplication and division for ages 10–12', () => {
    const plan = getRecommendedLearningPlan(12);
    expect(plan.multiplication.enabled).toBe(true);
    expect(plan.division.enabled).toBe(true);
    expect(plan.answerEntryMode).toBe('multiple_choice');
    expect(plan.answerOptionsCount).toBe(4);
    expect(plan.maxFinalResult).toBe(1000);
  });
});
