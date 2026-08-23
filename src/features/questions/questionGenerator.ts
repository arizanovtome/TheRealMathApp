import { tryGenerateGeometryQuestion } from '@/features/geometry/geometryGenerator';
import { hasGeometryQuestionSource } from '@/features/geometry/geometryConfig.utils';
import { hasComparisonQuestionSource } from '@/features/comparison/comparisonConfig.utils';
import { tryGenerateComparisonQuestion } from '@/features/comparison/comparisonGenerator';
import { hasEquivalentExpressionsSource } from '@/features/equivalent-expressions/equivalentExpressionsConfig.utils';
import { tryGenerateEquivalentExpressionQuestion } from '@/features/equivalent-expressions/equivalentExpressionsGenerator';
import { hasClockQuestionSource } from '@/features/clock/clockConfig.utils';
import { tryGenerateClockQuestion } from '@/features/clock/clockGenerator';
import {
  hasDifferentiationSource,
  hasIntegrationSource,
} from '@/features/calculus/calculusConfig.utils';
import { tryGenerateDifferentiationQuestion } from '@/features/calculus/differentiationGenerator';
import { tryGenerateIntegrationQuestion } from '@/features/calculus/integrationGenerator';
import { hasTrigonometrySource } from '@/features/trigonometry/trigonometryConfig.utils';
import { tryGenerateTrigonometryQuestion } from '@/features/trigonometry/trigonometryGenerator';
import { hasLogarithmSource } from '@/features/logarithm/logarithmConfig.utils';
import { tryGenerateLogarithmQuestion } from '@/features/logarithm/logarithmGenerator';
import { hasPatternsQuestionSource } from '@/features/patterns/patternsConfig.utils';
import { tryGeneratePatternQuestion } from '@/features/patterns/patternsGenerator';
import {
  getEnabledOperations,
  getEquationTwoUnknownOperatorPool,
  getEquationUnknownOperatorPool,
  getFractionDenominatorModeForOperation,
  getQuestionStylesForOperation,
  sanitizeOneToTenList,
} from '@/features/learning-plan/learningPlan.utils';
import { getMultiplicationSecondFactorPool } from '@/features/learning-plan/multiplicationPool.utils';
import type {
  MathLearningConfig,
  MathOperation,
  QuestionStyle,
  RoundingNearest,
} from '@/features/learning-plan/learningPlan.types';
import { i18n } from '@/i18n';
import { roundingUnitLabel } from '@/i18n/labels';
import {
  buildAnswerOptions,
  buildDecimalAnswerOptions,
  buildOrderOfOperationsAnswerOptions,
  buildSteppedAnswerOptions,
} from '@/features/questions/answerOptionsGenerator';
import {
  buildRemainderMcOptions,
  type QuotientRemainder,
} from '@/features/questions/divisionRemainder';
import {
  buildFractionMcOptions,
  generateFractionQuestion,
} from '@/features/questions/fractions';
import {
  buildEquationMcOptions,
  generateEquationUnknownQuestion,
  type EquationUnknownBase,
} from '@/features/questions/equationUnknown';
import {
  finalizeEquationTwoUnknownQuestion,
  generateEquationTwoUnknownQuestion,
} from '@/features/questions/equationTwoUnknown';
import { tryGenerateFractionVisualQuestion } from '@/features/questions/fractionVisualGenerator';
import { tryGenerateShapeRecognitionQuestion } from '@/features/shapes/shapeRecognitionGenerator';
import { hasShapeRecognitionSource } from '@/features/shapes/shapeRecognitionConfig.utils';
import { hasNumberSenseSource } from '@/features/number-sense/numberSenseConfig.utils';
import { tryGenerateNumberSenseQuestion } from '@/features/number-sense/numberSenseGenerator';
import {
  generateDecimalAddition,
  generateDecimalDivision,
  generateDecimalMultiplication,
  generateDecimalSubtraction,
} from '@/features/questions/decimalArithmetic';
import {
  formatAddExpression,
  formatDivideExpression,
  formatMultiplyExpression,
  formatRoundingNumber,
  formatSubtractExpression,
} from '@/features/questions/mathExpressionFormat';
import { matchesRegroupingPreference } from '@/features/questions/regrouping';
import type { ArithmeticMathQuestion, MathQuestion } from '@/features/questions/question.types';
import {
  applyQuestionStyle,
  type OperandSnapshot,
  type StyledArithmeticDraft,
} from '@/features/questions/questionStyles';
import {
  getAnswerDistractorBounds,
  isAnswerWithinFinalResultCap,
  operationAllowsNegativeResults,
} from '@/features/questions/answerCap.utils';
import { pickRandom, randomIntInclusive } from '@/utils/random';

export {
  getAnswerDistractorBounds,
  isAnswerWithinFinalResultCap,
  operationAllowsNegativeResults,
} from '@/features/questions/answerCap.utils';

function coinFlip(): boolean {
  return randomIntInclusive(0, 1) === 1;
}

