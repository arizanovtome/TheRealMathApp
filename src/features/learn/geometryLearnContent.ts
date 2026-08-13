import type {
  AreaShape,
  GeometryMeasure,
  GeometryShape,
  PerimeterShape,
} from '@/features/geometry/geometry.types';
import { PLANAR_SHAPES, VOLUME_SHAPES } from '@/features/geometry/geometry.types';
import {
  getFormulaForShape,
  measureLabel,
  shapeLabel,
  shapeUsesPiForm,
} from '@/features/geometry/geometryFormulas';
import { getGeometryFormExplanation } from '@/features/learn/geometryFormExplanations';
import type { LearnFormulaTable } from '@/features/learn/learnTopics';

const PERIMETER_SHAPES: PerimeterShape[] = [...PLANAR_SHAPES];

const AREA_SHAPES: AreaShape[] = [...PLANAR_SHAPES];

const MEASURE_INTRO: Record<GeometryMeasure, string> = {
  perimeter:
    'Perimeter is the distance around the outside of a flat shape. In practice you may be asked for the formula or to calculate it when side lengths are given (1–10).',
  area:
    'Area is the space inside a flat shape, measured in square units. Formula questions ask which expression to use; calculate questions plug in the dimensions.',
  volume:
    'Volume is the space inside a 3D shape, measured in cubic units. Square pyramid uses a square base; triangular pyramid is also called a tetrahedron when all faces are triangles; cone and cylinder answers may use π.',
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function rowsForMeasure(
  measure: GeometryMeasure,
  shapes: readonly GeometryShape[],
): LearnFormulaTable['rows'] {
  return shapes.map((shape) => {
    const entry = getFormulaForShape(measure, shape)!;
    const usesPi = shapeUsesPiForm(measure, shape);
    return {
      shape: capitalize(shapeLabel(shape)),
      formula: entry.label,
      hint: usesPi ? 'Calculate answers use π forms (e.g. 10π), not decimals.' : undefined,
      explanation: getGeometryFormExplanation(measure, shape),
      diagram: { measure, shape },
    };
  });
}

function tableForMeasure(
  measure: GeometryMeasure,
  shapes: readonly GeometryShape[],
): LearnFormulaTable {
  return {
    heading: capitalize(measureLabel(measure)),
    intro: MEASURE_INTRO[measure],
    rows: rowsForMeasure(measure, shapes),
  };
}

/** All perimeter / area / volume formulas used in geometry questions. */
export function buildGeometryFormulaTables(): LearnFormulaTable[] {
  return [
    tableForMeasure('perimeter', PERIMETER_SHAPES),
    tableForMeasure('area', AREA_SHAPES),
    tableForMeasure('volume', VOLUME_SHAPES),
  ];
}
