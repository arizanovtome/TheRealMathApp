import { getOperationLabel } from '@/constants/operationLabels';
import {
  ADDITION_ANSWER_MAX_OPTIONS,
  ADDITION_SUBTRACTION_MAX_OPTIONS,
  type AdditionAnswerMax,
} from "@/constants/ranges";
import { i18n } from '@/i18n';
import {
  countEnabledGeometryShapes,
  hasGeometryQuestionSource,
  normalizeGeometryConfig,
} from '@/features/geometry/geometryConfig.utils';
import { hasComparisonQuestionSource } from '@/features/comparison/comparisonConfig.utils';
import { hasEquivalentExpressionsSource } from '@/features/equivalent-expressions/equivalentExpressionsConfig.utils';
import { normalizeClockConfig, hasClockQuestionSource } from '@/features/clock/clockConfig.utils';
import { hasShapeRecognitionSource, normalizeShapeRecognitionConfig } from '@/features/shapes/shapeRecognitionConfig.utils';
import { normalizePatternsConfig, hasPatternsQuestionSource } from '@/features/patterns/patternsConfig.utils';
import { normalizeNumberSenseConfig, hasNumberSenseSource } from '@/features/number-sense/numberSenseConfig.utils';
import {
  hasDifferentiationSource,
  hasIntegrationSource,
  normalizeDifferentiationConfig,
  normalizeIntegrationConfig,
} from '@/features/calculus/calculusConfig.utils';
import {
  hasTrigonometrySource,
  normalizeTrigonometryConfig,
} from '@/features/trigonometry/trigonometryConfig.utils';
import {
    type AdditionConfig,
    type AnswerEntryMode,
    type AnswerOptionsCount,
    DEFAULT_COMPARISON_CONFIG,
    DEFAULT_EQUIVALENT_EXPRESSIONS_CONFIG,
    DEFAULT_EQUATION_TWO_UNKNOWNS_CONFIG,
    DEFAULT_EQUATION_UNKNOWN_CONFIG,
    DEFAULT_FRACTION_VISUAL_CONFIG,
    DEFAULT_ORDER_OF_OPERATIONS_CONFIG,
    DEFAULT_ROUNDING_CONFIG,
    type ComparisonConfig,
    type DivisionConfig,
    type EquationTwoUnknownsConfig,
    type EquationUnknownConfig,
    type EquivalentExpressionsConfig,
    type FractionVisualConfig,
    FINAL_RESULT_CAP_OPTIONS,
    type FinalResultCap,
    type FinalResultCapNumeric,
    type FractionDenominatorMode,
    type LearningMode,
    type MathLearningConfig,
    type MathOperation,
    type MultiplicationConfig,
    type MultiplicationSecondFactorSource,
    ONE_TO_TEN_NUMBERS,
    ONE_TO_TWENTY_NUMBERS,
    type OrderOfOperationsConfig,
    type OrderOfOpsOperandMax,
    QUESTION_COUNT_OPTIONS,
    type QuestionStyle,
    type QuestionStylesConfig,
    type RoundingConfig,
    type SpecialQuestionMode,
    type SquareConfig,
    type SquareOperandMax,
    type SquareRootConfig,
    type SquareRootRootMax,
    type SubtractionConfig,
    TIMED_DURATION_MINUTES_OPTIONS,
    type TimedDurationMinutes,
    TIMER_SECONDS_DEFAULT,
    TIMER_SECONDS_MAX,
    TIMER_SECONDS_MIN,
    TIMER_SECONDS_STEP,
} from "@/features/learning-plan/learningPlan.types";

const VALID_ANSWER_OPTION_COUNTS: AnswerOptionsCount[] = [2, 3, 4, 5, 6];

function normalizeSpecialQuestionMode(
  raw: unknown,
  fallback: SpecialQuestionMode = "off",
): SpecialQuestionMode {
  if (raw === "off" || raw === "mixed" || raw === "only") return raw;
  return fallback;
}

function normalizeLearningMode(raw: unknown): LearningMode {
  if (raw === "quiz" || raw === "timed" || raw === "practice") return raw;
  return "practice";
}

function normalizeTimedDurationMinutes(raw: unknown): TimedDurationMinutes {
  const n = typeof raw === "number" ? raw : Number(raw);
  const snapped = Number.isFinite(n) ? Math.round(n) : 3;
  const clamped = Math.min(10, Math.max(1, snapped));
  return (TIMED_DURATION_MINUTES_OPTIONS as readonly number[]).includes(clamped)
    ? (clamped as TimedDurationMinutes)
    : (3 as TimedDurationMinutes);
}

function normalizeTimedSubtractSecondsOnWrong(raw: unknown): boolean {
  return raw === true;
}

function isFinalResultCapValue(v: unknown): v is FinalResultCap {
  return (
    v === "unlimited" ||
    (typeof v === "number" &&
      (FINAL_RESULT_CAP_OPTIONS as readonly number[]).includes(v))
  );
}

function normalizeMaxFinalResult(raw: unknown): FinalResultCap {
  if (raw === "unlimited") return "unlimited";
  if (typeof raw === "string" && raw.trim().toLowerCase() === "unlimited")
    return "unlimited";
  const n = typeof raw === "number" ? raw : Number(raw);
  if (
    Number.isFinite(n) &&
    (FINAL_RESULT_CAP_OPTIONS as readonly number[]).includes(n)
  ) {
    return n as FinalResultCapNumeric;
  }
  return 100;
}

export function additionAnswerCapNumeric(config: MathLearningConfig): number {
  return config.addition.answerMax === "unlimited"
    ? Number.MAX_SAFE_INTEGER
    : config.addition.answerMax;
}

/** Numeric ceiling for generation; only addition uses a user-facing answer cap now. */
export function effectiveFinalResultNumericCap(
  config: MathLearningConfig,
  operation?: MathOperation,
): number {
  return operation === "addition"
    ? additionAnswerCapNumeric(config)
    : Number.MAX_SAFE_INTEGER;
}

export function normalizeAnswerEntryMode(raw: unknown): AnswerEntryMode {
  return raw === "keyboard" ? "keyboard" : "multiple_choice";
}

export function normalizeAnswerOptionsCount(raw: unknown): AnswerOptionsCount {
  const n = typeof raw === "number" ? raw : Number(raw);
  return VALID_ANSWER_OPTION_COUNTS.includes(n as AnswerOptionsCount)
    ? (n as AnswerOptionsCount)
    : 4;
}

