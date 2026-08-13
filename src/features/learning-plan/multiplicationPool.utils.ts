import {
  ONE_TO_TEN_NUMBERS,
  ONE_TO_TWENTY_NUMBERS,
  type MultiplicationSecondFactorSource,
} from '@/features/learning-plan/learningPlan.types';

export function getMultiplicationSecondFactorPool(
  factors: number[],
  source: MultiplicationSecondFactorSource,
): number[] {
  switch (source) {
    case 'selection_only':
      return factors;
    case 'one_to_ten':
      return [...ONE_TO_TEN_NUMBERS];
    case 'one_to_twenty':
      return [...ONE_TO_TWENTY_NUMBERS];
    default: {
      const _exhaustive: never = source;
      return _exhaustive;
    }
  }
}
