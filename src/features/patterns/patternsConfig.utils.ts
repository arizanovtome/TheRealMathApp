import type { MathLearningConfig, PatternsConfig } from '@/features/learning-plan/learningPlan.types';
import { getEnabledBasicShapes } from '@/features/shapes/shapeRecognitionConfig.utils';

export function hasPatternsQuestionSource(config: MathLearningConfig): boolean {
  const hasNumberPattern = config.patterns.enabled && (
    config.patterns.arithmeticSequence ||
    config.patterns.geometricSequence ||
    config.patterns.numberPattern
  );
  const hasShapePattern = getEnabledBasicShapes(config).length > 0 && (
    config.patterns.shapePattern || config.patterns.coloredShapePattern
  );
  return hasNumberPattern || hasShapePattern;
}

export function normalizePatternsConfig(raw: unknown): PatternsConfig {
  const base = {
    enabled: false,
    arithmeticSequence: true,
    geometricSequence: false,
    numberPattern: true,
    shapePattern: false,
    coloredShapePattern: false,
  };
  if (!raw || typeof raw !== 'object') return { ...base };
  const r = raw as Record<string, unknown>;
  return {
    enabled: r.enabled === true,
    arithmeticSequence: r.arithmeticSequence !== false,
    geometricSequence: r.geometricSequence === true,
    numberPattern: r.numberPattern !== false,
    shapePattern: r.shapePattern === true,
    coloredShapePattern: r.coloredShapePattern === true,
  };
}

export type PatternSubtype =
  | 'arithmetic_sequence'
  | 'geometric_sequence'
  | 'number_pattern'
  | 'shape_pattern'
  | 'colored_shape_pattern';

export function getEnabledPatternSubtypes(config: MathLearningConfig): PatternSubtype[] {
  const out: PatternSubtype[] = [];
  if (config.patterns.enabled) {
    if (config.patterns.arithmeticSequence) out.push('arithmetic_sequence');
    if (config.patterns.geometricSequence) out.push('geometric_sequence');
    if (config.patterns.numberPattern) out.push('number_pattern');
  }
  if (config.shapeRecognition.enabled) {
    if (config.patterns.shapePattern) out.push('shape_pattern');
    if (config.patterns.coloredShapePattern) out.push('colored_shape_pattern');
  }
  return out;
}