export type LearningConfigValidationResult = {
  valid: boolean;
  errors: string[];
};

function isRangeValid(min: number, max: number): boolean {
  return Number.isFinite(min) && Number.isFinite(max) && min <= max;
}

function intervalsOverlap(
  aMin: number,
  aMax: number,
  bMin: number,
  bMax: number,
): boolean {
  return aMin <= bMax && aMax >= bMin;
}

function finalResultBand(config: MathLearningConfig): {
  low: number;
  high: number;
} {
  if (config.addition.answerMax === "unlimited") {
    return {
      low: -Number.MAX_SAFE_INTEGER,
      high: Number.MAX_SAFE_INTEGER,
    };
  }
  const cap = config.addition.answerMax;
  if (config.addition.allowNegativeNumbers) {
    return { low: -cap, high: cap };
  }
  return { low: 0, high: cap };
}

export function getEnabledOperations(
  config: MathLearningConfig,
): MathOperation[] {
  const ops: MathOperation[] = [];
  if (config.addition.enabled) ops.push("addition");
  if (config.subtraction.enabled) ops.push("subtraction");
  if (config.multiplication.enabled) ops.push("multiplication");
  if (config.division.enabled) ops.push("division");
  if (config.square.enabled) ops.push("square");
  if (config.squareRoot.enabled) ops.push("square_root");
  if (
    config.rounding.enabled &&
    (config.rounding.nearest10 ||
      config.rounding.nearest100 ||
      config.rounding.nearestWhole ||
      config.rounding.nearestTenth ||
      config.rounding.nearestHundredth)
  ) {
    ops.push("rounding");
  }
  if (config.orderOfOperations.enabled) {
    ops.push("order_of_operations");
  }
  return ops;
}

/** Equation templates only when the parent operation main switch is on. */
export function getEquationUnknownOperatorPool(
  config: MathLearningConfig,
): MathOperation[] {
  if (!config.equationUnknown.enabled) return [];
  const o = config.equationUnknown.operators;
  const out: MathOperation[] = [];
  if (o.addition && config.addition.enabled) out.push("addition");
  if (o.subtraction && config.subtraction.enabled) out.push("subtraction");
  if (o.multiplication && config.multiplication.enabled) out.push("multiplication");
  if (o.division && config.division.enabled) out.push("division");
  return out;
}

export function getEquationTwoUnknownOperatorPool(
  config: MathLearningConfig,
): MathOperation[] {
  if (!config.equationTwoUnknowns.enabled) return [];
  const o = config.equationTwoUnknowns.operators;
  const out: MathOperation[] = [];
  if (o.addition && config.addition.enabled) out.push("addition");
  if (o.subtraction && config.subtraction.enabled) out.push("subtraction");
  if (o.multiplication && config.multiplication.enabled) out.push("multiplication");
  if (o.division && config.division.enabled) out.push("division");
  return out;
}

export function hasAnyQuestionSource(config: MathLearningConfig): boolean {
  if (
    getEnabledOperations(config).some(
      (op) => getQuestionStylesForOperation(config, op).length > 0,
    )
  )
    return true;
  if (getEquationUnknownOperatorPool(config).length > 0) return true;
  if (getEquationTwoUnknownOperatorPool(config).length > 0) return true;
  if (hasGeometryQuestionSource(config)) return true;
  if (hasComparisonQuestionSource(config)) return true;
  if (hasEquivalentExpressionsSource(config)) return true;
  if (config.fractionVisual.enabled) return true;
  if (hasShapeRecognitionSource(config)) return true;
  if (hasNumberSenseSource(config)) return true;
  if (hasClockQuestionSource(config)) return true;
  if (hasPatternsQuestionSource(config)) return true;
  if (hasDifferentiationSource(config)) return true;
  if (hasIntegrationSource(config)) return true;
  if (hasTrigonometrySource(config)) return true;
  return false;
}

/**
 * Practice-only: narrow generation to one operation (e.g. home-screen “practice more of this”).
 * No-op if `focus` is null or not enabled in the base config.
 */
export function applyPracticeFocusOverride(
  config: MathLearningConfig,
  focus: MathOperation | null,
  options?: { force?: boolean },
): MathLearningConfig {
  if (!focus) return config;
  if (!options?.force) {
    const basicEnabled = getEnabledOperations(config).includes(focus);
    const specialEnabled =
      (focus === "geometry" && hasGeometryQuestionSource(config)) ||
      (focus === "comparison" && config.comparison.enabled) ||
      (focus === "equivalent_expressions" && hasEquivalentExpressionsSource(config)) ||
      (focus === "fraction_visual" && config.fractionVisual.enabled) ||
      (focus === "shape_recognition" && hasShapeRecognitionSource(config)) ||
      (focus === "number_sense" && hasNumberSenseSource(config)) ||
      (focus === "clock" && hasClockQuestionSource(config)) ||
      (focus === "pattern" && hasPatternsQuestionSource(config)) ||
      (focus === "differentiation" && hasDifferentiationSource(config)) ||
      (focus === "integration" && hasIntegrationSource(config)) ||
      (focus === "trigonometry" && hasTrigonometrySource(config));
    if (!basicEnabled && !specialEnabled) return config;
  }
  return {
    ...config,
    addition: { ...config.addition, enabled: focus === "addition" },
    subtraction: { ...config.subtraction, enabled: focus === "subtraction" },
    multiplication: {
      ...config.multiplication,
      enabled: focus === "multiplication",
    },
    division: { ...config.division, enabled: focus === "division" },
    square: { ...config.square, enabled: focus === "square" },
    squareRoot: { ...config.squareRoot, enabled: focus === "square_root" },
    rounding: { ...config.rounding, enabled: focus === "rounding" },
    orderOfOperations: {
      ...config.orderOfOperations,
      enabled: focus === "order_of_operations",
    },
    equationUnknown: { ...config.equationUnknown, mode: "off", enabled: false },
    equationTwoUnknowns: {
      ...config.equationTwoUnknowns,
      enabled: false,
      operators: {
        addition: false,
        subtraction: false,
        multiplication: false,
        division: false,
      },
    },
    comparison: { ...config.comparison, enabled: focus === "comparison" },
    equivalentExpressions: {
      ...config.equivalentExpressions,
      enabled: focus === "equivalent_expressions",
    },
    fractionVisual: {
      ...config.fractionVisual,
      enabled: focus === "fraction_visual",
    },
    shapeRecognition: {
      ...config.shapeRecognition,
      enabled: focus === "shape_recognition",
    },
    numberSense: { ...config.numberSense, enabled: focus === "number_sense" },
    clock: {
      ...config.clock,
      enabled: focus === "clock",
    },
    patterns: {
      ...config.patterns,
      enabled: focus === "pattern",
    },
    differentiation: {
      ...config.differentiation,
      enabled: focus === "differentiation",
    },
    integration: {
      ...config.integration,
      enabled: focus === "integration",
    },
    trigonometry: {
      ...config.trigonometry,
      enabled: focus === "trigonometry",
    },
    geometry: {
      ...config.geometry,
      enabled: focus === "geometry",
    },
  };
}