function randomMaybeNegative(min: number, max: number, allowNegative: boolean): number {
  const magnitude = randomIntInclusive(min, max);
  return allowNegative && coinFlip() ? -magnitude : magnitude;
}

let questionIdCounter = 0;

const MC_DISTRACTOR_UNLIMITED_SPREAD = 1_000_000;
const REGROUPING_ATTEMPTS = 400;

function nextQuestionId(): string {
  questionIdCounter += 1;
  return `q-${Date.now()}-${questionIdCounter}-${Math.random().toString(16).slice(2)}`;
}

function operationAllowsDecimals(
  config: MathLearningConfig,
  operation: MathOperation,
): boolean {
  switch (operation) {
    case 'addition':
      return config.addition.allowDecimals;
    case 'subtraction':
      return config.subtraction.allowDecimals;
    case 'multiplication':
      return config.multiplication.allowDecimals;
    case 'division':
      return config.division.allowDecimals;
    default:
      return false;
  }
}

/** Answer cap is only applied to addition. */
function maxFinalResultAppliesToOperation(operation: MathOperation): boolean {
  return operation === 'addition';
}

function isArithmeticAnswerAllowedByConfig(
  answer: number,
  config: MathLearningConfig,
  operation: MathOperation,
): boolean {
  if (!maxFinalResultAppliesToOperation(operation)) return true;
  return isAnswerWithinFinalResultCap(answer, config);
}

function getArithmeticDistractorBounds(
  config: MathLearningConfig,
  operation: MathOperation,
): { min: number; max: number } {
  if (!maxFinalResultAppliesToOperation(operation)) {
    if (operationAllowsNegativeResults(config, operation)) {
      return { min: -MC_DISTRACTOR_UNLIMITED_SPREAD, max: MC_DISTRACTOR_UNLIMITED_SPREAD };
    }
    return { min: 0, max: MC_DISTRACTOR_UNLIMITED_SPREAD };
  }
  return getAnswerDistractorBounds(config, operation);
}

type ArithmeticSource = {
  source: 'arithmetic';
  operation: MathOperation;
  style: QuestionStyle;
};

type EquationSource = { source: 'equation'; operation: MathOperation };
type GeometrySourcePick = { source: 'geometry' };
type ComparisonSourcePick = { source: 'comparison' };
type EquivalentExpressionsSourcePick = { source: 'equivalent_expressions' };
type EquationTwoUnknownSource = { source: 'equation_two_unknown'; operation: MathOperation };
type FractionVisualSourcePick = { source: 'fraction_visual' };
type ShapeRecognitionSourcePick = { source: 'shape_recognition' };
type NumberSenseSourcePick = { source: 'number_sense' };
type ClockSourcePick = { source: 'clock' };
type PatternSourcePick = { source: 'pattern' };
type DifferentiationSourcePick = { source: 'differentiation' };
type IntegrationSourcePick = { source: 'integration' };
type TrigonometrySourcePick = { source: 'trigonometry' };
type LogarithmSourcePick = { source: 'logarithm' };

type QuestionSource =
  | ArithmeticSource
  | EquationSource
  | GeometrySourcePick
  | ComparisonSourcePick
  | EquivalentExpressionsSourcePick
  | EquationTwoUnknownSource
  | FractionVisualSourcePick
  | ShapeRecognitionSourcePick
  | NumberSenseSourcePick
  | ClockSourcePick
  | PatternSourcePick
  | DifferentiationSourcePick
  | IntegrationSourcePick
  | TrigonometrySourcePick
  | LogarithmSourcePick;

function buildQuestionSourcePool(config: MathLearningConfig): QuestionSource[] {
  const pool: QuestionSource[] = [];
  for (const operation of getEnabledOperations(config)) {
    const styles = getQuestionStylesForOperation(config, operation);
    for (const style of styles) {
      pool.push({ source: 'arithmetic', operation, style });
    }
  }
  for (const operation of getEquationUnknownOperatorPool(config)) {
    pool.push({ source: 'equation', operation });
  }
  for (const operation of getEquationTwoUnknownOperatorPool(config)) {
    pool.push({ source: 'equation_two_unknown', operation });
  }
  if (hasGeometryQuestionSource(config)) {
    pool.push({ source: 'geometry' });
  }
  if (hasComparisonQuestionSource(config)) {
    pool.push({ source: 'comparison' });
  }
  if (hasEquivalentExpressionsSource(config)) {
    pool.push({ source: 'equivalent_expressions' });
  }
  if (config.fractionVisual.enabled) {
    pool.push({ source: 'fraction_visual' });
  }
  if (hasShapeRecognitionSource(config)) {
    pool.push({ source: 'shape_recognition' });
  }
  if (hasNumberSenseSource(config)) pool.push({ source: 'number_sense' });
  if (hasClockQuestionSource(config)) {
    pool.push({ source: 'clock' });
  }
  if (hasPatternsQuestionSource(config)) {
    pool.push({ source: 'pattern' });
  }
  if (hasDifferentiationSource(config)) {
    pool.push({ source: 'differentiation' });
  }
  if (hasIntegrationSource(config)) {
    pool.push({ source: 'integration' });
  }
  if (hasTrigonometrySource(config)) {
    pool.push({ source: 'trigonometry' });
  }
  if (hasLogarithmSource(config)) {
    pool.push({ source: 'logarithm' });
  }
  return pool;
}

