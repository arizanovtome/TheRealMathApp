import type { AdditionAnswerMax } from '@/constants/ranges';
import type { GeometryConfig } from '@/features/geometry/geometry.types';
import { DEFAULT_GEOMETRY_CONFIG } from '@/features/geometry/geometry.types';
import type { ShapeRecognitionConfig } from '@/features/shapes/shapeRecognition.types';
import { DEFAULT_SHAPE_RECOGNITION_CONFIG } from '@/features/shapes/shapeRecognition.types';
import type { CalculusOpConfig } from '@/features/calculus/calculus.types';
import {
  DEFAULT_DIFFERENTIATION_CONFIG,
  DEFAULT_INTEGRATION_CONFIG,
} from '@/features/calculus/calculus.types';
import type { TrigonometryConfig } from '@/features/trigonometry/trigonometry.types';
import { DEFAULT_TRIGONOMETRY_CONFIG } from '@/features/trigonometry/trigonometry.types';
import type { LogarithmConfig } from '@/features/logarithm/logarithm.types';
import { DEFAULT_LOGARITHM_CONFIG } from '@/features/logarithm/logarithm.types';

export type { GeometryConfig };
export { DEFAULT_GEOMETRY_CONFIG };
export type { ShapeRecognitionConfig };
export { DEFAULT_SHAPE_RECOGNITION_CONFIG };
export type { CalculusOpConfig };
export { DEFAULT_DIFFERENTIATION_CONFIG, DEFAULT_INTEGRATION_CONFIG };
export type { TrigonometryConfig };
export { DEFAULT_TRIGONOMETRY_CONFIG };
export type { LogarithmConfig };
export { DEFAULT_LOGARITHM_CONFIG };

export type MathOperation =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'square'
  | 'square_root'
  | 'rounding'
  | 'order_of_operations'
  | 'equivalent_expressions'
  | 'geometry'
  | 'comparison'
  | 'fraction_visual'
  | 'shape_recognition'
  | 'number_sense'
  | 'clock'
  | 'pattern'
  | 'differentiation'
  | 'integration'
  | 'trigonometry'
  | 'logarithm';

/** Every {@link MathOperation} — use for stats rollups and progress UI ordering. */
export const ALL_MATH_OPERATIONS: readonly MathOperation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'square',
  'square_root',
  'rounding',
  'order_of_operations',
  'equivalent_expressions',
  'geometry',
  'comparison',
  'fraction_visual',
  'shape_recognition',
  'number_sense',
  'clock',
  'pattern',
  'differentiation',
  'integration',
  'trigonometry',
  'logarithm',
] as const;

export type SpecialQuestionMode = 'off' | 'mixed' | 'only';

export type FractionDenominatorMode = 'same_only' | 'different_only' | 'mixed';

export const FRACTION_DENOMINATOR_MODE_OPTIONS: {
  value: FractionDenominatorMode;
  label: string;
  shortLabel: string;
  hint: string;
}[] = [
  {
    value: 'same_only',
    label: 'Same denominator',
    shortLabel: 'Same',
    hint: 'e.g. 1/4 + 2/4',
  },
  {
    value: 'different_only',
    label: 'Different denominators',
    shortLabel: 'Different',
    hint: 'e.g. 1/2 + 1/3',
  },
  {
    value: 'mixed',
    label: 'Mix of both',
    shortLabel: 'Mix',
    hint: 'Same and different denominators',
  },
];

export type AdditionConfig = {
  enabled: boolean;
  standardCalculation: boolean;
  allowNegativeNumbers: boolean;
  leftMin: number;
  leftMax: number;
  rightMin: number;
  rightMax: number;
  /** Highest allowed addition result, or unlimited. */
  answerMax: AdditionAnswerMax;
  missingNumber: boolean;
  fractions: boolean;
  fractionDenominatorMode: FractionDenominatorMode;
  /** When true, include a mix of regrouping and non-regrouping whole-number questions. */
  regrouping: boolean;
  /** When true, standard calculation may use one-decimal-place operands and results. */
  allowDecimals: boolean;
  wordProblems: boolean;
};

export type SubtractionConfig = {
  enabled: boolean;
  standardCalculation: boolean;
  allowNegativeNumbers: boolean;
  firstMin: number;
  firstMax: number;
  secondMin: number;
  secondMax: number;
  missingNumber: boolean;
  allowNegativeAnswers: boolean;
  fractions: boolean;
  fractionDenominatorMode: FractionDenominatorMode;
  /** When true, include a mix of regrouping and non-regrouping whole-number questions. */
  regrouping: boolean;
  allowDecimals: boolean;
  wordProblems: boolean;
};

