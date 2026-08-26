import { buildAnswerOptions, limitAnswerOptions } from '@/features/questions/answerOptionsGenerator';
import type { AnswerOptionsCount, MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import type { AdvancedEquationMathQuestion } from '@/features/questions/question.types';
import { pickRandom, randomIntInclusive } from '@/utils/random';
import { i18n } from '@/i18n';
import { getEnabledAdvancedEquationSubtypes } from './advancedEquationsConfig.utils';
import type { AdvancedEquationSubtype } from './advancedEquations.types';

const signed = (n: number) => (n < 0 ? `− ${Math.abs(n)}` : `+ ${n}`);
const linear = (a: number, b: number) => `${a}x ${signed(b)}`;

function numericOptions(answer: number, count: AnswerOptionsCount): string[] {
  return buildAnswerOptions(answer, count, true, { min: -100, max: 100 }).map(String);
}

function build(
  config: MathLearningConfig,
  subtype: AdvancedEquationSubtype,
  questionText: string,
  answers: number[],
): Omit<AdvancedEquationMathQuestion, 'id'> {
  const correctAnswer = answers.length === 1
    ? `x = ${answers[0]}`
    : `x = ${answers.slice().sort((a, b) => a - b).join(' or ')}`;
  let options: string[];
  if (answers.length === 1) {
    options = numericOptions(answers[0], config.answerOptionsCount).map((v) => `x = ${v}`);
  } else {
    const [r1, r2] = answers.slice().sort((a, b) => a - b);
    const candidates = new Set([
      correctAnswer,
      `x = ${r1 + 1} or ${r2}`,
      `x = ${r1} or ${r2 + 1}`,
      `x = ${-r1} or ${-r2}`,
      `x = ${r1 * r2}`,
      'No real solutions',
    ]);
    for (const d1 of [-2, -1, 1, 2]) {
      for (const d2 of [-2, -1, 1, 2]) {
        candidates.add(`x = ${r1 + d1} or ${r2 + d2}`);
      }
    }
    options = limitAnswerOptions([...candidates], config.answerOptionsCount)
      .sort(() => (Math.random() > 0.5 ? 1 : -1));
  }
  return { kind: 'advanced_equation', operation: 'advanced_equations', subtype, questionText, correctAnswer, answerOptions: options, requiresMultipleChoice: true };
}

function generate(config: MathLearningConfig, subtype: AdvancedEquationSubtype): Omit<AdvancedEquationMathQuestion, 'id'> {
  const x = randomIntInclusive(-6, 8) || 2;
  if (subtype === 'multi_step_linear') {
    const a = randomIntInclusive(2, 7);
    const b = randomIntInclusive(-9, 9);
    return build(config, subtype, i18n.t('questions:solveEquation', { equation: `${linear(a, b)} = ${a * x + b}` }), [x]);
  }
  if (subtype === 'variables_both_sides') {
    const rightA = randomIntInclusive(1, 4);
    const leftA = rightA + randomIntInclusive(1, 5);
    const leftB = randomIntInclusive(-8, 8);
    const rightB = (leftA - rightA) * x + leftB;
    return build(config, subtype, i18n.t('questions:solveEquation', { equation: `${linear(leftA, leftB)} = ${linear(rightA, rightB)}` }), [x]);
  }
  if (subtype === 'linear_parentheses') {
    const a = randomIntInclusive(2, 6);
    const b = randomIntInclusive(-6, 6);
    return build(config, subtype, i18n.t('questions:solveEquation', { equation: `${a}(x ${signed(b)}) = ${a * (x + b)}` }), [x]);
  }
  let r1 = randomIntInclusive(-6, 6) || -2;
  let r2 = randomIntInclusive(-6, 6) || 3;
  if (r1 === r2) r2 += 1;
  const b = -(r1 + r2);
  const c = r1 * r2;
  return build(config, subtype, i18n.t('questions:solveEquation', { equation: `x² ${signed(b)}x ${signed(c)} = 0` }), [r1, r2]);
}

export function tryGenerateAdvancedEquationQuestion(config: MathLearningConfig): Omit<AdvancedEquationMathQuestion, 'id'> | null {
  const subtypes = getEnabledAdvancedEquationSubtypes(config.advancedEquations);
  return subtypes.length ? generate(config, pickRandom(subtypes)) : null;
}
