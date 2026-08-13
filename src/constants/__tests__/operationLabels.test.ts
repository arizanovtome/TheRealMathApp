import { OPERATION_LABELS } from '@/constants/operationLabels';
import { ALL_MATH_OPERATIONS } from '@/features/learning-plan/learningPlan.types';

describe('OPERATION_LABELS', () => {
  it('has a label for every MathOperation', () => {
    for (const op of ALL_MATH_OPERATIONS) {
      expect(OPERATION_LABELS[op]).toBeTruthy();
    }
    expect(Object.keys(OPERATION_LABELS).sort()).toEqual([...ALL_MATH_OPERATIONS].sort());
  });
});