/** Integers 1–10 used when picking multiplication factors or division divisors. */
export const ONE_TO_TEN_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/** Integers 1–20 for multiplication second factor when using full 1–20 pool. */
export const ONE_TO_TWENTY_NUMBERS: readonly number[] = Array.from({ length: 20 }, (_, i) => i + 1);

/**
 * Where the second factor is drawn from. The first factor always uses `factors`.
 */
export type MultiplicationSecondFactorSource = 'selection_only' | 'one_to_ten' | 'one_to_twenty';

export const MULTIPLICATION_SECOND_FACTOR_OPTIONS: {
  value: MultiplicationSecondFactorSource;
  label: string;
  hint: string;
}[] = [
  {
    value: 'selection_only',
    label: 'Selected only',
    hint: 'Second number is also one of your selected numbers.',
  },
  {
    value: 'one_to_ten',
    label: '1–10',
    hint: 'Second number can be any whole number from 1 to 10.',
  },
  {
    value: 'one_to_twenty',
    label: '1–20',
    hint: 'Second number can be any whole number from 1 to 20.',
  },
];

export type MultiplicationConfig = {
  enabled: boolean;
  standardCalculation: boolean;
  allowNegativeNumbers: boolean;
  /** First factor in each question is chosen from this set (must be non-empty when enabled). */
  factors: number[];
  /** Pool for the second factor; first factor always uses `factors`. */
  secondFactorSource: MultiplicationSecondFactorSource;
  /**
   * When true, either factor may appear left of × (e.g. 8 × 5 as well as 5 × 8).
   * When false, the factor from `factors` is always shown first.
   */
  randomizeFactorOrder: boolean;
  missingNumber: boolean;
  fractions: boolean;
  fractionDenominatorMode: FractionDenominatorMode;
  allowDecimals: boolean;
  wordProblems: boolean;
};

export type DivisionConfig = {
  enabled: boolean;
  standardCalculation: boolean;
  allowNegativeNumbers: boolean;
  answerMin: number;
  answerMax: number;
  /** Quotient division uses only these divisors (must be non-empty when enabled). */
  divisors: number[];
  /** When true, division may ask for quotient and remainder (e.g. 17 ÷ 5 = 3 R 2). */
  allowRemainders: boolean;
  missingNumber: boolean;
  fractions: boolean;
  fractionDenominatorMode: FractionDenominatorMode;
  allowDecimals: boolean;
  wordProblems: boolean;
};

export type QuestionStyle =
  | 'standard'
  | 'missing_number'
  | 'fraction'
  | 'word_problem';

/** @deprecated Legacy persisted shape; word problems now live on each basic operation config. */
export type QuestionStylesConfig = {
  standardCalculation: boolean;
  missingNumber: boolean;
  wordProblems: boolean;
};

/** @deprecated Only used when migrating older saved configs. */
export const DEFAULT_QUESTION_STYLES_CONFIG: QuestionStylesConfig = {
  standardCalculation: true,
  missingNumber: false,
  wordProblems: false,
};

/** Base n in n² = ?, drawn uniformly from 1…operandMax. */
export const SQUARE_OPERAND_MAX_OPTIONS = [10, 20] as const;
export type SquareOperandMax = (typeof SQUARE_OPERAND_MAX_OPTIONS)[number];

export type SquareConfig = {
  enabled: boolean;
  operandMax: SquareOperandMax;
  standardCalculation: boolean;
  fractions: boolean;
};

/** Integer root r in √(r²) = ?, drawn uniformly from 1…rootMax (radicand is always a perfect square). */
export const SQUARE_ROOT_ROOT_MAX_OPTIONS = [10, 20] as const;
export type SquareRootRootMax = (typeof SQUARE_ROOT_ROOT_MAX_OPTIONS)[number];

export type SquareRootConfig = {
  enabled: boolean;
  rootMax: SquareRootRootMax;
  standardCalculation: boolean;
  fractions: boolean;
};

export type RoundingNearest = 10 | 100 | 'whole' | 'tenth' | 'hundredth';

/** Round numbers to whole-number, decimal-place, ten, or hundred targets. */
export type RoundingConfig = {
  enabled: boolean;
  nearest10: boolean;
  nearest100: boolean;
  nearestWhole: boolean;
  nearestTenth: boolean;
  nearestHundredth: boolean;
  /** Legacy values kept for migration from older persisted plans. */
  valueMin?: number;
  valueMax?: number;
};

