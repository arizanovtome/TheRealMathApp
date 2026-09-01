import type {
  MathOperation,
  QuestionStyle,
  RoundingNearest,
} from '@/features/learning-plan/learningPlan.types';
import type {
  GeometryAnswerKind,
  GeometryMeasure,
  GeometryQuestionSubtype,
  GeometryShape,
} from '@/features/geometry/geometry.types';
import type { BasicShape } from '@/features/shapes/shapeRecognition.types';
import type { ShapeColor } from '@/features/shapes/shapeColors';
import type {
  TrigonometryDiagram,
  TrigonometryQuestionSubtype,
} from '@/features/trigonometry/trigonometry.types';
import type { LogarithmSubtype } from '@/features/logarithm/logarithm.types';
import type { AdvancedEquationSubtype } from '@/features/advanced-equations/advancedEquations.types';
import type { LimitSubtype } from '@/features/limits/limits.types';
import type { QuotientRemainder } from '@/features/questions/divisionRemainder';
import type { EquivalentExpressionSubtype } from '@/features/equivalent-expressions/equivalentExpressions.types';

export type ArithmeticAnswerKind = 'number' | 'fraction' | 'quotient_remainder';

export type Fraction = { numerator: number; denominator: number };

export type ArithmeticMathQuestion = {
  kind: 'arithmetic';
  id: string;
  operation: MathOperation;
  questionStyle: QuestionStyle;
  answerKind: ArithmeticAnswerKind;
  questionText: string;
  /** Numeric correct answer (whole number, hidden operand, or quotient when answerKind is quotient_remainder). */
  correctAnswer: number;
  correctFraction?: Fraction;
  quotientRemainder?: QuotientRemainder;
  answerOptions: (number | string)[];
  /** Present when `operation` is `rounding`. */
  roundingNearest?: RoundingNearest;
  /** Present when `operation` is `order_of_operations`; expression is always a + b × c. */
  ooOperands?: { a: number; b: number; c: number };
};

/** `x` is unknown; MC shows `x=<expression>` (never bare `x=<integer>`). */
export type EquationUnknownMathQuestion = {
  kind: 'equation_unknown';
  id: string;
  operation: MathOperation;
  questionText: string;
  /** Numeric value of `x`. */
  correctAnswer: number;
  /** Canonical expression after `x=` (e.g. `20:5`, `12-3`). */
  correctExpression: string;
  answerOptions: string[];
  /** Wrong expression for timer when there are no MC options. */
  fallbackWrongExpression: string;
};

export type GeometryMathQuestion = {
  kind: 'geometry';
  id: string;
  operation: 'geometry';
  measure: GeometryMeasure;
  shape: GeometryShape;
  subtype: GeometryQuestionSubtype;
  answerKind: GeometryAnswerKind;
  questionText: string;
  correctAnswer: number | string;
  answerOptions: string[];
  requiresMultipleChoice: boolean;
  dimensions: Record<string, number>;
};

export type ComparisonMathQuestion = {
  kind: 'comparison';
  id: string;
  operation: 'comparison';
  subtype:
    | 'relational'
    | 'expression'
    | 'ordering'
    | 'fraction_vs_decimal'
    | 'percent_vs_fraction'
    | 'fraction_vs_fraction'
    | 'measurement';
  questionText: string;
  correctAnswer: string;
  answerOptions: string[];
  requiresMultipleChoice: true;
};

export type EquivalentExpressionMathQuestion = {
  kind: 'equivalent_expression';
  id: string;
  operation: 'equivalent_expressions';
  subtype: EquivalentExpressionSubtype;
  questionText: string;
  correctAnswer: string;
  answerOptions: string[];
  requiresMultipleChoice: true;
};

export type EquationTwoUnknownMathQuestion = {
  kind: 'equation_two_unknown';
  id: string;
  operation: MathOperation;
  questionText: string;
  correctAnswer: number;
  answerOptions: number[];
};

export type FractionVisualMathQuestion = {
  kind: 'fraction_visual';
  id: string;
  operation: 'fraction_visual';
  model: 'bar' | 'circle';
  shaded: { numerator: number; denominator: number };
  questionText: string;
  correctAnswer: string;
  answerOptions: string[];
  requiresMultipleChoice: true;
};

export type ClockMathQuestion = {
  kind: 'clock';
  id: string;
  operation: 'clock';
  subtype: 'read_analog' | 'elapsed_time';
  questionText: string;
  correctAnswer: string;
  answerOptions: string[];
  requiresMultipleChoice: true;
  displayTime?: { hour: number; minute: number };
  elapsedStart?: { hour: number; minute: number };
  elapsedEnd?: { hour: number; minute: number };
};

export type PatternMathQuestion = {
  kind: 'pattern';
  id: string;
  operation: 'pattern';
  subtype: 'arithmetic_sequence' | 'geometric_sequence' | 'number_pattern' | 'shape_pattern' | 'colored_shape_pattern';
  questionText: string;
  sequenceDisplay?: string;
  sequenceShapes?: string[];
  sequenceColoredShapes?: { shape: BasicShape; color: ShapeColor }[];
  shapePatternAnswerOptions?: { label: string; shape: BasicShape }[];
  coloredShapeAnswerOptions?: { label: string; shape: BasicShape; color: ShapeColor }[];
  correctAnswer: string;
  answerOptions: string[];
  requiresMultipleChoice: true;
};
export type ColoredShapeItem = { shape: BasicShape; color: ShapeColor };
export type NumberSenseMathQuestion = { kind: 'number_sense'; id: string; operation: 'number_sense'; subtype: 'numberRecognition'|'countObjects'|'beforeAfter'|'missingNumber'|'compareQuantities'|'oddEven'; questionText: string; correctAnswer: string; answerOptions: string[]; requiresMultipleChoice: boolean; countTarget?: ColoredShapeItem; countingShapes?: ColoredShapeItem[]; quantityShapeGroups?: { first: ColoredShapeItem[]; second: ColoredShapeItem[] } };