function pickQuestionSource(config: MathLearningConfig): QuestionSource | null {
  const pool = buildQuestionSourcePool(config);
  return pool.length > 0 ? pickRandom(pool) : null;
}

type StandardDraft = Omit<
  ArithmeticMathQuestion,
  'id' | 'answerOptions' | 'questionStyle' | 'answerKind'
> & {
  operandSnapshot?: OperandSnapshot;
};

function generateAddition(config: MathLearningConfig): StandardDraft {
  const { leftMin, leftMax, rightMin, rightMax, allowNegativeNumbers, regrouping } =
    config.addition;

  const sumWithinCap = (left: number, right: number): boolean =>
    isAnswerWithinFinalResultCap(left + right, config, 'addition');

  const build = (left: number, right: number): StandardDraft => ({
    kind: 'arithmetic',
    operation: 'addition',
    questionText: `${formatAddExpression(left, right)} = ?`,
    correctAnswer: left + right,
    operandSnapshot: { operation: 'addition', left, right, result: left + right },
  });

  for (let attempt = 0; attempt < REGROUPING_ATTEMPTS; attempt++) {
    const left = randomMaybeNegative(leftMin, leftMax, allowNegativeNumbers);
    const right = randomMaybeNegative(rightMin, rightMax, allowNegativeNumbers);
    if (!sumWithinCap(left, right)) continue;
    if (
      !matchesRegroupingPreference(regrouping, 'addition', { left, right })
    ) {
      continue;
    }
    return build(left, right);
  }

  for (let attempt = 0; attempt < REGROUPING_ATTEMPTS; attempt++) {
    const left = randomMaybeNegative(leftMin, leftMax, allowNegativeNumbers);
    const right = randomMaybeNegative(rightMin, rightMax, allowNegativeNumbers);
    if (sumWithinCap(left, right)) return build(left, right);
  }

  for (let left = leftMin; left <= leftMax; left++) {
    for (let right = rightMin; right <= rightMax; right++) {
      if (sumWithinCap(left, right)) return build(left, right);
    }
  }

  return build(leftMin, rightMin);
}

function generateSubtraction(config: MathLearningConfig): StandardDraft {
  const {
    firstMin,
    firstMax,
    secondMin,
    secondMax,
    allowNegativeAnswers,
    allowNegativeNumbers,
    regrouping,
  } = config.subtraction;

  for (let attempt = 0; attempt < REGROUPING_ATTEMPTS; attempt++) {
    let first = randomMaybeNegative(firstMin, firstMax, allowNegativeNumbers);
    let second = randomMaybeNegative(secondMin, secondMax, allowNegativeNumbers);
    if (!allowNegativeNumbers && !allowNegativeAnswers && second > first) {
      const tmp = first;
      first = second;
      second = tmp;
    }
    if (
      !matchesRegroupingPreference(regrouping, 'subtraction', { first, second })
    ) {
      continue;
    }
    const result = first - second;
    return {
      kind: 'arithmetic',
      operation: 'subtraction',
      questionText: `${formatSubtractExpression(first, second)} = ?`,
      correctAnswer: result,
      operandSnapshot: { operation: 'subtraction', first, second, result },
    };
  }

  let first = randomMaybeNegative(firstMin, firstMax, allowNegativeNumbers);
  let second = randomMaybeNegative(secondMin, secondMax, allowNegativeNumbers);
  if (!allowNegativeNumbers && !allowNegativeAnswers && second > first) {
    const tmp = first;
    first = second;
    second = tmp;
  }
  const result = first - second;
  return {
    kind: 'arithmetic',
    operation: 'subtraction',
    questionText: `${formatSubtractExpression(first, second)} = ?`,
    correctAnswer: result,
    operandSnapshot: { operation: 'subtraction', first, second, result },
  };
}

function generateMultiplication(config: MathLearningConfig): StandardDraft {
  const { factors, secondFactorSource, randomizeFactorOrder, allowNegativeNumbers } =
    config.multiplication;
  const selectedMagnitude = pickRandom(factors);
  const fromSelection = randomMaybeNegative(selectedMagnitude, selectedMagnitude, allowNegativeNumbers);
  const secondPool = getMultiplicationSecondFactorPool(factors, secondFactorSource);
  const secondMagnitude = pickRandom(secondPool);
  const fromSecondPool = randomMaybeNegative(secondMagnitude, secondMagnitude, allowNegativeNumbers);
  const product = fromSelection * fromSecondPool;
  let displayLeft = fromSelection;
  let displayRight = fromSecondPool;
  if (randomizeFactorOrder && coinFlip()) {
    displayLeft = fromSecondPool;
    displayRight = fromSelection;
  }
  return {
    kind: 'arithmetic',
    operation: 'multiplication',
    questionText: `${formatMultiplyExpression(displayLeft, displayRight)} = ?`,
    correctAnswer: product,
    operandSnapshot: {
      operation: 'multiplication',
      left: displayLeft,
      right: displayRight,
      result: product,
    },
  };
}

