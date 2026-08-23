import type { CalculusSubtype } from '@/features/calculus/calculus.types';
import { getEnabledCalculusSubtypes } from '@/features/calculus/calculusConfig.utils';
import {
  buildCalculusMcOptions,
  derivativeOfSum,
  differentiationQuotientDistractors,
  formatSumExpression,
  pickDifferentiationQuotientSpec,
  pickDistinctPowerTerms,
  pickRandomPowerTerm,
  pickRandomTrigFn,
  powerRuleDistractors,
  randomConstant,
  randomCoefficient,
  randomPowerExponent,
  trigDerivativeDistractors,
} from '@/features/calculus/calculusExpression.utils';
import {
  formatCoefficientTimesPower,
  formatCoefficientTimesTrig,
  formatDerivativePowerAnswer,
  formatDerivativePrompt,
  formatDerivativeTrigAnswer,
  formatDifferentiationQuotientAnswer,
  formatDifferentiationQuotientExpression,
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
    operation: 'differentiation',
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
  const correctAnswer = formatDerivativePowerAnswer(coefficient, exponent);
  return buildQuestion(
    config,
    formatDerivativePrompt(inner),
    correctAnswer,
    powerRuleDistractors(coefficient, exponent),
  );
}

function generateConstantRule(config: MathLearningConfig): Omit<CalculusMathQuestion, 'id'> {
  const constant = randomConstant();
  const inner = String(constant);
  return buildQuestion(config, formatDerivativePrompt(inner), '0', [
    '0',
    String(constant),
    `${constant}x`,
    '1',
    'x',
  ]);
}

function generateSimpleSum(config: MathLearningConfig): Omit<CalculusMathQuestion, 'id'> {
  const terms = pickDistinctPowerTerms(2);
  const inner = formatSumExpression(terms);
  const correctAnswer = derivativeOfSum(terms);
  const distractors = [
    correctAnswer,
    derivativeOfSum([terms[0]!]),
    derivativeOfSum([terms[1]!]),
    formatCoefficientTimesPower(terms[0]!.coefficient, terms[0]!.exponent),
    '0',
  ];
  return buildQuestion(config, formatDerivativePrompt(inner), correctAnswer, distractors);
}

function generateNaturalLogRule(config: MathLearningConfig): Omit<CalculusMathQuestion, 'id'> {
  return buildQuestion(config, formatDerivativePrompt('ln x'), '1/x', [
    '1/x',
    'x',
    '1',
    'ln x',
    '1/x²',
    '0',
  ]);
}

function generateTrigRule(config: MathLearningConfig): Omit<CalculusMathQuestion, 'id'> {
  const fn = pickRandomTrigFn();
  const coefficient = randomCoefficient();
  const inner = formatCoefficientTimesTrig(coefficient, fn);
  const correctAnswer = formatDerivativeTrigAnswer(fn, coefficient);
  return buildQuestion(
    config,
    formatDerivativePrompt(inner),
    correctAnswer,
    trigDerivativeDistractors(fn, coefficient),
  );
}

function generateQuotientRule(config: MathLearningConfig): Omit<CalculusMathQuestion, 'id'> {
  const spec = pickDifferentiationQuotientSpec();
  const inner = formatDifferentiationQuotientExpression(spec);
  const correctAnswer = formatDifferentiationQuotientAnswer(spec);
  return buildQuestion(
    config,
    formatDerivativePrompt(inner),
    correctAnswer,
    differentiationQuotientDistractors(spec),
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

export function tryGenerateDifferentiationQuestion(
  config: MathLearningConfig,
): Omit<CalculusMathQuestion, 'id'> | null {
  const subtypes = getEnabledCalculusSubtypes(config.differentiation);
  if (subtypes.length === 0) return null;
  const subtype = pickRandom(subtypes);
  return generateForSubtype(config, subtype);
}

/** Exported for tests — generate a bare x^n derivative. */
export function generateBasicPowerDerivative(
  config: MathLearningConfig,
): Omit<CalculusMathQuestion, 'id'> {
  const exponent = randomPowerExponent();
  const inner = formatPower('x', exponent);
  const correctAnswer = formatDerivativePowerAnswer(1, exponent);
  return buildQuestion(
    config,
    formatDerivativePrompt(inner),
    correctAnswer,
    powerRuleDistractors(1, exponent),
  );
}

export { pickRandomPowerTerm };
