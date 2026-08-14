import type {
  AreaShape,
  GeometryMeasure,
  GeometryShape,
  PerimeterShape,
} from '@/features/geometry/geometry.types';
import { PLANAR_SHAPES, VOLUME_SHAPES } from '@/features/geometry/geometry.types';
import { getFormulaForShape, shapeUsesPiForm } from '@/features/geometry/geometryFormulas';
import { getGeometryFormExplanation } from '@/features/learn/geometryFormExplanations';
import type { LearnFormulaTable } from '@/features/learn/learnTopics';
import { i18n } from '@/i18n';
import type { SupportedLocale } from '@/i18n/types';

const PERIMETER_SHAPES: PerimeterShape[] = [...PLANAR_SHAPES];

const AREA_SHAPES: AreaShape[] = [...PLANAR_SHAPES];

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase() + s.slice(1);
}

function tLearn(key: string, locale: SupportedLocale): string {
  return i18n.t(key, { lng: locale });
}

function shapeDisplayName(shape: GeometryShape, locale: SupportedLocale): string {
  return capitalize(tLearn(`questions:shapes.${shape}`, locale));
}

function measureHeading(measure: GeometryMeasure, locale: SupportedLocale): string {
  return capitalize(tLearn(`questions:measures.${measure}`, locale));
}

function rowsForMeasure(
  measure: GeometryMeasure,
  shapes: readonly GeometryShape[],
  locale: SupportedLocale,
): LearnFormulaTable['rows'] {
  return shapes.map((shape) => {
    const entry = getFormulaForShape(measure, shape, locale)!;
    const usesPi = shapeUsesPiForm(measure, shape);
    return {
      shape: shapeDisplayName(shape, locale),
      formula: entry.label,
      hint: usesPi ? tLearn('questions:geometryLearn.piHint', locale) : undefined,
      explanation: getGeometryFormExplanation(measure, shape, locale),
      diagram: { measure, shape },
    };
  });
}

function tableForMeasure(
  measure: GeometryMeasure,
  shapes: readonly GeometryShape[],
  locale: SupportedLocale,
): LearnFormulaTable {
  return {
    heading: measureHeading(measure, locale),
    intro: tLearn(`questions:geometryLearn.intros.${measure}`, locale),
    rows: rowsForMeasure(measure, shapes, locale),
  };
}

/** All perimeter / area / volume formulas used in geometry questions. */
export function buildGeometryFormulaTables(
  locale: SupportedLocale = 'en',
): LearnFormulaTable[] {
  return [
    tableForMeasure('perimeter', PERIMETER_SHAPES, locale),
    tableForMeasure('area', AREA_SHAPES, locale),
    tableForMeasure('volume', VOLUME_SHAPES, locale),
  ];
}