function generateDivisionWhole(config: MathLearningConfig): StandardDraft {
  const { answerMin, answerMax, divisors, allowNegativeNumbers } = config.division;
  const answer = randomMaybeNegative(answerMin, answerMax, allowNegativeNumbers);
  const divisorMagnitude = pickRandom(divisors);
  const divisor = randomMaybeNegative(divisorMagnitude, divisorMagnitude, allowNegativeNumbers);
  const dividend = answer * divisor;
  return {
    kind: 'arithmetic',
    operation: 'division',
    questionText: `${formatDivideExpression(dividend, divisor)} = ?`,
    correctAnswer: answer,
    operandSnapshot: { operation: 'division', dividend, divisor, quotient: answer },
  };
}

type RemainderDraft = StandardDraft & {
  quotientRemainder: QuotientRemainder;
  answerKind: 'quotient_remainder';
};

function generateDivisionRemainderDraft(config: MathLearningConfig): RemainderDraft {
  const { answerMin, answerMax, divisors, allowNegativeNumbers } = config.division;
  const validDivisors = sanitizeOneToTenList(divisors).filter((d) => d >= 2);
  const divisorMagnitude = pickRandom(validDivisors.length > 0 ? validDivisors : [2]);
  const divisor = randomMaybeNegative(divisorMagnitude, divisorMagnitude, allowNegativeNumbers);
  const quotient = randomMaybeNegative(answerMin, answerMax, allowNegativeNumbers);
  const remainder = randomIntInclusive(1, divisorMagnitude - 1);
  const dividend = quotient * divisor + remainder;
  const qr: QuotientRemainder = { quotient, remainder };
  return {
    kind: 'arithmetic',
    operation: 'division',
    questionText: `${formatDivideExpression(dividend, divisor)} = ? remainder ?`,
    correctAnswer: quotient,
    quotientRemainder: qr,
    answerKind: 'quotient_remainder',
  };
}

function generateSquare(config: MathLearningConfig): StandardDraft {
  const max = config.square.operandMax;
  const base = randomIntInclusive(1, max);
  const result = base * base;
  return {
    kind: 'arithmetic',
    operation: 'square',
    questionText: `${base}² = ?`,
    correctAnswer: result,
    operandSnapshot: { operation: 'square', base, result },
  };
}

function generateSquareRoot(config: MathLearningConfig): StandardDraft {
  const max = config.squareRoot.rootMax;
  const root = randomIntInclusive(1, max);
  const radicand = root * root;
  return {
    kind: 'arithmetic',
    operation: 'square_root',
    questionText: `√${radicand} = ?`,
    correctAnswer: root,
    operandSnapshot: { operation: 'square_root', radicand, root },
  };
}

function evaluateAddThenMultiply(a: number, b: number, c: number): number {
  return a + b * c;
}

function generateOrderOfOperations(config: MathLearningConfig): StandardDraft {
  const max = config.orderOfOperations.operandMax;
  const a = randomIntInclusive(1, max);
  const c = randomIntInclusive(1, max);
  const variants: ('basic' | 'square' | 'square_root')[] = ['basic'];
  if (config.orderOfOperations.includeSquaring) variants.push('square');
  if (config.orderOfOperations.includeSquareRoots) variants.push('square_root');
  const variant = pickRandom(variants);
  const b = randomIntInclusive(1, max);
  const evaluatedB = variant === 'square' ? b * b : b;
  const middleExpression =
    variant === 'square' ? `${b}²` : variant === 'square_root' ? `√${b * b}` : `${b}`;
  const correct = evaluateAddThenMultiply(a, evaluatedB, c);
  return {
    kind: 'arithmetic',
    operation: 'order_of_operations',
    questionText: `${a} + ${middleExpression} × ${c} = ?`,
    correctAnswer: correct,
    ooOperands: { a, b: evaluatedB, c },
    operandSnapshot: { operation: 'order_of_operations', a, b: evaluatedB, c, result: correct },
  };
}

function roundToNearestUnit(n: number, unit: RoundingNearest): number {
  switch (unit) {
    case 10:
    case 100:
      return Math.round(n / unit) * unit;
    case 'whole':
      return Math.round(n);
    case 'tenth':
      return Number((Math.round(n * 10) / 10).toFixed(1));
    case 'hundredth':
      return Number((Math.round(n * 100) / 100).toFixed(2));
  }
}

function roundingAnswerStep(unit: RoundingNearest): number {
  if (unit === 'tenth') return 0.1;
  if (unit === 'hundredth') return 0.01;
  if (unit === 10) return 10;
  if (unit === 100) return 100;
  return 1;
}

function roundingUnitLabelLocal(unit: RoundingNearest): string {
  return roundingUnitLabel(unit);
}