export function hasAtLeastOneOperationEnabled(
  config: MathLearningConfig,
): boolean {
  return getEnabledOperations(config).length > 0;
}

const WORD_PROBLEM_OPERATIONS: MathOperation[] = [
  "addition",
  "subtraction",
  "multiplication",
  "division",
];

const FRACTION_OPERATIONS: MathOperation[] = [
  "addition",
  "subtraction",
  "multiplication",
  "division",
  "square",
  "square_root",
];

const MISSING_NUMBER_OPERATIONS: MathOperation[] = [
  "addition",
  "subtraction",
  "multiplication",
  "division",
  "square",
  "square_root",
];

export function styleSupportedForOperation(
  style: QuestionStyle,
  operation: MathOperation,
): boolean {
  switch (style) {
    case "standard":
      return true;
    case "missing_number":
      return MISSING_NUMBER_OPERATIONS.includes(operation);
    case "fraction":
      return FRACTION_OPERATIONS.includes(operation);
    case "word_problem":
      return WORD_PROBLEM_OPERATIONS.includes(operation);
    default: {
      const _exhaustive: never = style;
      return _exhaustive;
    }
  }
}

export function getQuestionStylesForOperation(
  config: MathLearningConfig,
  operation: MathOperation,
): QuestionStyle[] {
  const variant = getArithmeticVariantConfig(config, operation);
  if (!variant) {
    if (operation === "rounding" || operation === "order_of_operations") {
      return ["standard"];
    }
    return [];
  }

  const styles: QuestionStyle[] = [];
  if (variant.standardCalculation) styles.push("standard");
  if (variant.missingNumber) styles.push("missing_number");
  if (variant.fractions) styles.push("fraction");
  if (variant.wordProblems) styles.push("word_problem");
  return styles;
}

function normalizeFractionDenominatorMode(raw: unknown): FractionDenominatorMode {
  if (raw === "same_only" || raw === "different_only" || raw === "mixed") return raw;
  return "same_only";
}

function getArithmeticVariantConfig(
  config: MathLearningConfig,
  operation: MathOperation,
): {
  standardCalculation: boolean;
  missingNumber: boolean;
  fractions: boolean;
  wordProblems: boolean;
} | null {
  switch (operation) {
    case "addition":
      return {
        standardCalculation: config.addition.standardCalculation,
        missingNumber: config.addition.missingNumber,
        fractions: config.addition.fractions,
        wordProblems: config.addition.wordProblems,
      };
    case "subtraction":
      return {
        standardCalculation: config.subtraction.standardCalculation,
        missingNumber: config.subtraction.missingNumber,
        fractions: config.subtraction.fractions,
        wordProblems: config.subtraction.wordProblems,
      };
    case "multiplication":
      return {
        standardCalculation: config.multiplication.standardCalculation,
        missingNumber: config.multiplication.missingNumber,
        fractions: config.multiplication.fractions,
        wordProblems: config.multiplication.wordProblems,
      };
    case "division":
      return {
        standardCalculation: config.division.standardCalculation,
        missingNumber: config.division.missingNumber,
        fractions: config.division.fractions,
        wordProblems: config.division.wordProblems,
      };
    case "square":
      return {
        standardCalculation: config.square.standardCalculation,
        missingNumber: false,
        fractions: config.square.fractions,
        wordProblems: false,
      };
    case "square_root":
      return {
        standardCalculation: config.squareRoot.standardCalculation,
        missingNumber: false,
        fractions: config.squareRoot.fractions,
        wordProblems: false,
      };
    default:
      return null;
  }
}

export function getFractionDenominatorModeForOperation(
  config: MathLearningConfig,
  operation: MathOperation,
): FractionDenominatorMode {
  switch (operation) {
    case "addition":
      return config.addition.fractionDenominatorMode;
    case "subtraction":
      return config.subtraction.fractionDenominatorMode;
    case "multiplication":
    case "division":
      // Common-denominator selection is only meaningful for addition and subtraction.
      return "mixed";
    default:
      return "same_only";
  }
}

function hasAtLeastOneQuestionModeForBasicOp(
  standardCalculation: boolean,
  missingNumber: boolean,
  fractions: boolean,
  wordProblems: boolean,
): boolean {
  return standardCalculation || missingNumber || fractions || wordProblems;
}

function validateBasicOpQuestionModes(
  errors: string[],
  t: typeof i18n.t,
  operation: MathOperation,
  enabled: boolean,
  standardCalculation: boolean,
  missingNumber: boolean,
  fractions: boolean,
  wordProblems: boolean,
): void {
  if (
    enabled &&
    !hasAtLeastOneQuestionModeForBasicOp(
      standardCalculation,
      missingNumber,
      fractions,
      wordProblems,
    )
  ) {
    errors.push(
      t('settings:validation.operationStyle', {
        operation: getOperationLabel(operation, t),
      }),
    );
  }
}

function legacyWordProblemsEnabled(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  return (raw as Record<string, unknown>).wordProblems === true;
}

function snapAdditionAnswerMax(raw: unknown): AdditionAnswerMax {
  if (raw === "unlimited") return "unlimited";
  if (typeof raw === "string" && raw.trim().toLowerCase() === "unlimited") {
    return "unlimited";
  }
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n >= Number.MAX_SAFE_INTEGER / 2) {
    return "unlimited";
  }
  return nearestAdditionAnswerMax(n);
}

