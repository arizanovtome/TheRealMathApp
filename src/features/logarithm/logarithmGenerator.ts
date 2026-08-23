import { formatPower } from '@/features/calculus/calculusFormat';
import { getEnabledLogarithmSubtypes } from '@/features/logarithm/logarithmConfig.utils';
import {
  buildLogMcOptions,
  buildNumericMcOptions,
  pickLnExponent,
  pickLogFactors,
  pickLogPowerExponent,
  pickLogQuotient,
  pickNumericLogSpec,
} from '@/features/logarithm/logarithmExpression.utils';
import {
  formatLnPrompt,
  formatNumericLogProductPrompt,
  formatNumericLogPrompt,
  formatLogPowerAnswer,
  formatLogPowerPrompt,
  formatLogProductAnswer,
  formatLogProductPrompt,
  formatLogQuotientAnswer,
  formatLogQuotientPrompt,
} from '@/features/logarithm/logarithmFormat';
import type { LogarithmSubtype } from '@/features/logarithm/logarithm.types';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import type { LogarithmMathQuestion } from '@/features/questions/question.types';
import { pickRandom } from '@/utils/random';

function buildSymbolicQuestion(
  config: MathLearningConfig,
  subtype: LogarithmSubtype,
  questionText: string,
  correctAnswer: string,
  distractors: string[],
): Omit<LogarithmMathQuestion, 'id'> {
  return {
    kind: 'logarithm',
    operation: 'logarithm',
    subtype,
    questionText,
    correctAnswer,
    answerOptions: buildLogMcOptions(correctAnswer, distractors, config.answerOptionsCount),
    requiresMultipleChoice: true,
  };
}

function buildNumericQuestion(
  config: MathLearningConfig,
  subtype: LogarithmSubtype,
  questionText: string,
  correctAnswer: number,
): Omit<LogarithmMathQuestion, 'id'> {
  const correct = String(correctAnswer);
  return {
    kind: 'logarithm',
    operation: 'logarithm',
    subtype,
    questionText,
    correctAnswer: correct,
    answerOptions: buildNumericMcOptions(correctAnswer, config.answerOptionsCount),
    requiresMultipleChoice: true,
  };
}

function generateProductRule(config: MathLearningConfig): Omit<LogarithmMathQuestion, 'id'> {
  const { a, b } = pickLogFactors();
  const correctAnswer = formatLogProductAnswer(a, b);
  return buildSymbolicQuestion(
    config,
    'product_rule',
    formatLogProductPrompt(a, b),
    correctAnswer,
    [
      `log ${a} − log ${b}`,
      `${a} log ${b}`,
      `${b} log ${a}`,
      `log ${a + b}`,
      `log ${Math.max(2, a * b - 1)}`,
    ],
  );
}

function generateQuotientRule(config: MathLearningConfig): Omit<LogarithmMathQuestion, 'id'> {
  const { dividend, divisor } = pickLogQuotient();
  const correctAnswer = formatLogQuotientAnswer(dividend, divisor);
  return buildSymbolicQuestion(
    config,
    'quotient_rule',
    formatLogQuotientPrompt(dividend, divisor),
    correctAnswer,
    [
      formatLogQuotientAnswer(divisor, dividend),
      formatLogProductAnswer(dividend, divisor),
      `log ${dividend} + log ${divisor}`,
      `${divisor} log ${dividend}`,
      `log ${dividend - divisor}`,
    ],
  );
}

function generatePowerRule(config: MathLearningConfig): Omit<LogarithmMathQuestion, 'id'> {
  const exponent = pickLogPowerExponent();
  const correctAnswer = formatLogPowerAnswer(exponent);
  return buildSymbolicQuestion(
    config,
    'power_rule',
    formatLogPowerPrompt(exponent),
    correctAnswer,
    [
      correctAnswer,
      formatLogPowerAnswer(exponent + 1),
      formatLogPowerAnswer(Math.max(1, exponent - 1)),
      `log x + ${exponent}`,
      `${exponent} + log x`,
      `log ${exponent}x`,
    ],
  );
}

function generateNumericLog(config: MathLearningConfig): Omit<LogarithmMathQuestion, 'id'> {
  const spec = pickNumericLogSpec();
  if (spec.kind === 'product') {
    const valueA = 10 ** spec.expA;
    const valueB = 10 ** spec.expB;
    return buildNumericQuestion(
      config,
      'numeric_log',
      formatNumericLogProductPrompt(10, valueA, valueB),
      spec.expA + spec.expB,
    );
  }
  const value = spec.base ** spec.exponent;
  return buildNumericQuestion(
    config,
    'numeric_log',
    formatNumericLogPrompt(spec.base, value),
    spec.exponent,
  );
}

function generateNumericLn(config: MathLearningConfig): Omit<LogarithmMathQuestion, 'id'> {
  const exponent = pickLnExponent();
  const inner = exponent === 1 ? 'e' : formatPower('e', exponent);
  return buildNumericQuestion(
    config,
    'numeric_ln',
    formatLnPrompt(inner),
    exponent,
  );
}

function generateForSubtype(
  config: MathLearningConfig,
  subtype: LogarithmSubtype,
): Omit<LogarithmMathQuestion, 'id'> {
  switch (subtype) {
    case 'product_rule':
      return generateProductRule(config);
    case 'quotient_rule':
      return generateQuotientRule(config);
    case 'power_rule':
      return generatePowerRule(config);
    case 'numeric_log':
      return generateNumericLog(config);
    case 'numeric_ln':
      return generateNumericLn(config);
  }
}

export function tryGenerateLogarithmQuestion(
  config: MathLearningConfig,
): Omit<LogarithmMathQuestion, 'id'> | null {
  const subtypes = getEnabledLogarithmSubtypes(config.logarithm);
  if (subtypes.length === 0) return null;
  const subtype = pickRandom(subtypes);
  return generateForSubtype(config, subtype);
}