function randomDecimalValue(maxWhole: number, decimalPlaces: number): number {
  const scale = 10 ** decimalPlaces;
  const whole = randomIntInclusive(1, maxWhole);
  const fraction = randomIntInclusive(1, scale - 1);
  return Number((whole + fraction / scale).toFixed(decimalPlaces));
}

function randomRoundingValue(unit: RoundingNearest): number {
  if (unit === 10) return randomIntInclusive(1, 99);
  if (unit === 100) return randomIntInclusive(1, 999);
  if (unit === 'whole') return randomDecimalValue(99, 2);
  if (unit === 'tenth') return randomDecimalValue(99, 2);
  return randomDecimalValue(99, 3);
}

function generateRounding(config: MathLearningConfig): StandardDraft {
  const units: RoundingNearest[] = [];
  if (config.rounding.nearest10) units.push(10);
  if (config.rounding.nearest100) units.push(100);
  if (config.rounding.nearestWhole) units.push('whole');
  if (config.rounding.nearestTenth) units.push('tenth');
  if (config.rounding.nearestHundredth) units.push('hundredth');
  const unit = units.length === 1 ? units[0]! : pickRandom(units);
  const preferNonExact = coinFlip();
  for (let attempt = 0; attempt < 2500; attempt++) {
    const n = randomRoundingValue(unit);
    const answer = roundToNearestUnit(n, unit);
    if (preferNonExact && attempt < 1200 && answer === n) continue;
    const questionText = i18n.t('questions:roundTo', {
      n: formatRoundingNumber(n),
      unit: roundingUnitLabelLocal(unit),
    });
    return {
      kind: 'arithmetic',
      operation: 'rounding',
      roundingNearest: unit,
      questionText,
      correctAnswer: answer,
      operandSnapshot: { operation: 'rounding', value: n, rounded: answer, unit },
    };
  }
  const n = randomRoundingValue(unit);
  const answer = roundToNearestUnit(n, unit);
  return {
    kind: 'arithmetic',
    operation: 'rounding',
    roundingNearest: unit,
    questionText: i18n.t('questions:roundTo', {
      n: formatRoundingNumber(n),
      unit: roundingUnitLabelLocal(unit),
    }),
    correctAnswer: answer,
    operandSnapshot: { operation: 'rounding', value: n, rounded: answer, unit },
  };
}

export function generateArithmeticDraft(
  config: MathLearningConfig,
  operation: MathOperation,
  preferDecimals = false,
): StandardDraft | RemainderDraft {
  if (operation === 'division' && config.division.allowRemainders) {
    return generateDivisionRemainderDraft(config);
  }
  if (preferDecimals && operationAllowsDecimals(config, operation)) {
    switch (operation) {
      case 'addition':
        return generateDecimalAddition(config) as unknown as StandardDraft;
      case 'subtraction':
        return generateDecimalSubtraction(config) as unknown as StandardDraft;
      case 'multiplication':
        return generateDecimalMultiplication(config) as unknown as StandardDraft;
      case 'division':
        return generateDecimalDivision(config) as unknown as StandardDraft;
      default:
        break;
    }
  }
  switch (operation) {
    case 'addition':
      return generateAddition(config);
    case 'subtraction':
      return generateSubtraction(config);
    case 'multiplication':
      return generateMultiplication(config);
    case 'division':
      return generateDivisionWhole(config);
    case 'square':
      return generateSquare(config);
    case 'square_root':
      return generateSquareRoot(config);
    case 'rounding':
      return generateRounding(config);
    case 'order_of_operations':
      return generateOrderOfOperations(config);
    case 'equivalent_expressions':
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
      throw new Error(`Not an arithmetic operation: ${operation}`);
    default: {
      const _exhaustive: never = operation;
      return _exhaustive;
    }
  }
}

/** @deprecated Use generateArithmeticDraft + applyQuestionStyle */
export function generateQuestionForOperation(
  config: MathLearningConfig,
  operation: MathOperation,
): Omit<ArithmeticMathQuestion, 'id' | 'answerOptions'> {
  const draft = generateArithmeticDraft(config, operation);
  const styled = applyQuestionStyle(draft, 'standard', config);
  return {
    ...draft,
    ...styled,
    questionStyle: styled.questionStyle,
    answerKind: styled.answerKind,
  };
}

function draftNumericAnswerForCapCheck(
  styled: StyledArithmeticDraft,
  standardDraft: StandardDraft | RemainderDraft,
): number {
  if (styled.answerKind === 'quotient_remainder' && styled.quotientRemainder) {
    return styled.quotientRemainder.quotient;
  }
  return styled.correctAnswer;
}

function generateFractionStyledDraft(
  config: MathLearningConfig,
  operation: MathOperation,
): StyledArithmeticDraft {
  const mode = getFractionDenominatorModeForOperation(config, operation);
  const fq = generateFractionQuestion(operation, mode);
  return {
    kind: 'arithmetic',
    operation: fq.operation,
    questionStyle: 'fraction',
    answerKind: 'fraction',
    questionText: fq.questionText,
    correctAnswer: fq.correctFraction.denominator === 1
      ? fq.correctFraction.numerator
      : 0,
    correctFraction: fq.correctFraction,
  };
}

