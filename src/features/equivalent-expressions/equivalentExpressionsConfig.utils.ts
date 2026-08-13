import type { EquivalentExpressionSubtype } from './equivalentExpressions.types';
import type { EquivalentExpressionsConfig, MathLearningConfig } from '@/features/learning-plan/learningPlan.types';

export function getEnabledEquivalentExpressionSubtypes(
  config: MathLearningConfig,
): EquivalentExpressionSubtype[] {
  const c = config.equivalentExpressions;
  if (!c.enabled) return [];
  const result: EquivalentExpressionSubtype[] = [];
  if (c.squareOfSum) result.push('square_of_sum');
  if (c.squareOfDifference) result.push('square_of_difference');
  if (c.parenthesesAfterAddition) result.push('parentheses_after_addition');
  if (c.parenthesesAfterSubtraction) result.push('parentheses_after_subtraction');
  if (c.distributiveProperty) result.push('distributive_property');
  if (c.differenceOfSquares) result.push('difference_of_squares');
  if (c.factorization) result.push('factorization');
  return result;
}

export function hasEquivalentExpressionsSource(config: MathLearningConfig): boolean {
  return getEnabledEquivalentExpressionSubtypes(config).length > 0;
}

export function hasAnyEquivalentExpressionSubtype(c: EquivalentExpressionsConfig): boolean {
  return (
    c.squareOfSum ||
    c.squareOfDifference ||
    c.parenthesesAfterAddition ||
    c.parenthesesAfterSubtraction ||
    c.distributiveProperty ||
    c.differenceOfSquares ||
    c.factorization
  );
}
