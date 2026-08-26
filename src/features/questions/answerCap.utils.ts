import type {
  MathLearningConfig,
  MathOperation,
} from '@/features/learning-plan/learningPlan.types';

const MC_DISTRACTOR_UNLIMITED_SPREAD = 1_000_000;

export function operationAllowsNegativeResults(
  config: MathLearningConfig,
  operation: MathOperation,
): boolean {
  switch (operation) {
    case 'addition':
      return config.addition.allowNegativeNumbers;
    case 'subtraction':
      return config.subtraction.allowNegativeAnswers || config.subtraction.allowNegativeNumbers;
    case 'multiplication':
      return config.multiplication.allowNegativeNumbers;
    case 'division':
      return config.division.allowNegativeNumbers;
    case 'square':
    case 'square_root':
    case 'rounding':
    case 'order_of_operations':
    case 'equivalent_expressions':
      return false;
    case 'geometry':
    case 'comparison':
    case 'fraction_visual':
    case 'shape_recognition':
    case 'number_sense':
    case 'clock':
    case 'pattern':
    case 'differentiation':
    case 'integration':
    case 'trigonometry':
    case 'logarithm':
    case 'advanced_equations':
    case 'limits':
      return false;
  }
}

/** Keeps multiple-choice distractors inside the same band as valid final answers. */
export function getAnswerDistractorBounds(
  config: MathLearningConfig,
  operation: MathOperation = 'addition',
): { min: number; max: number } {
  if (operation !== 'addition') {
    if (operationAllowsNegativeResults(config, operation)) {
      return { min: -MC_DISTRACTOR_UNLIMITED_SPREAD, max: MC_DISTRACTOR_UNLIMITED_SPREAD };
    }
    return { min: 0, max: MC_DISTRACTOR_UNLIMITED_SPREAD };
  }
  if (config.addition.answerMax === 'unlimited') {
    if (operationAllowsNegativeResults(config, 'addition')) {
      return { min: -MC_DISTRACTOR_UNLIMITED_SPREAD, max: MC_DISTRACTOR_UNLIMITED_SPREAD };
    }
    return { min: 0, max: MC_DISTRACTOR_UNLIMITED_SPREAD };
  }
  const cap = config.addition.answerMax;
  if (config.addition.allowNegativeNumbers) {
    return { min: -cap, max: cap };
  }
  return { min: 0, max: cap };
}

export function isAnswerWithinFinalResultCap(
  answer: number,
  config: MathLearningConfig,
  operation: MathOperation = 'addition',
): boolean {
  if (operation !== 'addition') return true;
  if (config.addition.answerMax === 'unlimited') return true;
  const cap = config.addition.answerMax;
  if (config.addition.allowNegativeNumbers) {
    return answer >= -cap && answer <= cap;
  }
  return answer >= 0 && answer <= cap;
}