function nearestAdditionAnswerMax(n: number): AdditionAnswerMax {
  if (n <= 5) return ADDITION_ANSWER_MAX_OPTIONS[0]!;
  let best: AdditionAnswerMax = ADDITION_ANSWER_MAX_OPTIONS[0]!;
  for (const v of ADDITION_ANSWER_MAX_OPTIONS) {
    const dv = Math.abs(v - n);
    const db = Math.abs(best as number - n);
    if (dv < db) best = v;
    else if (dv === db && v > (best as number)) best = v;
  }
  return best;
}

function normalizeAdditionConfig(
  raw: unknown,
  legacyQuestionStyles: unknown,
): AdditionConfig {
  const r =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const legacyMissingMode =
    missingNumberModeFromLegacyQuestionStyles(legacyQuestionStyles);
  const missingMode = normalizeSpecialQuestionMode(
    r.missingNumberMode,
    legacyMissingMode,
  );
  return {
    enabled: r.enabled === true,
    standardCalculation:
      typeof r.standardCalculation === "boolean"
        ? r.standardCalculation
        : missingMode !== "only",
    allowNegativeNumbers: r.allowNegativeNumbers === true,
    leftMin: typeof r.leftMin === "number" ? r.leftMin : 1,
    leftMax: typeof r.leftMax === "number" ? r.leftMax : 5,
    rightMin: typeof r.rightMin === "number" ? r.rightMin : 1,
    rightMax: typeof r.rightMax === "number" ? r.rightMax : 5,
    answerMax: snapAdditionAnswerMax(
      r.answerMax ??
        (typeof r.maxFinalResult === "number" || r.maxFinalResult === "unlimited"
          ? r.maxFinalResult
          : 10),
    ),
    missingNumber:
      typeof r.missingNumber === "boolean"
        ? r.missingNumber
        : missingMode !== "off",
    fractions: r.fractions === true,
    fractionDenominatorMode: normalizeFractionDenominatorMode(
      r.fractionDenominatorMode,
    ),
    regrouping: r.regrouping === true,
    allowDecimals: r.allowDecimals === true,
    wordProblems:
      r.wordProblems === true ||
      legacyWordProblemsEnabled(legacyQuestionStyles),
  };
}

function missingNumberModeFromLegacyQuestionStyles(
  raw: unknown,
): SpecialQuestionMode {
  const legacyStyles =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return legacyStyles.missingNumber === true ? "mixed" : "off";
}

function normalizeSubtractionConfig(
  raw: unknown,
  legacyQuestionStyles: unknown,
): SubtractionConfig {
  const r =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const legacyMissingMode =
    missingNumberModeFromLegacyQuestionStyles(legacyQuestionStyles);
  const missingMode = normalizeSpecialQuestionMode(
    r.missingNumberMode,
    legacyMissingMode,
  );
  return {
    enabled: r.enabled === true,
    standardCalculation:
      typeof r.standardCalculation === "boolean"
        ? r.standardCalculation
        : missingMode !== "only",
    allowNegativeNumbers:
      r.allowNegativeNumbers === true || r.allowNegativeAnswers === true,
    firstMin: typeof r.firstMin === "number" ? r.firstMin : 1,
    firstMax: typeof r.firstMax === "number" ? r.firstMax : 5,
    secondMin: typeof r.secondMin === "number" ? r.secondMin : 1,
    secondMax: typeof r.secondMax === "number" ? r.secondMax : 5,
    missingNumber:
      typeof r.missingNumber === "boolean"
        ? r.missingNumber
        : missingMode !== "off",
    allowNegativeAnswers: r.allowNegativeAnswers === true,
    fractions: r.fractions === true,
    fractionDenominatorMode: normalizeFractionDenominatorMode(
      r.fractionDenominatorMode,
    ),
    regrouping: r.regrouping === true,
    allowDecimals: r.allowDecimals === true,
    wordProblems:
      r.wordProblems === true ||
      legacyWordProblemsEnabled(legacyQuestionStyles),
  };
}

function normalizeEquationUnknownConfig(raw: unknown): EquationUnknownConfig {
  const base = DEFAULT_EQUATION_UNKNOWN_CONFIG;
  if (!raw || typeof raw !== "object")
    return { ...base, operators: { ...base.operators } };
  const r = raw as Record<string, unknown>;
  const mode = normalizeSpecialQuestionMode(
    r.mode,
    r.enabled === true ? "mixed" : "off",
  );
  const opRaw = r.operators;
  const o =
    opRaw && typeof opRaw === "object"
      ? (opRaw as Record<string, unknown>)
      : ({} as Record<string, unknown>);
  const operators = {
    addition: o.addition === true,
    subtraction: o.subtraction === true,
    multiplication: o.multiplication === true,
    division: o.division === true,
  };
  return {
    mode,
    enabled: mode !== "off" || Object.values(operators).some(Boolean),
    operators,
  };
}