export type CalculusMathQuestion = {
  kind: 'calculus';
  id: string;
  operation: 'differentiation' | 'integration';
  questionText: string;
  correctAnswer: string;
  answerOptions: string[];
  requiresMultipleChoice: true;
};

export type ShapeRecognitionMathQuestion = {
  kind: 'shape_recognition';
  id: string;
  operation: 'shape_recognition';
  shape: BasicShape;
  subtype: 'shape' | 'color' | 'color_and_shape';
  color: ShapeColor;
  questionText: string;
  correctAnswer: string;
  answerOptions: string[];
  requiresMultipleChoice: true;
};

export type TrigonometryMathQuestion = {
  kind: 'trigonometry';
  id: string;
  operation: 'trigonometry';
  subtype: TrigonometryQuestionSubtype;
  questionText: string;
  correctAnswer: string;
  answerOptions: string[];
  requiresMultipleChoice: true;
  diagram: TrigonometryDiagram;
};

export type LogarithmMathQuestion = {
  kind: 'logarithm';
  id: string;
  operation: 'logarithm';
  subtype: LogarithmSubtype;
  questionText: string;
  correctAnswer: string;
  answerOptions: string[];
  requiresMultipleChoice: true;
};

export type AdvancedEquationMathQuestion = {
  kind: 'advanced_equation'; id: string; operation: 'advanced_equations';
  subtype: AdvancedEquationSubtype; questionText: string; correctAnswer: string;
  answerOptions: string[]; requiresMultipleChoice: true;
};

export type LimitMathQuestion = {
  kind: 'limit'; id: string; operation: 'limits'; subtype: LimitSubtype;
  questionText: string; correctAnswer: string; answerOptions: string[]; requiresMultipleChoice: true;
  approach: string;
  expression: string;
  expressionFraction?: { numerator: string; denominator: string };
};

export type MathQuestion =
  | ArithmeticMathQuestion
  | EquationUnknownMathQuestion
  | GeometryMathQuestion
  | ComparisonMathQuestion
  | EquivalentExpressionMathQuestion
  | EquationTwoUnknownMathQuestion
  | FractionVisualMathQuestion
  | ShapeRecognitionMathQuestion
  | ClockMathQuestion
  | PatternMathQuestion
  | NumberSenseMathQuestion
  | CalculusMathQuestion
  | TrigonometryMathQuestion
  | LogarithmMathQuestion
  | AdvancedEquationMathQuestion
  | LimitMathQuestion;

export function isArithmeticQuestion(q: MathQuestion): q is ArithmeticMathQuestion {
  return q.kind === 'arithmetic';
}

export function isEquationUnknownQuestion(q: MathQuestion): q is EquationUnknownMathQuestion {
  return q.kind === 'equation_unknown';
}

export function isGeometryQuestion(q: MathQuestion): q is GeometryMathQuestion {
  return q.kind === 'geometry';
}

export function isComparisonQuestion(q: MathQuestion): q is ComparisonMathQuestion {
  return q.kind === 'comparison';
}

export function isEquivalentExpressionQuestion(
  q: MathQuestion,
): q is EquivalentExpressionMathQuestion {
  return q.kind === 'equivalent_expression';
}

export function isEquationTwoUnknownQuestion(q: MathQuestion): q is EquationTwoUnknownMathQuestion {
  return q.kind === 'equation_two_unknown';
}

export function isFractionVisualQuestion(q: MathQuestion): q is FractionVisualMathQuestion {
  return q.kind === 'fraction_visual';
}

export function isShapeRecognitionQuestion(
  q: MathQuestion,
): q is ShapeRecognitionMathQuestion {
  return q.kind === 'shape_recognition';
}

export function isClockQuestion(q: MathQuestion): q is ClockMathQuestion {
  return q.kind === 'clock';
}

export function isPatternQuestion(q: MathQuestion): q is PatternMathQuestion {
  return q.kind === 'pattern';
}
export function isNumberSenseQuestion(q: MathQuestion): q is NumberSenseMathQuestion { return q.kind === 'number_sense'; }

export function isCalculusQuestion(q: MathQuestion): q is CalculusMathQuestion {
  return q.kind === 'calculus';
}

export function isTrigonometryQuestion(q: MathQuestion): q is TrigonometryMathQuestion {
  return q.kind === 'trigonometry';
}

export function isLogarithmQuestion(q: MathQuestion): q is LogarithmMathQuestion {
  return q.kind === 'logarithm';
}
export function isAdvancedEquationQuestion(q: MathQuestion): q is AdvancedEquationMathQuestion { return q.kind === 'advanced_equation'; }
export function isLimitQuestion(q: MathQuestion): q is LimitMathQuestion { return q.kind === 'limit'; }

/** Use a tighter prompt card when supporting content or many answers must fit below it. */
export function usesCompactQuestionCard(q: MathQuestion): boolean {
  if (q.answerOptions.length >= 4) return true;
  if (isFractionVisualQuestion(q)) return true;
  if (isShapeRecognitionQuestion(q)) return true;
  if (isTrigonometryQuestion(q)) return true;
  if (isClockQuestion(q) && q.subtype === 'read_analog') return true;
  if (isPatternQuestion(q)) return true;
  return false;
}

export function isFractionQuestion(q: ArithmeticMathQuestion): boolean {
  return q.answerKind === 'fraction';
}

export function isRemainderQuestion(q: ArithmeticMathQuestion): boolean {
  return q.answerKind === 'quotient_remainder';
}
