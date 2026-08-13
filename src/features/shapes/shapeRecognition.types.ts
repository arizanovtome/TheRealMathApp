export type BasicShape =
  | 'circle'
  | 'square'
  | 'rectangle'
  | 'triangle'
  | 'star'
  | 'oval';

export const BASIC_SHAPES: readonly BasicShape[] = [
  'circle',
  'square',
  'rectangle',
  'triangle',
  'star',
  'oval',
];

export type ShapeRecognitionConfig = {
  enabled: boolean;
  shapeQuestions: boolean;
  colorQuestions: boolean;
  colorAndShapeQuestions: boolean;
  shapes: Record<BasicShape, boolean>;
};

export const DEFAULT_SHAPE_RECOGNITION_CONFIG: ShapeRecognitionConfig = {
  enabled: false,
  shapeQuestions: true,
  colorQuestions: false,
  colorAndShapeQuestions: false,
  shapes: {
    circle: true,
    square: true,
    rectangle: true,
    triangle: true,
    star: true,
    oval: false,
  },
};