export function validateLearningConfig(
  config: MathLearningConfig,
): LearningConfigValidationResult {
  const t = i18n.t.bind(i18n);
  const errors: string[] = [];

  if (!hasAnyQuestionSource(config)) {
    errors.push(t('settings:validation.chooseOperation'));
  }

  const hasArithmeticStyleSource = getEnabledOperations(config).some(
    (op) => getQuestionStylesForOperation(config, op).length > 0,
  );
  const hasNonArithmeticQuestionSource =
    getEquationUnknownOperatorPool(config).length > 0 ||
    getEquationTwoUnknownOperatorPool(config).length > 0 ||
    hasGeometryQuestionSource(config) ||
    hasComparisonQuestionSource(config) ||
    hasEquivalentExpressionsSource(config) ||
    config.fractionVisual.enabled ||
    hasShapeRecognitionSource(config) ||
    hasNumberSenseSource(config) ||
    hasClockQuestionSource(config) ||
    hasPatternsQuestionSource(config) ||
    hasDifferentiationSource(config) ||
    hasIntegrationSource(config) ||
    hasTrigonometrySource(config);
  if (!hasNonArithmeticQuestionSource && !hasArithmeticStyleSource) {
    errors.push(t('settings:validation.chooseStyle'));
  }

  if (
    config.answerEntryMode === "keyboard" &&
    config.division.enabled &&
    config.division.allowRemainders
  ) {
    errors.push(t('settings:validation.keyboardRemainders'));
  }

  const equationUnknownOps = getEquationUnknownOperatorPool(config);
  if (equationUnknownOps.length > 0) {
    if (equationUnknownOps.includes("multiplication")) {
      const factors = sanitizeOneToTenList(config.multiplication.factors);
      if (factors.length === 0) {
        errors.push(t('settings:validation.eqMulFactors'));
      }
    }
    if (equationUnknownOps.includes("division")) {
      const divisors = sanitizeOneToTenList(config.division.divisors);
      if (!isRangeValid(config.division.answerMin, config.division.answerMax)) {
        errors.push(t('settings:validation.eqDivRange'));
      }
      if (divisors.length === 0) {
        errors.push(t('settings:validation.eqDivDivisors'));
      }
    }
  }

  const { addition, subtraction, multiplication, division } = config;

  if (addition.enabled) {
    if (!isRangeValid(addition.leftMin, addition.leftMax)) {
      errors.push(t('settings:validation.addRange1'));
    }
    if (!isRangeValid(addition.rightMin, addition.rightMax)) {
      errors.push(t('settings:validation.addRange2'));
    }
    validateBasicOpQuestionModes(
      errors,
      t,
      'addition',
      true,
      addition.standardCalculation,
      addition.missingNumber,
      addition.fractions,
      addition.wordProblems,
    );
  }

  if (subtraction.enabled) {
    if (!isRangeValid(subtraction.firstMin, subtraction.firstMax)) {
      errors.push(t('settings:validation.addRange1'));
    }
    if (!isRangeValid(subtraction.secondMin, subtraction.secondMax)) {
      errors.push(t('settings:validation.addRange2'));
    }
    validateBasicOpQuestionModes(
      errors,
      t,
      'subtraction',
      true,
      subtraction.standardCalculation,
      subtraction.missingNumber,
      subtraction.fractions,
      subtraction.wordProblems,
    );
  }

  if (multiplication.enabled) {
    const factors = sanitizeOneToTenList(multiplication.factors);
    if (factors.length === 0) {
      errors.push(t('settings:validation.mulFactors'));
    }
    validateBasicOpQuestionModes(
      errors,
      t,
      'multiplication',
      true,
      multiplication.standardCalculation,
      multiplication.missingNumber,
      multiplication.fractions,
      multiplication.wordProblems,
    );
  }

  if (division.enabled) {
    if (!isRangeValid(division.answerMin, division.answerMax)) {
      errors.push(t('settings:validation.divRange'));
    }
    const divisors = sanitizeOneToTenList(division.divisors);
    if (divisors.length === 0) {
      errors.push(t('settings:validation.divDivisors'));
    }
    if (division.allowRemainders) {
      const validDivisors = divisors.filter((d) => d >= 2);
      if (validDivisors.length === 0) {
        errors.push(t('settings:validation.divRemainders'));
      }
    }
    validateBasicOpQuestionModes(
      errors,
      t,
      'division',
      true,
      division.standardCalculation,
      division.missingNumber,
      division.fractions,
      division.wordProblems,
    );
  }

  if (config.rounding.enabled) {
    if (
      !config.rounding.nearest10 &&
      !config.rounding.nearest100 &&
      !config.rounding.nearestWhole &&
      !config.rounding.nearestTenth &&
      !config.rounding.nearestHundredth
    ) {
      errors.push(t('settings:validation.rounding'));
    }
  }

  if (config.geometry.enabled) {
    if (countEnabledGeometryShapes(config.geometry) === 0) {
      errors.push(t('settings:validation.geometryShapes'));
    }
    if (
      !config.geometry.questionKinds.formula &&
      !config.geometry.questionKinds.calculate
    ) {
      errors.push(t('settings:validation.geometryQuestions'));
    }
    if (
      !config.geometry.perimeter.enabled &&
      !config.geometry.area.enabled &&
      !config.geometry.volume.enabled
    ) {
      errors.push(t('settings:validation.geometryMeasure'));
    }
  }

  if (
    config.equivalentExpressions.enabled &&
    !hasEquivalentExpressionsSource(config)
  ) {
    errors.push(t('settings:validation.equivalentExpressions'));
  }

  if (config.trigonometry.enabled) {
    if (
      !config.trigonometry.questionKinds.pickFormula &&
      !config.trigonometry.questionKinds.nameSide
    ) {
      errors.push(t('settings:validation.trigModes'));
    }
    if (
      config.trigonometry.questionKinds.pickFormula &&
      !config.trigonometry.ratios.sin &&
      !config.trigonometry.ratios.cos &&
      !config.trigonometry.ratios.tan &&
      !config.trigonometry.ratios.cot
    ) {
      errors.push(t('settings:validation.trigRatios'));
    }
  }

  if (config.mode !== "timed") {
    const counts = new Set<number>(QUESTION_COUNT_OPTIONS);
    if (!counts.has(config.questionsCount)) {
      errors.push(t('settings:validation.questionCount'));
    }
  }

  if (
    config.answerEntryMode !== "keyboard" &&
    !VALID_ANSWER_OPTION_COUNTS.includes(config.answerOptionsCount)
  ) {
    errors.push(t('settings:validation.answerChoices'));
  }

  if (config.timerEnabled && !Number.isFinite(config.timerSecondsPerQuestion)) {
    errors.push(t('settings:validation.timer'));
  }

  if (config.square.enabled) {
    validateBasicOpQuestionModes(
      errors,
      t,
      'square',
      true,
      config.square.standardCalculation,
      false,
      config.square.fractions,
      false,
    );
  }

  if (config.squareRoot.enabled) {
    validateBasicOpQuestionModes(
      errors,
      t,
      'square_root',
      true,
      config.squareRoot.standardCalculation,
      false,
      config.squareRoot.fractions,
      false,
    );
  }

  if (addition.enabled && addition.answerMax !== "unlimited") {
    const { low, high } = finalResultBand(config);
    const minSum = addition.leftMin + addition.rightMin;
    const maxSum = addition.leftMax + addition.rightMax;
    if (!intervalsOverlap(minSum, maxSum, low, high)) {
      errors.push(t('settings:validation.addCap'));
    }
  }

  if (!isFinalResultCapValue(config.maxFinalResult)) {
    errors.push(t('settings:validation.unsupportedCap'));
  }

  return { valid: errors.length === 0, errors };
}

export function sanitizeOneToTenList(values: unknown): number[] {
  if (!Array.isArray(values)) return [];
  const set = new Set<number>();
  for (const v of values) {
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isInteger(n) && n >= 1 && n <= 10) set.add(n);
  }
  return [...set].sort((a, b) => a - b);
}

export { getMultiplicationSecondFactorPool } from '@/features/learning-plan/multiplicationPool.utils';

