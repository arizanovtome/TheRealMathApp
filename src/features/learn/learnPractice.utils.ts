import type { MathLearningConfig, MathOperation } from '@/features/learning-plan/learningPlan.types';
import {
  ALL_MATH_OPERATIONS,
  DEFAULT_EQUATION_TWO_UNKNOWNS_CONFIG,
  DEFAULT_FRACTION_VISUAL_CONFIG,
} from '@/features/learning-plan/learningPlan.types';
import {
  applyPracticeFocusOverride,
} from '@/features/learning-plan/learningPlan.utils';
import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';

export type LearnPracticeTarget =
  | { kind: 'operation'; operation: MathOperation }
  | { kind: 'equation_unknown' }
  | { kind: 'equation_two_unknowns' }
  | { kind: 'fractions' };

function disableAllQuestionSources(config: MathLearningConfig): MathLearningConfig {
  return {
    ...config,
    addition: { ...config.addition, enabled: false },
    subtraction: { ...config.subtraction, enabled: false },
    multiplication: { ...config.multiplication, enabled: false },
    division: { ...config.division, enabled: false },
    square: { ...config.square, enabled: false },
    squareRoot: { ...config.squareRoot, enabled: false },
    rounding: { ...config.rounding, enabled: false },
    orderOfOperations: { ...config.orderOfOperations, enabled: false },
    equivalentExpressions: { ...config.equivalentExpressions, enabled: false },
    equationUnknown: {
      ...config.equationUnknown,
      enabled: false,
      mode: 'off',
      operators: {
        addition: false,
        subtraction: false,
        multiplication: false,
        division: false,
      },
    },
    equationTwoUnknowns: {
      ...DEFAULT_EQUATION_TWO_UNKNOWNS_CONFIG,
    },
    comparison: { ...config.comparison, enabled: false },
    fractionVisual: { ...config.fractionVisual, enabled: false },
    shapeRecognition: { ...config.shapeRecognition, enabled: false },
    numberSense: { ...config.numberSense, enabled: false },
    clock: { ...config.clock, enabled: false },
    patterns: { ...config.patterns, enabled: false },
    differentiation: { ...config.differentiation, enabled: false },
    integration: { ...config.integration, enabled: false },
    trigonometry: { ...config.trigonometry, enabled: false },
    logarithm: { ...config.logarithm, enabled: false },
    geometry: { ...config.geometry, enabled: false },
  };
}

/** Build a one-topic config for Learn → Try in practice (ignores disabled ops in saved settings). */
export function applyLearnPracticeFocus(
  config: MathLearningConfig,
  target: LearnPracticeTarget,
  age: number,
): MathLearningConfig {
  const defaults = getRecommendedLearningPlan(age);
  const base: MathLearningConfig = {
    ...defaults,
    answerEntryMode: config.answerEntryMode,
    answerOptionsCount: config.answerOptionsCount,
    confirmAnswerBeforeSubmit: config.confirmAnswerBeforeSubmit,
    timerEnabled: false,
    mode: 'practice',
  };

  let focused: MathLearningConfig;
  switch (target.kind) {
    case 'operation':
      focused = applyPracticeFocusOverride(base, target.operation, { force: true });
      if (target.operation === 'shape_recognition') {
        focused = {
          ...focused,
          shapeRecognition: {
            ...focused.shapeRecognition,
            shapeQuestions: true,
            colorQuestions: true,
            colorAndShapeQuestions: true,
          },
        };
      }
      if (target.operation === 'order_of_operations') {
        focused = {
          ...focused,
          orderOfOperations: {
            ...focused.orderOfOperations,
            includeSquaring: true,
            includeSquareRoots: true,
          },
        };
      }
      break;
    case 'equation_unknown':
      focused = {
        ...disableAllQuestionSources(base),
        addition: {
          ...defaults.addition,
          enabled: true,
          standardCalculation: true,
        },
        subtraction: {
          ...defaults.subtraction,
          enabled: true,
          standardCalculation: true,
        },
        equationUnknown: {
          enabled: true,
          mode: 'mixed',
          operators: {
            addition: true,
            subtraction: true,
            multiplication: false,
            division: false,
          },
        },
      };
      break;
    case 'equation_two_unknowns':
      focused = {
        ...disableAllQuestionSources(base),
        addition: {
          ...defaults.addition,
          enabled: true,
          standardCalculation: true,
        },
        subtraction: {
          ...defaults.subtraction,
          enabled: true,
          standardCalculation: true,
        },
        equationTwoUnknowns: {
          enabled: true,
          operators: {
            addition: true,
            subtraction: true,
            multiplication: false,
            division: false,
          },
        },
      };
      break;
    case 'fractions':
      focused = {
        ...disableAllQuestionSources(base),
        addition: {
          ...defaults.addition,
          enabled: true,
          standardCalculation: false,
          missingNumber: false,
          fractions: true,
          fractionDenominatorMode: 'mixed',
          wordProblems: false,
        },
        fractionVisual: { ...DEFAULT_FRACTION_VISUAL_CONFIG, enabled: true },
      };
      break;
  }

  return focused;
}

