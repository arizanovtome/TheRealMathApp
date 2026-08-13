import type { CalculusSubtype } from '@/features/calculus/calculus.types';
import { getEnabledCalculusSubtypes } from '@/features/calculus/calculusConfig.utils';
import {
  buildCalculusMcOptions,
  formatSumExpression,
  integralOfSum,
  integralPowerDistractors,
  pickDistinctPowerTerms,
  randomConstant,
  randomCoefficient,
  randomPowerExponent,
} from '@/features/calculus/calculusExpression.utils';
import {
  formatCoefficientTimesPower,
  formatIntegralConstantAnswer,
  formatIntegralPowerAnswer,
  formatIntegralPrompt,
  formatPower,
} from '@/features/calculus/calculusFormat';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import type { CalculusMathQuestion } from '@/features/questions/question.types';
import { pickRandom } from '@/utils/random';

function buildQuestion(
  config: MathLearningConfig,
  questionText: string,
  correctAnswer: string,
  distractors: string[],
): Omit<CalculusMathQuestion, 'id'> {
  return {
    kind: 'calculus',
    operation: 'integration',
    questionText,
    correctAnswer,
    answerOptions: buildCalculusMcOptions(
      correctAnswer,
      distractors,
      config.answerOptionsCount,
    ),
    requiresMultipleChoice: true,
  };
}

function generatePowerRule(config: MathLearningConfig): Omit<CalculusMathQuestion, 'id'> {
  const coefficient = randomCoefficient();
  const exponent = randomPowerExponent();
  const inner = formatCoefficientTimesPower(coefficient, exponent);
  const correctAnswer = formatIntegralPowerAnswer(coefficient, exponent);
  return buildQuestion(
    config,
    formatIntegralPrompt(inner),
    correctAnswer,
    integralPowerDistractors(coefficient, exponent),
  );
}

function generateConstantRule(config: MathLearningConfig): Omit<CalculusMathQuestion, 'id'> {
  const constant = randomConstant();
  const inner = String(constant);
  const correctAnswer = formatIntegralConstantAnswer(constant);
  return buildQuestion(config, formatIntegralPrompt(inner), correctAnswer, [
    correctAnswer,
    `${constant} + C`,
    `${constant}x`,
    `${constant}x²/2 + C`,
    '0',
  ]);
}

function generateSimpleSum(config: MathLearningConfig): Omit<CalculusMathQuestion, 'id'> {
  const terms = pickDistinctPowerTerms(2);
  const inner = formatSumExpression(terms);
  const correctAnswer = integralOfSum(terms);
  const distractors = [
    correctAnswer,
    integralOfSum([terms[0]!]),
    integralOfSum([terms[1]!]),
    formatIntegralPowerAnswer(terms[0]!.coefficient, terms[0]!.exponent),
    formatCoefficientTimesPower(terms[0]!.coefficient, terms[0]!.exponent + 1),
  ];
  return buildQuestion(config, formatIntegralPrompt(inner), correctAnswer, distractors);
}

function generateForSubtype(
  config: MathLearningConfig,
  subtype: CalculusSubtype,
): Omit<CalculusMathQuestion, 'id'> {
  switch (subtype) {
    case 'power_rule':
      return generatePowerRule(config);
    case 'constant_rule':
      return generateConstantRule(config);
    case 'simple_sum':
      return generateSimpleSum(config);
  }
}

export function tryGenerateIntegrationQuestion(
  config: MathLearningConfig,
): Omit<CalculusMathQuestion, 'id'> | null {
  const subtypes = getEnabledCalculusSubtypes(config.integration);
  if (subtypes.length === 0) return null;
  const subtype = pickRandom(subtypes);
  return generateForSubtype(config, subtype);
}

/** Exported for tests — bare ∫ x^n dx. */
export function generateBasicPowerIntegral(
  config: MathLearningConfig,
): Omit<CalculusMathQuestion, 'id'> {
  const exponent = randomPowerExponent();
  const inner = formatPower('x', exponent);
  const correctAnswer = formatIntegralPowerAnswer(1, exponent);
  return buildQuestion(
    config,
    formatIntegralPrompt(inner),
    correctAnswer,
    integralPowerDistractors(1, exponent),
  );
}