export function generateStyledArithmeticQuestion(
  config: MathLearningConfig,
  operation: MathOperation,
  style: QuestionStyle,
): StyledArithmeticDraft {
  if (style === 'fraction') {
    return generateFractionStyledDraft(config, operation);
  }
  const draftConfig =
    operation === 'division' && style === 'missing_number'
      ? { ...config, division: { ...config.division, allowRemainders: false } }
      : config;
  const preferDecimals = style === 'standard' && operationAllowsDecimals(draftConfig, operation);
  const draft = generateArithmeticDraft(draftConfig, operation, preferDecimals);
  if ('answerKind' in draft && draft.answerKind === 'quotient_remainder') {
    return {
      kind: 'arithmetic',
      operation: 'division',
      questionStyle: 'standard',
      answerKind: 'quotient_remainder',
      questionText: draft.questionText,
      correctAnswer: draft.correctAnswer,
      quotientRemainder: draft.quotientRemainder,
    };
  }
  return applyQuestionStyle(draft, style, config);
}

export function pickRandomEnabledOperation(config: MathLearningConfig): MathOperation {
  const enabled = getEnabledOperations(config);
  return pickRandom(enabled);
}

export function generatePreviewQuestion(config: MathLearningConfig): { questionText: string } | null {
  const src = pickQuestionSource(config);
  if (!src) return null;
  for (let attempt = 0; attempt < 400; attempt++) {
    const pick = attempt === 0 ? src : pickQuestionSource(config);
    if (!pick) return null;
    if (pick.source === 'arithmetic') {
      const styled = generateStyledArithmeticQuestion(config, pick.operation, pick.style);
      if (styled.answerKind === 'fraction') {
        return { questionText: styled.questionText };
      }
      const draft = generateArithmeticDraft(config, pick.operation);
      const capVal = draftNumericAnswerForCapCheck(styled, draft);
      if (!isArithmeticAnswerAllowedByConfig(capVal, config, pick.operation)) continue;
      return { questionText: styled.questionText };
    }
    if (pick.source === 'geometry') {
      const geo = tryGenerateGeometryQuestion(config);
      if (geo) return { questionText: geo.questionText };
      continue;
    }
    if (pick.source === 'comparison') {
      const cmp = tryGenerateComparisonQuestion(config);
      if (cmp) return { questionText: cmp.questionText };
      continue;
    }
    if (pick.source === 'equivalent_expressions') {
      const expression = tryGenerateEquivalentExpressionQuestion(config);
      if (expression) return { questionText: expression.questionText };
      continue;
    }
    if (pick.source === 'fraction_visual') {
      const fv = tryGenerateFractionVisualQuestion(config);
      if (fv) return { questionText: fv.questionText };
      continue;
    }
    if (pick.source === 'shape_recognition') {
      const shape = tryGenerateShapeRecognitionQuestion(config);
      if (shape) return { questionText: shape.questionText };
      continue;
    }
    if (pick.source === 'number_sense') {
      const q = tryGenerateNumberSenseQuestion(config);
      if (q) return { questionText: q.questionText };
      continue;
    }
    if (pick.source === 'clock') {
      const clock = tryGenerateClockQuestion(config);
      if (clock) return { questionText: clock.questionText };
      continue;
    }
    if (pick.source === 'pattern') {
      const pattern = tryGeneratePatternQuestion(config);
      if (pattern) return { questionText: pattern.questionText };
      continue;
    }
    if (pick.source === 'differentiation') {
      const diff = tryGenerateDifferentiationQuestion(config);
      if (diff) return { questionText: diff.questionText };
      continue;
    }
    if (pick.source === 'integration') {
      const integ = tryGenerateIntegrationQuestion(config);
      if (integ) return { questionText: integ.questionText };
      continue;
    }
    if (pick.source === 'trigonometry') {
      const trig = tryGenerateTrigonometryQuestion(config);
      if (trig) return { questionText: trig.questionText };
      continue;
    }
    if (pick.source === 'logarithm') {
      const log = tryGenerateLogarithmQuestion(config);
      if (log) return { questionText: log.questionText };
      continue;
    }
    if (pick.source === 'equation_two_unknown') {
      const draft = generateEquationTwoUnknownQuestion(config, pick.operation);
      if (
        draft &&
        isAnswerWithinFinalResultCap(draft.correctAnswer, config, pick.operation)
      ) {
        return { questionText: draft.questionText };
      }
      continue;
    }
    const eq = generateEquationUnknownQuestion(config, pick.operation);
    if (eq && isAnswerWithinFinalResultCap(eq.correctAnswer, config, pick.operation)) {
      return { questionText: eq.questionText };
    }
  }
  return null;
}

