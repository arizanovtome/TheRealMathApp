import type {
  MathLearningConfig,
  MathOperation,
} from '@/features/learning-plan/learningPlan.types';
import { buildAnswerOptions } from '@/features/questions/answerOptionsGenerator';
import { isAnswerWithinFinalResultCap } from '@/features/questions/answerCap.utils';
import type { EquationTwoUnknownMathQuestion } from '@/features/questions/question.types';
import { pickRandom, randomIntInclusive } from '@/utils/random';
import { i18n } from '@/i18n';

type SolveFor = 'x' | 'y';

function randomInRange(min: number, max: number): number {
  return randomIntInclusive(min, max);
}

function boundsForOperation(
  config: MathLearningConfig,
  operation: MathOperation,
): { min: number; max: number } {
  switch (operation) {
    case 'addition':
      return {
        min: Math.min(config.addition.leftMin, config.addition.rightMin),
        max: Math.max(config.addition.leftMax, config.addition.rightMax),
      };
    case 'subtraction':
      return {
        min: Math.min(config.subtraction.firstMin, config.subtraction.secondMin),
        max: Math.max(config.subtraction.firstMax, config.subtraction.secondMax),
      };
    case 'multiplication': {
      const factors = config.multiplication.factors;
      const lo = Math.min(...factors);
      const hi = Math.max(...factors, 10);
      return { min: lo, max: hi };
    }
    case 'division':
      return {
        min: Math.min(config.division.answerMin, ...config.division.divisors),
        max: Math.max(config.division.answerMax, ...config.division.divisors),
      };
    default:
      return { min: 1, max: 12 };
  }
}

function formatQuestionText(eq1: string, eq2: string, solveFor: SolveFor): string {
  return `${eq1}\n${eq2}\n${i18n.t('questions:findVariable', { variable: solveFor })}`;
}

function pickSolveFor(): SolveFor {
  return pickRandom(['x', 'y'] as const);
}

function buildFromValues(
  config: MathLearningConfig,
  operation: MathOperation,
  x: number,
  y: number,
  eq1: string,
  eq2: string,
  solveFor: SolveFor,
): Omit<EquationTwoUnknownMathQuestion, 'id'> | null {
  const correctAnswer = solveFor === 'x' ? x : y;
  if (!isAnswerWithinFinalResultCap(correctAnswer, config, operation)) return null;
  return {
    kind: 'equation_two_unknown',
    operation,
    questionText: formatQuestionText(eq1, eq2, solveFor),
    correctAnswer,
    answerOptions: [],
  };
}

function generateAdditionTwoUnknown(
  config: MathLearningConfig,
): Omit<EquationTwoUnknownMathQuestion, 'id'> | null {
  const { min, max } = boundsForOperation(config, 'addition');
  for (let attempt = 0; attempt < 80; attempt++) {
    const x = randomInRange(min, max);
    const y = randomInRange(min, max);
    const draft = buildFromValues(
      config,
      'addition',
      x,
      y,
      `x + y = ${x + y}`,
      `x − y = ${x - y}`,
      pickSolveFor(),
    );
    if (draft) return draft;
  }
  return null;
}

function generateSubtractionTwoUnknown(
  config: MathLearningConfig,
): Omit<EquationTwoUnknownMathQuestion, 'id'> | null {
  const { min, max } = boundsForOperation(config, 'subtraction');
  for (let attempt = 0; attempt < 80; attempt++) {
    const x = randomInRange(min, max);
    const y = randomInRange(min, max);
    const draft = buildFromValues(
      config,
      'subtraction',
      x,
      y,
      `x − y = ${x - y}`,
      `x + y = ${x + y}`,
      pickSolveFor(),
    );
    if (draft) return draft;
  }
  return null;
}

function generateMultiplicationTwoUnknown(
  config: MathLearningConfig,
): Omit<EquationTwoUnknownMathQuestion, 'id'> | null {
  const { min, max } = boundsForOperation(config, 'multiplication');
  for (let attempt = 0; attempt < 80; attempt++) {
    const y = randomInRange(Math.max(1, min), Math.min(max, 12));
    const x = randomInRange(Math.max(1, min), Math.min(max, 12));
    // Use x − y (not x + y): sum + product is symmetric and "Find x" is ambiguous.
    const draft = buildFromValues(
      config,
      'multiplication',
      x,
      y,
      `x × y = ${x * y}`,
      `x − y = ${x - y}`,
      pickSolveFor(),
    );
    if (draft) return draft;
  }
  return null;
}

function generateDivisionTwoUnknown(
  config: MathLearningConfig,
): Omit<EquationTwoUnknownMathQuestion, 'id'> | null {
  const { min, max } = boundsForOperation(config, 'division');
  for (let attempt = 0; attempt < 80; attempt++) {
    const y = randomInRange(Math.max(1, min), Math.min(max, 12));
    const quotient = randomInRange(Math.max(1, min), Math.min(max, 12));
    const x = y * quotient;
    const draft = buildFromValues(
      config,
      'division',
      x,
      y,
      `x ÷ y = ${quotient}`,
      `x + y = ${x + y}`,
      pickSolveFor(),
    );
    if (draft) return draft;
  }
  return null;
}

export function generateEquationTwoUnknownQuestion(
  config: MathLearningConfig,
  operation: MathOperation,
): Omit<EquationTwoUnknownMathQuestion, 'id'> | null {
  if (!config.equationTwoUnknowns.enabled) return null;
  switch (operation) {
    case 'addition':
      if (!config.equationTwoUnknowns.operators.addition) return null;
      return generateAdditionTwoUnknown(config);
    case 'subtraction':
      if (!config.equationTwoUnknowns.operators.subtraction) return null;
      return generateSubtractionTwoUnknown(config);
    case 'multiplication':
      if (!config.equationTwoUnknowns.operators.multiplication) return null;
      return generateMultiplicationTwoUnknown(config);
    case 'division':
      if (!config.equationTwoUnknowns.operators.division) return null;
      return generateDivisionTwoUnknown(config);
    default:
      return null;
  }
}

export function finalizeEquationTwoUnknownQuestion(
  config: MathLearningConfig,
  draft: EquationTwoUnknownMathQuestion,
): EquationTwoUnknownMathQuestion | null {
  if (config.answerEntryMode === 'keyboard') {
    return { ...draft, answerOptions: [] };
  }
  const answerOptions = buildAnswerOptions(
    draft.correctAnswer,
    config.answerOptionsCount,
    draft.correctAnswer < 0,
    { min: draft.correctAnswer - 10, max: draft.correctAnswer + 10 },
  );
  if (answerOptions.length < 2) return null;
  return { ...draft, answerOptions };
}

/** Parses the variable from English or Macedonian system instructions. */
export function parseSolveForFromQuestionText(questionText: string): SolveFor | null {
  const match = /(?:Find|Најди(?: го)?) ([xy])\./.exec(questionText);
  if (!match) return null;
  return match[1] === 'y' ? 'y' : 'x';
}
