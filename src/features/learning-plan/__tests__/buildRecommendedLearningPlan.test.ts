import { buildRecommendedLearningPlan } from '@/features/learning-plan/buildRecommendedLearningPlan';
import {
  getAgeBracketLearningPlan,
  PLAN_NEUTRAL_DEFAULT,
} from '@/features/learning-plan/recommendedLearningPlan';

describe('buildRecommendedLearningPlan', () => {
  it('uses neutral defaults when age and knowledge are both unset', () => {
    const plan = buildRecommendedLearningPlan({ age: null, mathKnowledgeLevel: null });
    expect(plan).toEqual(PLAN_NEUTRAL_DEFAULT);
  });

  it('uses age bracket when only age is set', () => {
    const plan = buildRecommendedLearningPlan({ age: 12, mathKnowledgeLevel: null });
    expect(plan).toEqual(getAgeBracketLearningPlan('10-12'));
  });

  it('shifts plan up when knowledge is high and age is missing', () => {
    const plan = buildRecommendedLearningPlan({ age: null, mathKnowledgeLevel: 5 });
    expect(plan).toEqual(getAgeBracketLearningPlan('10-12'));
  });

  it('shifts plan down when knowledge is low and age is missing', () => {
    const plan = buildRecommendedLearningPlan({ age: null, mathKnowledgeLevel: 1 });
    expect(plan).toEqual(getAgeBracketLearningPlan('4-5'));
  });

  it('combines age with knowledge offset', () => {
    const plan = buildRecommendedLearningPlan({ age: 8, mathKnowledgeLevel: 5 });
    expect(plan).toEqual(getAgeBracketLearningPlan('10-12'));
  });

  it('accepts a bare age number for backwards compatibility', () => {
    const plan = buildRecommendedLearningPlan(8);
    expect(plan).toEqual(getAgeBracketLearningPlan('8-9'));
  });
});