function finalizeArithmeticQuestion(
  config: MathLearningConfig,
  base: StyledArithmeticDraft,
): MathQuestion {
  if (base.answerKind === 'fraction' && base.correctFraction) {
    const answerOptions =
      config.answerEntryMode === 'keyboard'
        ? []
        : buildFractionMcOptions(base.correctFraction, config.answerOptionsCount);
    return {
      kind: 'arithmetic',
      id: nextQuestionId(),
      operation: base.operation,
      questionStyle: base.questionStyle,
      answerKind: 'fraction',
      questionText: base.questionText,
      correctAnswer: base.correctFraction.denominator === 1
        ? base.correctFraction.numerator
        : 0,
      correctFraction: base.correctFraction,
      answerOptions,
    };
  }

  if (base.answerKind === 'quotient_remainder' && base.quotientRemainder) {
    const { quotient } = base.quotientRemainder;
    const answerOptions =
      config.answerEntryMode === 'keyboard'
        ? []
        : buildRemainderMcOptions(base.quotientRemainder, config.answerOptionsCount);
    return {
      kind: 'arithmetic',
      id: nextQuestionId(),
      operation: base.operation,
      questionStyle: base.questionStyle,
      answerKind: 'quotient_remainder',
      questionText: base.questionText,
      correctAnswer: quotient,
      quotientRemainder: base.quotientRemainder,
      answerOptions,
    };
  }

  const bounds = getArithmeticDistractorBounds(config, base.operation);
  const allowNeg = operationAllowsNegativeResults(config, base.operation);
  const useDecimalOptions = !Number.isInteger(base.correctAnswer);
  const answerOptions =
    config.answerEntryMode === 'keyboard'
      ? []
      : base.operation === 'rounding' && base.roundingNearest
        ? buildSteppedAnswerOptions(
            base.correctAnswer,
            config.answerOptionsCount,
            roundingAnswerStep(base.roundingNearest),
          )
      : base.operation === 'order_of_operations' && base.ooOperands
        ? buildOrderOfOperationsAnswerOptions(
            base.ooOperands.a,
            base.ooOperands.b,
            base.ooOperands.c,
            base.correctAnswer,
            config.answerOptionsCount,
            allowNeg,
            bounds,
          )
        : useDecimalOptions
          ? buildDecimalAnswerOptions(
              base.correctAnswer,
              config.answerOptionsCount,
              allowNeg,
              bounds,
            )
        : buildAnswerOptions(
            base.correctAnswer,
            config.answerOptionsCount,
            allowNeg,
            bounds,
          );
  return {
    kind: 'arithmetic',
    id: nextQuestionId(),
    operation: base.operation,
    questionStyle: base.questionStyle,
    answerKind: 'number',
    questionText: base.questionText,
    correctAnswer: base.correctAnswer,
    roundingNearest: base.roundingNearest,
    ooOperands: base.ooOperands,
    answerOptions,
  };
}

function finalizeEquationQuestion(config: MathLearningConfig, eq: EquationUnknownBase): MathQuestion | null {
  const answerOptions =
    config.answerEntryMode === 'keyboard'
      ? []
      : buildEquationMcOptions(
          eq.operation,
          eq.correctExpression,
          eq.correctAnswer,
          config.answerOptionsCount,
          eq.mcContext,
        );
  if (config.answerEntryMode !== 'keyboard' && answerOptions.length < 2) {
    return null;
  }
  const { mcContext: _m, ...rest } = eq;
  return {
    ...rest,
    id: nextQuestionId(),
    answerOptions,
  };
}

function tryGenerateFromSource(config: MathLearningConfig, src: QuestionSource): MathQuestion | null {
  if (src.source === 'arithmetic') {
    return tryGenerateArithmetic(config, src.operation, src.style);
  }
  if (src.source === 'geometry') {
    return tryGenerateGeometryQuestion(config);
  }
  if (src.source === 'comparison') {
    const cmp = tryGenerateComparisonQuestion(config);
    if (!cmp) return null;
    return { ...cmp, id: nextQuestionId() };
  }
  if (src.source === 'equivalent_expressions') {
    const expression = tryGenerateEquivalentExpressionQuestion(config);
    if (!expression) return null;
    return { ...expression, id: nextQuestionId() };
  }
  if (src.source === 'fraction_visual') {
    const fv = tryGenerateFractionVisualQuestion(config);
    if (!fv) return null;
    return { ...fv, id: nextQuestionId() };
  }
  if (src.source === 'shape_recognition') {
    const shape = tryGenerateShapeRecognitionQuestion(config);
    if (!shape) return null;
    return { ...shape, id: nextQuestionId() };
  }
  if (src.source === 'number_sense') {
    const q = tryGenerateNumberSenseQuestion(config);
    return q ? { ...q, id: nextQuestionId() } : null;
  }
  if (src.source === 'clock') {
    const clock = tryGenerateClockQuestion(config);
    if (!clock) return null;
    return { ...clock, id: nextQuestionId() };
  }
  if (src.source === 'pattern') {
    const pattern = tryGeneratePatternQuestion(config);
    if (!pattern) return null;
    return { ...pattern, id: nextQuestionId() };
  }
  if (src.source === 'differentiation') {
    const diff = tryGenerateDifferentiationQuestion(config);
    if (!diff) return null;
    return { ...diff, id: nextQuestionId() };
  }
  if (src.source === 'integration') {
    const integ = tryGenerateIntegrationQuestion(config);
    if (!integ) return null;
    return { ...integ, id: nextQuestionId() };
  }
  if (src.source === 'trigonometry') {
    return tryGenerateTrigonometryQuestion(config);
  }
  if (src.source === 'logarithm') {
    const log = tryGenerateLogarithmQuestion(config);
    if (!log) return null;
    return { ...log, id: nextQuestionId() };
  }
  if (src.source === 'equation_two_unknown') {
    const draft = generateEquationTwoUnknownQuestion(config, src.operation);
    if (!draft) return null;
    if (!isAnswerWithinFinalResultCap(draft.correctAnswer, config, src.operation)) return null;
    const finalized = finalizeEquationTwoUnknownQuestion(config, {
      ...draft,
      id: nextQuestionId(),
    });
    return finalized;
  }
  const eq = generateEquationUnknownQuestion(config, src.operation);
  if (!eq) return null;
  if (!isAnswerWithinFinalResultCap(eq.correctAnswer, config, src.operation)) return null;
  return finalizeEquationQuestion(config, eq);
}

