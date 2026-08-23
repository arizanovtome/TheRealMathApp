import type { MathOperation } from '@/features/learning-plan/learningPlan.types';

/** Learn topics and settings sections: easiest → hardest. */
export const LEARN_TOPIC_IDS_EASIEST_TO_HARDEST = [
  'shapes',
  'numbers',
  'patterns',
  'clock',
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'comparison',
  'rounding',
  'fractions',
  'squaring',
  'square_roots',
  'geometry',
  'order_of_operations',
  'equivalent_expressions',
  'equations_x',
  'equations_xy',
  'trigonometry',
  'logarithm',
  'differentiation',
  'integration',
] as const;

export type LearnTopicIdFromOrder = (typeof LEARN_TOPIC_IDS_EASIEST_TO_HARDEST)[number];

/** Explicit bridge where Learn URL IDs differ from question-operation IDs. */
export const LEARN_TOPIC_ID_BY_OPERATION = {
  addition: 'addition',
  subtraction: 'subtraction',
  multiplication: 'multiplication',
  division: 'division',
  square: 'squaring',
  square_root: 'square_roots',
  rounding: 'rounding',
  order_of_operations: 'order_of_operations',
  equivalent_expressions: 'equivalent_expressions',
  geometry: 'geometry',
  comparison: 'comparison',
  fraction_visual: 'fractions',
  shape_recognition: 'shapes',
  number_sense: 'numbers',
  clock: 'clock',
  pattern: 'patterns',
  differentiation: 'differentiation',
  integration: 'integration',
  trigonometry: 'trigonometry',
  logarithm: 'logarithm',
} as const satisfies Partial<Record<MathOperation, LearnTopicIdFromOrder>>;
