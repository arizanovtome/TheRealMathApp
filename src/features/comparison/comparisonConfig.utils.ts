import type { ComparisonSubtype } from '@/features/comparison/comparison.types';
import type { ComparisonConfig, MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { getMultiplicationSecondFactorPool } from '@/features/learning-plan/multiplicationPool.utils';

export function hasComparisonQuestionSource(config: MathLearningConfig): boolean {
  return config.comparison.enabled && getEnabledComparisonSubtypes(config).length > 0;
}

export function getEnabledComparisonSubtypes(config: MathLearningConfig): ComparisonSubtype[] {
  if (!config.comparison.enabled) return [];
  const subtypes: ComparisonSubtype[] = [];
  const c = config.comparison;

  if (c.relational) subtypes.push('relational');
  if (c.ordering) subtypes.push('ordering');
  if (c.expressionCompare && getExpressionCompareOperations(config).length > 0) {
    subtypes.push('expression');
  }
  if (c.fractionVsDecimal) subtypes.push('fraction_vs_decimal');
  if (c.percentVsFraction) subtypes.push('percent_vs_fraction');
  if (c.fractionVsFraction) subtypes.push('fraction_vs_fraction');
  if (c.measurementUnitConversion) subtypes.push('measurement');

  return subtypes;
}

export function hasAnyComparisonSubtypeToggle(c: ComparisonConfig): boolean {
  return (
    c.relational ||
    c.ordering ||
    c.expressionCompare ||
    c.fractionVsDecimal ||
    c.percentVsFraction ||
    c.fractionVsFraction ||
    c.measurementUnitConversion
  );
}

/** Basic ops that can appear in expression-compare questions. */
export function getExpressionCompareOperations(
  config: MathLearningConfig,
): ('addition' | 'subtraction' | 'multiplication' | 'division')[] {
  const ops: ('addition' | 'subtraction' | 'multiplication' | 'division')[] = [];
  if (config.addition.enabled) ops.push('addition');
  if (config.subtraction.enabled) ops.push('subtraction');
  if (config.multiplication.enabled) ops.push('multiplication');
  if (config.division.enabled) ops.push('division');
  return ops;
}

/** Union of sensible integer bounds from enabled operations for comparison numbers. */
export function getComparisonNumberBounds(config: MathLearningConfig): { min: number; max: number } {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let found = false;

  const consider = (lo: number, hi: number) => {
    if (lo > hi) return;
    found = true;
    min = Math.min(min, lo);
    max = Math.max(max, hi);
  };

  if (config.addition.enabled) {
    consider(config.addition.leftMin, config.addition.leftMax);
    consider(config.addition.rightMin, config.addition.rightMax);
  }
  if (config.subtraction.enabled) {
    consider(config.subtraction.firstMin, config.subtraction.firstMax);
    consider(config.subtraction.secondMin, config.subtraction.secondMax);
  }
  if (config.multiplication.enabled) {
    for (const f of config.multiplication.factors) {
      consider(f, f);
    }
    const secondPool = getMultiplicationSecondFactorPool(
      config.multiplication.factors,
      config.multiplication.secondFactorSource,
    );
    for (const s of secondPool) {
      consider(s, s);
    }
  }
  if (config.division.enabled) {
    consider(config.division.answerMin, config.division.answerMax);
    for (const d of config.division.divisors) {
      consider(d, d);
    }
  }
  if (config.square.enabled) {
    consider(1, config.square.operandMax);
  }
  if (config.squareRoot.enabled) {
    consider(1, config.squareRoot.rootMax);
  }
  if (config.orderOfOperations.enabled) {
    consider(1, config.orderOfOperations.operandMax);
  }

  if (!found) {
    return { min: 1, max: 20 };
  }
  return { min, max };
}