function tryGenerateArithmetic(
  config: MathLearningConfig,
  operation: MathOperation,
  style: QuestionStyle,
): MathQuestion | null {
  const styled = generateStyledArithmeticQuestion(config, operation, style);
  if (styled.answerKind === 'fraction') {
    return finalizeArithmeticQuestion(config, styled);
  }
  const draft = generateArithmeticDraft(config, operation);
  const capVal = draftNumericAnswerForCapCheck(styled, draft);
  if (!isArithmeticAnswerAllowedByConfig(capVal, config, operation)) return null;
  if (styled.questionStyle === 'missing_number') {
    if (!isArithmeticAnswerAllowedByConfig(styled.correctAnswer, config, operation)) return null;
    if (
      operation === 'addition' &&
      styled.operandSnapshot?.operation === 'addition' &&
      !isArithmeticAnswerAllowedByConfig(styled.operandSnapshot.result, config, operation)
    ) {
      return null;
    }
  }
  return finalizeArithmeticQuestion(config, styled);
}

const ATTEMPTS_UNIQUE_PER_QUESTION = 14_000;
const ATTEMPTS_ANY_VALID_PER_QUESTION = 800;
/** Stop hunting for a new prompt once duplicates pile up (common with one question source). */
const MAX_CONSECUTIVE_DUPLICATE_TEXT = 48;

function uniqueAttemptBudget(sourcePoolSize: number): number {
  if (sourcePoolSize <= 1) return 240;
  if (sourcePoolSize <= 4) return 1_600;
  return ATTEMPTS_UNIQUE_PER_QUESTION;
}

function anyValidAttemptBudget(sourcePoolSize: number): number {
  if (sourcePoolSize <= 1) return 160;
  return ATTEMPTS_ANY_VALID_PER_QUESTION;
}

export function createSessionQuestions(config: MathLearningConfig, count: number): MathQuestion[] {
  const sourcePool = buildQuestionSourcePool(config);
  if (sourcePool.length === 0) {
    throw new Error(
      'Unable to generate a question with your current settings. Open Settings and check that your number ranges fit the maximum answer (or choose unlimited), then save.',
    );
  }

  const uniqueAttempts = uniqueAttemptBudget(sourcePool.length);
  const anyValidAttempts = anyValidAttemptBudget(sourcePool.length);
  const seenQuestionText = new Set<string>();
  const questions: MathQuestion[] = [];

  const tryPickUnusedQuestion = (): MathQuestion | null => {
    let consecutiveDuplicates = 0;
    for (let attempt = 0; attempt < uniqueAttempts; attempt++) {
      const src = pickQuestionSource(config);
      if (!src) return null;
      const q = tryGenerateFromSource(config, src);
      if (!q) continue;
      if (seenQuestionText.has(q.questionText)) {
        consecutiveDuplicates += 1;
        if (consecutiveDuplicates >= MAX_CONSECUTIVE_DUPLICATE_TEXT) return null;
        continue;
      }
      consecutiveDuplicates = 0;
      seenQuestionText.add(q.questionText);
      return q;
    }
    return null;
  };

  const tryPickAnyValidQuestion = (): MathQuestion | null => {
    for (let attempt = 0; attempt < anyValidAttempts; attempt++) {
      const src = pickQuestionSource(config);
      if (!src) return null;
      const q = tryGenerateFromSource(config, src);
      if (!q) continue;
      seenQuestionText.add(q.questionText);
      return q;
    }
    return null;
  };

  for (let i = 0; i < count; i++) {
    const q = tryPickUnusedQuestion() ?? tryPickAnyValidQuestion();
    if (!q) {
      throw new Error(
        'Unable to generate a question with your current settings. Open Settings and check that your number ranges fit the maximum answer (or choose unlimited), then save.',
      );
    }
    questions.push(q);
  }
  return questions;
}
