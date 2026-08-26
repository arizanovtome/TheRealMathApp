import type { MathOperation } from '@/features/learning-plan/learningPlan.types';

/** Canonical configurable curriculum sections, shared by Settings and Learn. */
export const CURRICULUM_SECTION_IDS_EASIEST_TO_HARDEST = [
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
  'equations_xy',
  'advanced_equations',
  'trigonometry',
  'logarithm',
  'limits',
  'differentiation',
  'integration',
] as const;

export type CurriculumSectionId = (typeof CURRICULUM_SECTION_IDS_EASIEST_TO_HARDEST)[number];

/** Backward-compatible name used by the Learn registry. */
export const LEARN_TOPIC_IDS_EASIEST_TO_HARDEST = CURRICULUM_SECTION_IDS_EASIEST_TO_HARDEST;
export type LearnTopicIdFromOrder = CurriculumSectionId;

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
  advanced_equations: 'advanced_equations',
  limits: 'limits',
} as const satisfies Partial<Record<MathOperation, LearnTopicIdFromOrder>>;