function inferFactorsFromLegacyRanges(legacy: {
  leftMin: number;
  leftMax: number;
  rightMin: number;
  rightMax: number;
}): number[] {
  const set = new Set<number>();
  const ranges: [number, number][] = [
    [legacy.leftMin, legacy.leftMax],
    [legacy.rightMin, legacy.rightMax],
  ];
  for (const [lo, hi] of ranges) {
    for (const n of ONE_TO_TEN_NUMBERS) {
      if (n >= lo && n <= hi) set.add(n);
    }
  }
  return set.size > 0
    ? [...set].sort((a, b) => a - b)
    : [...ONE_TO_TEN_NUMBERS];
}

function inferDivisorsFromLegacyRange(
  divisorMin: number,
  divisorMax: number,
): number[] {
  const set = new Set<number>();
  for (const n of ONE_TO_TEN_NUMBERS) {
    if (n >= divisorMin && n <= divisorMax) set.add(n);
  }
  return set.size > 0
    ? [...set].sort((a, b) => a - b)
    : [...ONE_TO_TEN_NUMBERS];
}

function parseMultiplicationSecondFactorSource(
  raw: unknown,
): MultiplicationSecondFactorSource {
  if (
    raw === "one_to_ten" ||
    raw === "one_to_twenty" ||
    raw === "selection_only"
  )
    return raw;
  return "selection_only";
}

/** Accepts current or legacy persisted multiplication shape. */
export function normalizeMultiplicationConfig(
  raw: unknown,
  legacyQuestionStyles?: unknown,
): MultiplicationConfig {
  const m = raw as Record<string, unknown>;
  const enabled = !!m.enabled;
  const secondFactorSource = parseMultiplicationSecondFactorSource(
    m.secondFactorSource,
  );
  const randomizeFactorOrder = m.randomizeFactorOrder === true;
  const missingNumberMode = normalizeSpecialQuestionMode(
    m.missingNumberMode,
    missingNumberModeFromLegacyQuestionStyles(legacyQuestionStyles),
  );
  const standardCalculation =
    typeof m.standardCalculation === "boolean"
      ? m.standardCalculation
      : missingNumberMode !== "only";
  const missingNumber =
    typeof m.missingNumber === "boolean"
      ? m.missingNumber
      : missingNumberMode !== "off";
  const allowNegativeNumbers = m.allowNegativeNumbers === true;
  const wordProblems =
    m.wordProblems === true ||
    legacyWordProblemsEnabled(legacyQuestionStyles);
  const fromFactors = sanitizeOneToTenList(m.factors);
  if (fromFactors.length > 0) {
    return {
      enabled,
      standardCalculation,
      allowNegativeNumbers,
      factors: fromFactors,
      secondFactorSource,
      randomizeFactorOrder,
      missingNumber,
      fractions: m.fractions === true,
      fractionDenominatorMode: normalizeFractionDenominatorMode(
        m.fractionDenominatorMode,
      ),
      allowDecimals: m.allowDecimals === true,
      wordProblems,
    };
  }
  if (
    typeof m.leftMin === "number" &&
    typeof m.leftMax === "number" &&
    typeof m.rightMin === "number" &&
    typeof m.rightMax === "number"
  ) {
    return {
      enabled,
      factors: inferFactorsFromLegacyRanges({
        leftMin: m.leftMin,
        leftMax: m.leftMax,
        rightMin: m.rightMin,
        rightMax: m.rightMax,
      }),
      secondFactorSource,
      randomizeFactorOrder,
      standardCalculation,
      allowNegativeNumbers,
      missingNumber,
      fractions: m.fractions === true,
      fractionDenominatorMode: normalizeFractionDenominatorMode(
        m.fractionDenominatorMode,
      ),
      allowDecimals: m.allowDecimals === true,
      wordProblems,
    };
  }
  return {
    enabled,
    factors: [...ONE_TO_TEN_NUMBERS],
    secondFactorSource,
    randomizeFactorOrder,
    standardCalculation,
    allowNegativeNumbers,
    missingNumber,
    fractions: m.fractions === true,
    fractionDenominatorMode: normalizeFractionDenominatorMode(
      m.fractionDenominatorMode,
    ),
    allowDecimals: m.allowDecimals === true,
    wordProblems,
  };
}

/** Accepts current or legacy persisted division shape. */
export function normalizeDivisionConfig(
  raw: unknown,
  legacyQuestionStyles?: unknown,
): DivisionConfig {
  const m = raw as Record<string, unknown>;
  const enabled = !!m.enabled;
  const answerMin = typeof m.answerMin === "number" ? m.answerMin : 1;
  const answerMax = typeof m.answerMax === "number" ? m.answerMax : 10;
  const allowRemainders = m.allowRemainders === true;
  const missingNumberMode = normalizeSpecialQuestionMode(
    m.missingNumberMode,
    missingNumberModeFromLegacyQuestionStyles(legacyQuestionStyles),
  );
  const standardCalculation =
    typeof m.standardCalculation === "boolean"
      ? m.standardCalculation
      : missingNumberMode !== "only";
  const missingNumber =
    typeof m.missingNumber === "boolean"
      ? m.missingNumber
      : missingNumberMode !== "off";
  const allowNegativeNumbers = m.allowNegativeNumbers === true;
  const wordProblems =
    m.wordProblems === true ||
    legacyWordProblemsEnabled(legacyQuestionStyles);
  const fromDivisors = sanitizeOneToTenList(m.divisors);
  if (fromDivisors.length > 0) {
    return {
      enabled,
      standardCalculation,
      allowNegativeNumbers,
      answerMin,
      answerMax,
      divisors: fromDivisors,
      allowRemainders,
      missingNumber,
      fractions: m.fractions === true,
      fractionDenominatorMode: normalizeFractionDenominatorMode(
        m.fractionDenominatorMode,
      ),
      allowDecimals: m.allowDecimals === true,
      wordProblems,
    };
  }
  if (typeof m.divisorMin === "number" && typeof m.divisorMax === "number") {
    return {
      enabled,
      answerMin,
      answerMax,
      divisors: inferDivisorsFromLegacyRange(m.divisorMin, m.divisorMax),
      allowRemainders,
      standardCalculation,
      allowNegativeNumbers,
      missingNumber,
      fractions: m.fractions === true,
      fractionDenominatorMode: normalizeFractionDenominatorMode(
        m.fractionDenominatorMode,
      ),
      allowDecimals: m.allowDecimals === true,
      wordProblems,
    };
  }
  return {
    enabled,
    answerMin,
    answerMax,
    divisors: [...ONE_TO_TEN_NUMBERS],
    allowRemainders,
    standardCalculation,
    allowNegativeNumbers,
    missingNumber,
    fractions: m.fractions === true,
    fractionDenominatorMode: normalizeFractionDenominatorMode(
      m.fractionDenominatorMode,
    ),
    allowDecimals: m.allowDecimals === true,
    wordProblems,
  };
}