export const DEFAULT_ROUNDING_CONFIG: RoundingConfig = {
  enabled: false,
  nearest10: true,
  nearest100: false,
  nearestWhole: false,
  nearestTenth: false,
  nearestHundredth: false,
};

/** Each of a, b, c in “a + b × c = ?” (multiply before add). */
export const ORDER_OF_OPS_OPERAND_MAX_OPTIONS = [5, 10, 20] as const;
export type OrderOfOpsOperandMax = (typeof ORDER_OF_OPS_OPERAND_MAX_OPTIONS)[number];

export type OrderOfOperationsConfig = {
  enabled: boolean;
  /** Operands a, b, c are each chosen uniformly from 1…operandMax. */
  operandMax: OrderOfOpsOperandMax;
  includeSquaring: boolean;
  includeSquareRoots: boolean;
};

export const DEFAULT_ORDER_OF_OPERATIONS_CONFIG: OrderOfOperationsConfig = {
  enabled: false,
  operandMax: 10,
  includeSquaring: false,
  includeSquareRoots: false,
};

export type EquivalentExpressionsConfig = {
  enabled: boolean;
  squareOfSum: boolean;
  squareOfDifference: boolean;
  parenthesesAfterAddition: boolean;
  parenthesesAfterSubtraction: boolean;
  distributiveProperty: boolean;
  differenceOfSquares: boolean;
  factorization: boolean;
};

export const DEFAULT_EQUIVALENT_EXPRESSIONS_CONFIG: EquivalentExpressionsConfig = {
  enabled: false,
  squareOfSum: true,
  squareOfDifference: true,
  parenthesesAfterAddition: true,
  parenthesesAfterSubtraction: true,
  distributiveProperty: true,
  differenceOfSquares: true,
  factorization: true,
};

export type LearningMode = 'practice' | 'quiz' | 'timed';

/** Minutes 1–10 for timed session total length. */
export const TIMED_DURATION_MINUTES_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export type TimedDurationMinutes = (typeof TIMED_DURATION_MINUTES_OPTIONS)[number];

/** Seconds removed from the session clock on each wrong answer when `timedSubtractSecondsOnWrong` is on. */
export const TIMED_WRONG_ANSWER_PENALTY_SECONDS = 15;

/** Multiple-choice chip count, or keyboard entry (no choice buttons). */
export type AnswerEntryMode = 'multiple_choice' | 'keyboard';

/** Supported multiple-choice counts (maximum shown per question). */
export const ANSWER_OPTIONS_COUNT_OPTIONS = [2, 3, 4, 6] as const;
export type AnswerOptionsCount = (typeof ANSWER_OPTIONS_COUNT_OPTIONS)[number];

/** Legacy upper bound. New plans use `addition.answerMax`; this stays for persisted plans. */
export const FINAL_RESULT_CAP_OPTIONS = [10, 20, 100, 1000] as const;
export type FinalResultCapNumeric = (typeof FINAL_RESULT_CAP_OPTIONS)[number];
/** `unlimited` skips the final-result ceiling in validation and generation. */
export type FinalResultCap = FinalResultCapNumeric | 'unlimited';

/** Which equation templates appear when “Equations (x)” is on. */
export type EquationUnknownOperatorsConfig = {
  addition: boolean;
  subtraction: boolean;
  multiplication: boolean;
  division: boolean;
};

export type EquationUnknownConfig = {
  mode: SpecialQuestionMode;
  /** Legacy mirror of mode !== 'off'. */
  enabled: boolean;
  operators: EquationUnknownOperatorsConfig;
};

export const DEFAULT_EQUATION_UNKNOWN_CONFIG: EquationUnknownConfig = {
  mode: 'off',
  enabled: false,
  operators: {
    addition: false,
    subtraction: false,
    multiplication: false,
    division: false,
  },
};

export type EquationTwoUnknownsOperatorsConfig = {
  addition: boolean;
  subtraction: boolean;
  multiplication: boolean;
  division: boolean;
};

export type EquationTwoUnknownsConfig = {
  enabled: boolean;
  operators: EquationTwoUnknownsOperatorsConfig;
};

export const DEFAULT_EQUATION_TWO_UNKNOWNS_CONFIG: EquationTwoUnknownsConfig = {
  enabled: false,
  operators: {
    addition: false,
    subtraction: false,
    multiplication: false,
    division: false,
  },
};

export type ComparisonConfig = {
  enabled: boolean;
  relational: boolean;
  ordering: boolean;
  expressionCompare: boolean;
  fractionVsDecimal: boolean;
  percentVsFraction: boolean;
  fractionVsFraction: boolean;
  measurementUnitConversion: boolean;
};

