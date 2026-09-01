import { clampProfileAge } from '@/features/onboarding/profile.utils';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import {
  DEFAULT_MATH_KNOWLEDGE_LEVEL,
  clampMathKnowledgeLevel,
} from '@/constants/mathKnowledge';
import { getAgeBracket } from '@/constants/ageDefaults';
import {
  getAgeBracketLearningPlan,
  PLAN_NEUTRAL_DEFAULT,
} from '@/features/learning-plan/recommendedLearningPlan';

export type RecommendedPlanInput = {
  age?: number | null;
  mathKnowledgeLevel?: number | null;
};

/** Maps knowledge 1–5 to a shift on the age-based plan (−2 … +2 brackets). */
function knowledgeAgeOffset(level: number): number {
  return (clampMathKnowledgeLevel(level) - DEFAULT_MATH_KNOWLEDGE_LEVEL) * 2;
}

function effectivePlanAge(age: number | null, knowledge: number | null): number | null {
  if (age == null && knowledge == null) return null;

  const baseAge = age ?? 8;
  const offset = knowledge == null ? 0 : knowledgeAgeOffset(knowledge);
  return clampProfileAge(baseAge + offset);
}

export function buildRecommendedLearningPlan(
  input?: number | RecommendedPlanInput | null,
): MathLearningConfig {
  if (typeof input === 'number') {
    return getAgeBracketLearningPlan(getAgeBracket(input));
  }

  const age = input?.age ?? null;
  const knowledge = input?.mathKnowledgeLevel ?? null;
  const planAge = effectivePlanAge(age, knowledge);

  if (planAge == null) {
    return { ...PLAN_NEUTRAL_DEFAULT };
  }

  return getAgeBracketLearningPlan(getAgeBracket(planAge));
}