export function clampTimerSeconds(raw: number): number {
  if (!Number.isFinite(raw)) return TIMER_SECONDS_DEFAULT;
  const snapped = Math.round(raw / TIMER_SECONDS_STEP) * TIMER_SECONDS_STEP;
  return Math.min(TIMER_SECONDS_MAX, Math.max(TIMER_SECONDS_MIN, snapped));
}

/** Snaps operand high bounds to allowed slider values (minimum 5). */
function snapAdditionSubtractionMax(n: number): number {
  const opts = ADDITION_SUBTRACTION_MAX_OPTIONS;
  const floor = opts[0]!;
  const x = Math.max(floor, Number.isFinite(n) ? Math.trunc(n) : floor);
  let best: (typeof opts)[number] = floor;
  for (const v of opts) {
    const dv = Math.abs(v - x);
    const db = Math.abs(best - x);
    if (dv < db) best = v;
    else if (dv === db && v > best) best = v;
  }
  return best;
}

function normalizeSquareOperandMax(raw: unknown): SquareOperandMax {
  return raw === 20 ? 20 : 10;
}

function normalizeSquareConfig(raw: unknown): SquareConfig {
  if (!raw || typeof raw !== "object")
    return { enabled: false, operandMax: 10, standardCalculation: true, fractions: false };
  const r = raw as Record<string, unknown>;
  return {
    enabled: r.enabled === true,
    operandMax: normalizeSquareOperandMax(r.operandMax),
    standardCalculation: r.standardCalculation !== false,
    fractions: r.fractions === true,
  };
}

function normalizeSquareRootRootMax(raw: unknown): SquareRootRootMax {
  return raw === 20 ? 20 : 10;
}

function normalizeSquareRootConfig(raw: unknown): SquareRootConfig {
  if (!raw || typeof raw !== "object")
    return { enabled: false, rootMax: 10, standardCalculation: true, fractions: false };
  const r = raw as Record<string, unknown>;
  return {
    enabled: r.enabled === true,
    rootMax: normalizeSquareRootRootMax(r.rootMax),
    standardCalculation: r.standardCalculation !== false,
    fractions: r.fractions === true,
  };
}

function normalizeRoundingConfig(raw: unknown): RoundingConfig {
  const base: RoundingConfig = { ...DEFAULT_ROUNDING_CONFIG };
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  return {
    enabled: r.enabled === true,
    nearest10: r.nearest10 === true,
    nearest100: r.nearest100 === true,
    nearestWhole: r.nearestWhole === true,
    nearestTenth: r.nearestTenth === true,
    nearestHundredth: r.nearestHundredth === true,
  };
}

function normalizeOrderOfOpsOperandMax(raw: unknown): OrderOfOpsOperandMax {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (n === 5) return 5;
  if (n === 20) return 20;
  return 10;
}

function normalizeOrderOfOperationsConfig(
  raw: unknown,
): OrderOfOperationsConfig {
  const base: OrderOfOperationsConfig = {
    ...DEFAULT_ORDER_OF_OPERATIONS_CONFIG,
  };
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  return {
    enabled: r.enabled === true,
    operandMax: normalizeOrderOfOpsOperandMax(r.operandMax),
    includeSquaring: r.includeSquaring === true,
    includeSquareRoots: r.includeSquareRoots === true,
  };
}

function normalizeEquivalentExpressionsConfig(raw: unknown): EquivalentExpressionsConfig {
  const base = { ...DEFAULT_EQUIVALENT_EXPRESSIONS_CONFIG };
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  return {
    enabled: r.enabled === true,
    squareOfSum: r.squareOfSum === true,
    squareOfDifference: r.squareOfDifference === true,
    parenthesesAfterAddition: r.parenthesesAfterAddition === true,
    parenthesesAfterSubtraction: r.parenthesesAfterSubtraction === true,
    distributiveProperty: r.distributiveProperty === true,
    differenceOfSquares: r.differenceOfSquares === true,
    factorization: r.factorization === true,
  };
}

function normalizeComparisonConfig(raw: unknown): ComparisonConfig {
  const base = { ...DEFAULT_COMPARISON_CONFIG };
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const enabled = r.enabled === true;
  const isLegacy =
    enabled &&
    !("relational" in r) &&
    !("ordering" in r) &&
    !("expressionCompare" in r) &&
    !("fractionVsDecimal" in r) &&
    !("percentVsFraction" in r) &&
    !("fractionVsFraction" in r) &&
    !("measurementUnitConversion" in r);

  return {
    enabled,
    relational: isLegacy ? true : r.relational === true,
    ordering: isLegacy ? true : r.ordering === true,
    // Preserve the previous automatic behavior for existing saved plans.
    expressionCompare: r.expressionCompare !== false,
    fractionVsDecimal: r.fractionVsDecimal === true,
    percentVsFraction: r.percentVsFraction === true,
    fractionVsFraction: r.fractionVsFraction === true,
    measurementUnitConversion: r.measurementUnitConversion === true,
  };
}

function normalizeEquationTwoUnknownsConfig(raw: unknown): EquationTwoUnknownsConfig {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_EQUATION_TWO_UNKNOWNS_CONFIG };
  const r = raw as Record<string, unknown>;
  const ops = r.operators;
  const base = DEFAULT_EQUATION_TWO_UNKNOWNS_CONFIG.operators;
  if (!ops || typeof ops !== "object") {
    return { enabled: r.enabled === true, operators: { ...base } };
  }
  const o = ops as Record<string, unknown>;
  const operators = {
    addition: o.addition === true,
    subtraction: o.subtraction === true,
    multiplication: o.multiplication === true,
    division: o.division === true,
  };
  return {
    enabled: r.enabled === true || Object.values(operators).some(Boolean),
    operators,
  };
}

function normalizeFractionVisualConfig(raw: unknown): FractionVisualConfig {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_FRACTION_VISUAL_CONFIG };
  const r = raw as Record<string, unknown>;
  return { enabled: r.enabled === true };
}

