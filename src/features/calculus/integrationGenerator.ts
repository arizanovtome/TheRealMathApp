import type { CalculusSubtype } from '@/features/calculus/calculus.types';
import { getEnabledCalculusSubtypes } from '@/features/calculus/calculusConfig.utils';
import {
  buildCalculusMcOptions,
  formatSumExpression,
  integralOfSum,
  integralPowerDistractors,
  pickDistinctPowerTerms,
  pickIntegrationFractionTerms,
  pickRandomTrigFn,
  quotientIntegralDistractors,
  randomConstant,
  randomCoefficient,
  randomPowerExponent,
  trigIntegralDistractors,
} from '@/features/calculus/calculusExpression.utils';
import {
  formatCoefficientTimesPower,
  formatCoefficientTimesTrig,
  formatIntegralConstantAnswer,
  formatIntegralPowerAnswer,
  formatIntegralPrompt,
  formatIntegralQuotientAnswer,
  formatIntegralTrigAnswer,
  formatPower,
  formatQuotientFraction,
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

function generateNaturalLogRule(config: MathLearningConfig): Omit<CalculusMathQuestion, 'id'> {
  return buildQuestion(config, formatIntegralPrompt('1/x'), 'ln x + C', [
    'ln x + C',
    '1/x + C',
    'x + C',
    'ln x',
    '−1/x² + C',
    '1/x² + C',
  ]);
}

function generateTrigRule(config: MathLearningConfig): Omit<CalculusMathQuestion, 'id'> {
  const fn = pickRandomTrigFn();
  const coefficient = randomCoefficient();
  const inner = formatCoefficientTimesTrig(coefficient, fn);
  const correctAnswer = formatIntegralTrigAnswer(fn, coefficient);
  return buildQuestion(
    config,
    formatIntegralPrompt(inner),
    correctAnswer,
    trigIntegralDistractors(fn, coefficient),
  );
}

function generateQuotientRule(config: MathLearningConfig): Omit<CalculusMathQuestion, 'id'> {
  const { numeratorCoeff, numeratorExp, denominatorExp } = pickIntegrationFractionTerms();
  const inner = formatQuotientFraction(numeratorCoeff, numeratorExp, denominatorExp);
  const correctAnswer = formatIntegralQuotientAnswer(
    numeratorCoeff,
    numeratorExp,
    denominatorExp,
  );
  return buildQuestion(
    config,
    formatIntegralPrompt(inner),
    correctAnswer,
    quotientIntegralDistractors(numeratorCoeff, numeratorExp, denominatorExp),
  );
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
    case 'natural_log_rule':
      return generateNaturalLogRule(config);
    case 'trig_rule':
      return generateTrigRule(config);
    case 'quotient_rule':
      return generateQuotientRule(config);
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