export const DEFAULT_COMPARISON_CONFIG: ComparisonConfig = {
  enabled: false,
  relational: true,
  ordering: true,
  expressionCompare: true,
  fractionVsDecimal: false,
  percentVsFraction: false,
  fractionVsFraction: false,
  measurementUnitConversion: false,
};

export type FractionVisualConfig = {
  enabled: boolean;
};

export const DEFAULT_FRACTION_VISUAL_CONFIG: FractionVisualConfig = {
  enabled: false,
};

export type ClockMinuteGranularity = 1 | 5 | 15;

export type ClockConfig = {
  enabled: boolean;
  readAnalog: boolean;
  elapsedTime: boolean;
  hourFormat: 12 | 24;
  minuteGranularity: ClockMinuteGranularity;
};

export const DEFAULT_CLOCK_CONFIG: ClockConfig = {
  enabled: false,
  readAnalog: true,
  elapsedTime: false,
  hourFormat: 12,
  minuteGranularity: 15,
};

export type PatternsConfig = {
  enabled: boolean;
  arithmeticSequence: boolean;
  geometricSequence: boolean;
  numberPattern: boolean;
  shapePattern: boolean;
  coloredShapePattern: boolean;
};

export const DEFAULT_PATTERNS_CONFIG: PatternsConfig = {
  enabled: false,
  arithmeticSequence: true,
  geometricSequence: false,
  numberPattern: true,
  shapePattern: false,
  coloredShapePattern: false,
};

export type NumberSenseConfig = {
  enabled: boolean;
  numberRecognition: boolean;
  countObjects: boolean;
  beforeAfter: boolean;
  missingNumber: boolean;
  compareQuantities: boolean;
  oddEven: boolean;
  maxNumber: 5 | 10 | 20 | 100;
};

export const DEFAULT_NUMBER_SENSE_CONFIG: NumberSenseConfig = {
  enabled: false,
  numberRecognition: true,
  countObjects: true,
  beforeAfter: true,
  missingNumber: true,
  compareQuantities: true,
  oddEven: false,
  maxNumber: 10,
};

export type MathLearningConfig = {
  addition: AdditionConfig;
  subtraction: SubtractionConfig;
  multiplication: MultiplicationConfig;
  division: DivisionConfig;
  square: SquareConfig;
  squareRoot: SquareRootConfig;
  rounding: RoundingConfig;
  orderOfOperations: OrderOfOperationsConfig;
  equivalentExpressions: EquivalentExpressionsConfig;
  equationUnknown: EquationUnknownConfig;
  equationTwoUnknowns: EquationTwoUnknownsConfig;
  geometry: GeometryConfig;
  comparison: ComparisonConfig;
  fractionVisual: FractionVisualConfig;
  shapeRecognition: ShapeRecognitionConfig;
  numberSense: NumberSenseConfig;
  clock: ClockConfig;
  patterns: PatternsConfig;
  differentiation: CalculusOpConfig;
  integration: CalculusOpConfig;
  trigonometry: TrigonometryConfig;
  logarithm: LogarithmConfig;
  mode: LearningMode;
  questionsCount: number;
  answerEntryMode: AnswerEntryMode;
  answerOptionsCount: AnswerOptionsCount;
  /** Legacy global cap. Use `addition.answerMax` for addition result limits. */
  maxFinalResult: FinalResultCap;
  /** When false, no countdown per question. */
  timerEnabled: boolean;
  /** Seconds allowed per question when `timerEnabled` is true (clamped to TIMER_SECONDS_MIN–MAX). */
  timerSecondsPerQuestion: number;
  /** Total length of a timed run (minutes). */
  timedDurationMinutes: TimedDurationMinutes;
  /** When true, each wrong answer subtracts {@link TIMED_WRONG_ANSWER_PENALTY_SECONDS} from remaining time. */
  timedSubtractSecondsOnWrong: boolean;
  /**
   * When true, multiple-choice answers need a Confirm/Next tap after selection.
   * When false, the choice is submitted immediately (practice shows feedback at once; timed counts the answer at once).
   */
  confirmAnswerBeforeSubmit: boolean;
};

export const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20] as const;
export type QuestionsCountOption = (typeof QUESTION_COUNT_OPTIONS)[number];

/** Per-question countdown when the timer is enabled. */
export const TIMER_SECONDS_MIN = 10;
export const TIMER_SECONDS_MAX = 120;
export const TIMER_SECONDS_STEP = 5;
export const TIMER_SECONDS_DEFAULT = 45;