export function ensureLearningConfigShape(
  config: MathLearningConfig,
): MathLearningConfig {
  const legacyQuestionStyles = (
    config as MathLearningConfig & { questionStyles?: unknown }
  ).questionStyles;
  const maxFinal = normalizeMaxFinalResult(config.maxFinalResult);
  const rawAddition = (config as MathLearningConfig & { addition?: unknown })
    .addition;
  const normalizedAddition = normalizeAdditionConfig(
    rawAddition,
    legacyQuestionStyles,
  );
  const normalizedSubtraction = normalizeSubtractionConfig(
    (config as MathLearningConfig & { subtraction?: unknown }).subtraction,
    legacyQuestionStyles,
  );

  const timerSecondsRaw =
    typeof config.timerSecondsPerQuestion === "number"
      ? config.timerSecondsPerQuestion
      : TIMER_SECONDS_DEFAULT;

  const addLMax = snapAdditionSubtractionMax(normalizedAddition.leftMax);
  const addRMax = snapAdditionSubtractionMax(normalizedAddition.rightMax);
  const rawAnswerMax =
    rawAddition && typeof rawAddition === "object"
      ? (rawAddition as Record<string, unknown>).answerMax
      : undefined;
  const additionHasAnswerMax =
    rawAnswerMax === "unlimited" || typeof rawAnswerMax === "number";
  const addAnswerMax: AdditionAnswerMax =
    rawAnswerMax === "unlimited"
      ? "unlimited"
      : additionHasAnswerMax
        ? snapAdditionAnswerMax(normalizedAddition.answerMax)
        : maxFinal === "unlimited"
          ? "unlimited"
          : snapAdditionAnswerMax(
              typeof maxFinal === "number" ? maxFinal : 10,
            );
  const subFMax = snapAdditionSubtractionMax(normalizedSubtraction.firstMax);
  const subSMax = snapAdditionSubtractionMax(normalizedSubtraction.secondMax);

  return {
    ...config,
    mode: normalizeLearningMode(config.mode),
    timedDurationMinutes: normalizeTimedDurationMinutes(
      (config as MathLearningConfig & { timedDurationMinutes?: unknown })
        .timedDurationMinutes,
    ),
    timedSubtractSecondsOnWrong: normalizeTimedSubtractSecondsOnWrong(
      (config as MathLearningConfig & { timedSubtractSecondsOnWrong?: unknown })
        .timedSubtractSecondsOnWrong,
    ),
    addition: {
      ...normalizedAddition,
      leftMax: addLMax,
      rightMax: addRMax,
      answerMax: addAnswerMax,
      leftMin: Math.min(normalizedAddition.leftMin, addLMax),
      rightMin: Math.min(normalizedAddition.rightMin, addRMax),
    },
    subtraction: {
      ...normalizedSubtraction,
      firstMax: subFMax,
      secondMax: subSMax,
      firstMin: Math.min(normalizedSubtraction.firstMin, subFMax),
      secondMin: Math.min(normalizedSubtraction.secondMin, subSMax),
    },
    multiplication: normalizeMultiplicationConfig(
      config.multiplication as unknown,
      legacyQuestionStyles,
    ),
    division: normalizeDivisionConfig(
      config.division as unknown,
      legacyQuestionStyles,
    ),
    square: normalizeSquareConfig(
      (config as MathLearningConfig & { square?: unknown }).square,
    ),
    squareRoot: normalizeSquareRootConfig(
      (config as MathLearningConfig & { squareRoot?: unknown }).squareRoot,
    ),
    rounding: normalizeRoundingConfig(
      (config as MathLearningConfig & { rounding?: unknown }).rounding,
    ),
    orderOfOperations: normalizeOrderOfOperationsConfig(
      (config as MathLearningConfig & { orderOfOperations?: unknown })
        .orderOfOperations,
    ),
    equivalentExpressions: normalizeEquivalentExpressionsConfig(
      (config as MathLearningConfig & { equivalentExpressions?: unknown })
        .equivalentExpressions,
    ),
    equationUnknown: normalizeEquationUnknownConfig(
      (config as MathLearningConfig & { equationUnknown?: unknown })
        .equationUnknown,
    ),
    geometry: normalizeGeometryConfig(
      (config as MathLearningConfig & { geometry?: unknown }).geometry,
    ),
    comparison: normalizeComparisonConfig(
      (config as MathLearningConfig & { comparison?: unknown }).comparison,
    ),
    equationTwoUnknowns: normalizeEquationTwoUnknownsConfig(
      (config as MathLearningConfig & { equationTwoUnknowns?: unknown })
        .equationTwoUnknowns,
    ),
    fractionVisual: normalizeFractionVisualConfig(
      (config as MathLearningConfig & { fractionVisual?: unknown }).fractionVisual,
    ),
    shapeRecognition: normalizeShapeRecognitionConfig(
      (config as MathLearningConfig & { shapeRecognition?: unknown }).shapeRecognition,
    ),
    numberSense: normalizeNumberSenseConfig(
      (config as MathLearningConfig & { numberSense?: unknown }).numberSense,
    ),
    clock: normalizeClockConfig(
      (config as MathLearningConfig & { clock?: unknown }).clock,
    ),
    patterns: normalizePatternsConfig(
      (config as MathLearningConfig & { patterns?: unknown }).patterns,
    ),
    differentiation: normalizeDifferentiationConfig(
      (config as MathLearningConfig & { differentiation?: unknown }).differentiation,
    ),
    integration: normalizeIntegrationConfig(
      (config as MathLearningConfig & { integration?: unknown }).integration,
    ),
    trigonometry: normalizeTrigonometryConfig(
      (config as MathLearningConfig & { trigonometry?: unknown }).trigonometry,
    ),
    answerEntryMode: normalizeAnswerEntryMode(config.answerEntryMode),
    answerOptionsCount: normalizeAnswerOptionsCount(config.answerOptionsCount),
    maxFinalResult: maxFinal,
    timerEnabled: Boolean(config.timerEnabled),
    timerSecondsPerQuestion: clampTimerSeconds(timerSecondsRaw),
    confirmAnswerBeforeSubmit: Boolean(
      (config as MathLearningConfig & { confirmAnswerBeforeSubmit?: unknown })
        .confirmAnswerBeforeSubmit,
    ),
  };
}
