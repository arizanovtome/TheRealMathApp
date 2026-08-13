import type { MathOperation } from '@/features/learning-plan/learningPlan.types';
import { operationLabel } from '@/i18n/labels';
import type { TFunction } from 'i18next';

/** @deprecated Use operationLabel(operation, t) instead */
export const OPERATION_LABELS: Record<MathOperation, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
  square: 'Squaring',
  square_root: 'Square roots',
  rounding: 'Rounding',
  order_of_operations: 'Order of operations (× before +)',
  equivalent_expressions: 'Equivalent expressions',
  geometry: 'Geometry',
  comparison: 'Comparison',
  fraction_visual: 'Fraction recognition',
  shape_recognition: 'Shape recognition',
  number_sense: 'Numbers',
  clock: 'Clock / time',
  pattern: 'Patterns & sequences',
  differentiation: 'Differentiation',
  integration: 'Integration',
  trigonometry: 'Trigonometry',
};

export function getOperationLabel(operation: MathOperation, t: TFunction): string {
  return operationLabel(operation, t);
}