export function parseLearnPracticeTargetParam(
  kind: string | string[] | undefined,
  operation: string | string[] | undefined,
): LearnPracticeTarget | null {
  const kindRaw = Array.isArray(kind) ? kind[0] : kind;
  if (!kindRaw) return null;

  if (kindRaw === 'equation_unknown') return { kind: 'equation_unknown' };
  if (kindRaw === 'equation_two_unknowns') return { kind: 'equation_two_unknowns' };
  if (kindRaw === 'fractions') return { kind: 'fractions' };

  if (kindRaw === 'operation') {
    const opRaw = Array.isArray(operation) ? operation[0] : operation;
    if (!opRaw) return null;
    const allOps: MathOperation[] = [...ALL_MATH_OPERATIONS];
    if (allOps.includes(opRaw as MathOperation)) {
      return { kind: 'operation', operation: opRaw as MathOperation };
    }
  }

  return null;
}

/** Save only the focused operation's settings without disabling unrelated profile topics. */
export function mergeFocusedOperationIntoProfile(
  profileConfig: MathLearningConfig,
  focusedConfig: MathLearningConfig,
  operation: MathOperation,
): MathLearningConfig {
  switch (operation) {
    case 'addition': return { ...profileConfig, addition: focusedConfig.addition };
    case 'subtraction': return { ...profileConfig, subtraction: focusedConfig.subtraction };
    case 'multiplication': return { ...profileConfig, multiplication: focusedConfig.multiplication };
    case 'division': return { ...profileConfig, division: focusedConfig.division };
    case 'square': return { ...profileConfig, square: focusedConfig.square };
    case 'square_root': return { ...profileConfig, squareRoot: focusedConfig.squareRoot };
    case 'rounding': return { ...profileConfig, rounding: focusedConfig.rounding };
    case 'order_of_operations': return { ...profileConfig, orderOfOperations: focusedConfig.orderOfOperations };
    case 'equivalent_expressions': return { ...profileConfig, equivalentExpressions: focusedConfig.equivalentExpressions };
    case 'geometry': return { ...profileConfig, geometry: focusedConfig.geometry };
    case 'comparison': return { ...profileConfig, comparison: focusedConfig.comparison };
    case 'fraction_visual': return { ...profileConfig, fractionVisual: focusedConfig.fractionVisual };
    case 'shape_recognition': return {
      ...profileConfig,
      shapeRecognition: focusedConfig.shapeRecognition,
      patterns: {
        ...profileConfig.patterns,
        shapePattern: focusedConfig.patterns.shapePattern,
        coloredShapePattern: focusedConfig.patterns.coloredShapePattern,
      },
      numberSense: {
        ...profileConfig.numberSense,
        countObjects: focusedConfig.numberSense.countObjects,
        compareQuantities: focusedConfig.numberSense.compareQuantities,
      },
    };
    case 'number_sense': return { ...profileConfig, numberSense: focusedConfig.numberSense };
    case 'clock': return { ...profileConfig, clock: focusedConfig.clock };
    case 'pattern': return { ...profileConfig, patterns: focusedConfig.patterns };
    case 'differentiation': return { ...profileConfig, differentiation: focusedConfig.differentiation };
    case 'integration': return { ...profileConfig, integration: focusedConfig.integration };
    case 'trigonometry': return { ...profileConfig, trigonometry: focusedConfig.trigonometry };
    case 'logarithm': return { ...profileConfig, logarithm: focusedConfig.logarithm };
  }
}
