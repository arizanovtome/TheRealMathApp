import {
  BASIC_SHAPES,
  DEFAULT_SHAPE_RECOGNITION_CONFIG,
  type BasicShape,
  type ShapeRecognitionConfig,
} from '@/features/shapes/shapeRecognition.types';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';

export function getEnabledBasicShapes(config: MathLearningConfig): BasicShape[] {
  if (!config.shapeRecognition.enabled) return [];
  return BASIC_SHAPES.filter((shape) => config.shapeRecognition.shapes[shape]);
}

export function hasShapeRecognitionSource(config: MathLearningConfig): boolean {
  return getEnabledBasicShapes(config).length > 0 &&
    (config.shapeRecognition.shapeQuestions ||
      config.shapeRecognition.colorQuestions ||
      config.shapeRecognition.colorAndShapeQuestions);
}

export function normalizeShapeRecognitionConfig(raw: unknown): ShapeRecognitionConfig {
  const base = { ...DEFAULT_SHAPE_RECOGNITION_CONFIG, shapes: { ...DEFAULT_SHAPE_RECOGNITION_CONFIG.shapes } };
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  const shapesRaw =
    r.shapes && typeof r.shapes === 'object'
      ? (r.shapes as Record<string, unknown>)
      : ({} as Record<string, unknown>);
  const shapes = { ...base.shapes };
  for (const shape of BASIC_SHAPES) {
    if (shapesRaw[shape] === true) shapes[shape] = true;
    if (shapesRaw[shape] === false) shapes[shape] = false;
  }
  return {
    enabled: r.enabled === true,
    shapeQuestions: r.shapeQuestions !== false,
    colorQuestions: r.colorQuestions === true,
    colorAndShapeQuestions: r.colorAndShapeQuestions === true,
    shapes,
  };
}
