export type GeometryMeasure = 'perimeter' | 'area' | 'volume';

export type PerimeterShape =
  | 'square'
  | 'rectangle'
  | 'triangle'
  | 'circle'
  | 'rhombus'
  | 'kite'
  | 'parallelogram'
  | 'trapezoid';
export type AreaShape =
  | 'square'
  | 'rectangle'
  | 'triangle'
  | 'circle'
  | 'rhombus'
  | 'kite'
  | 'parallelogram'
  | 'trapezoid';
export type VolumeShape =
  | 'cube'
  | 'cuboid'
  | 'pyramid'
  | 'cone'
  | 'cylinder'
  | 'triangular_prism'
  | 'triangular_pyramid';

/** Display / settings order for 2D shapes (trapezoid last). */
export const PLANAR_SHAPES: readonly PerimeterShape[] = [
  'square',
  'rectangle',
  'triangle',
  'circle',
  'rhombus',
  'kite',
  'parallelogram',
  'trapezoid',
];

/** Display / settings order for volume shapes (pyramids grouped together). */
export const VOLUME_SHAPES: readonly VolumeShape[] = [
  'cube',
  'cuboid',
  'pyramid',
  'triangular_pyramid',
  'cone',
  'cylinder',
  'triangular_prism',
];

export type GeometryShape = PerimeterShape | AreaShape | VolumeShape;

export type GeometryQuestionSubtype = 'formula' | 'calculate';
export type GeometryAnswerKind = 'number' | 'formula' | 'pi_form';

export type GeometryShapeFlags<T extends string> = Record<T, boolean>;

export type GeometryConfig = {
  enabled: boolean;
  perimeter: {
    enabled: boolean;
    shapes: GeometryShapeFlags<PerimeterShape>;
  };
  area: {
    enabled: boolean;
    shapes: GeometryShapeFlags<AreaShape>;
  };
  volume: {
    enabled: boolean;
    shapes: GeometryShapeFlags<VolumeShape>;
  };
  questionKinds: {
    formula: boolean;
    calculate: boolean;
  };
};

export const DEFAULT_GEOMETRY_CONFIG: GeometryConfig = {
  enabled: false,
  perimeter: {
    enabled: false,
    shapes: {
      square: false,
      rectangle: false,
      triangle: false,
      circle: false,
      rhombus: false,
      kite: false,
      parallelogram: false,
      trapezoid: false,
    },
  },
  area: {
    enabled: false,
    shapes: {
      square: false,
      rectangle: false,
      triangle: false,
      circle: false,
      rhombus: false,
      kite: false,
      parallelogram: false,
      trapezoid: false,
    },
  },
  volume: {
    enabled: false,
    shapes: {
      cube: false,
      cuboid: false,
      pyramid: false,
      triangular_pyramid: false,
      cone: false,
      cylinder: false,
      triangular_prism: false,
    },
  },
  questionKinds: { formula: true, calculate: true },
};

export type GeometrySource = {
  measure: GeometryMeasure;
  shape: GeometryShape;
  subtype: GeometryQuestionSubtype;
};
