import type { GeometryConfig, GeometrySource } from '@/features/geometry/geometry.types';
import {
  DEFAULT_GEOMETRY_CONFIG,
  PLANAR_SHAPES,
  VOLUME_SHAPES,
  type AreaShape,
  type GeometryMeasure,
  type PerimeterShape,
  type VolumeShape,
} from '@/features/geometry/geometry.types';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';

function normalizeShapeFlags<T extends string>(
  raw: unknown,
  keys: readonly T[],
  defaults: Record<T, boolean>,
): Record<T, boolean> {
  const base = { ...defaults };
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  for (const key of keys) {
    if (r[key] === true) base[key] = true;
  }
  return base;
}

export function normalizeGeometryConfig(raw: unknown): GeometryConfig {
  const base = DEFAULT_GEOMETRY_CONFIG;
  if (!raw || typeof raw !== 'object') {
    return {
      ...base,
      perimeter: { ...base.perimeter, shapes: { ...base.perimeter.shapes } },
      area: { ...base.area, shapes: { ...base.area.shapes } },
      volume: { ...base.volume, shapes: { ...base.volume.shapes } },
      questionKinds: { ...base.questionKinds },
    };
  }
  const r = raw as Record<string, unknown>;
  const perimeterRaw = r.perimeter;
  const areaRaw = r.area;
  const volumeRaw = r.volume;
  const kindsRaw = r.questionKinds;

  const perimeterShapes = normalizeShapeFlags(
    perimeterRaw && typeof perimeterRaw === 'object'
      ? (perimeterRaw as Record<string, unknown>).shapes
      : undefined,
    PLANAR_SHAPES,
    base.perimeter.shapes,
  );

  const areaShapes = normalizeShapeFlags(
    areaRaw && typeof areaRaw === 'object'
      ? (areaRaw as Record<string, unknown>).shapes
      : undefined,
    PLANAR_SHAPES,
    base.area.shapes,
  );

  const volumeShapes = normalizeShapeFlags(
    volumeRaw && typeof volumeRaw === 'object'
      ? (volumeRaw as Record<string, unknown>).shapes
      : undefined,
    VOLUME_SHAPES,
    base.volume.shapes,
  );

  const questionKinds =
    kindsRaw && typeof kindsRaw === 'object'
      ? {
          formula: (kindsRaw as Record<string, unknown>).formula !== false,
          calculate: (kindsRaw as Record<string, unknown>).calculate !== false,
        }
      : { ...base.questionKinds };

  return {
    enabled: r.enabled === true,
    perimeter: {
      enabled:
        perimeterRaw && typeof perimeterRaw === 'object'
          ? (perimeterRaw as Record<string, unknown>).enabled === true
          : false,
      shapes: perimeterShapes,
    },
    area: {
      enabled:
        areaRaw && typeof areaRaw === 'object'
          ? (areaRaw as Record<string, unknown>).enabled === true
          : false,
      shapes: areaShapes,
    },
    volume: {
      enabled:
        volumeRaw && typeof volumeRaw === 'object'
          ? (volumeRaw as Record<string, unknown>).enabled === true
          : false,
      shapes: volumeShapes,
    },
    questionKinds,
  };
}

function enabledShapesForMeasure(
  config: GeometryConfig,
  measure: GeometryMeasure,
): string[] {
  if (measure === 'perimeter') {
    if (!config.perimeter.enabled) return [];
    return (Object.entries(config.perimeter.shapes) as [PerimeterShape, boolean][])
      .filter(([, on]) => on)
      .map(([s]) => s);
  }
  if (measure === 'area') {
    if (!config.area.enabled) return [];
    return (Object.entries(config.area.shapes) as [AreaShape, boolean][])
      .filter(([, on]) => on)
      .map(([s]) => s);
  }
  if (!config.volume.enabled) return [];
  return (Object.entries(config.volume.shapes) as [VolumeShape, boolean][])
    .filter(([, on]) => on)
    .map(([s]) => s);
}

export function getEnabledGeometrySources(config: MathLearningConfig): GeometrySource[] {
  const g = config.geometry;
  if (!g.enabled) return [];

  const subtypes: GeometrySource['subtype'][] = [];
  if (g.questionKinds.formula) subtypes.push('formula');
  if (g.questionKinds.calculate) subtypes.push('calculate');
  if (subtypes.length === 0) return [];

  const out: GeometrySource[] = [];
  for (const measure of ['perimeter', 'area', 'volume'] as const) {
    for (const shape of enabledShapesForMeasure(g, measure)) {
      for (const subtype of subtypes) {
        out.push({ measure, shape: shape as GeometrySource['shape'], subtype });
      }
    }
  }
  return out;
}

export function hasGeometryQuestionSource(config: MathLearningConfig): boolean {
  return getEnabledGeometrySources(config).length > 0;
}

export function countEnabledGeometryShapes(config: GeometryConfig): number {
  let n = 0;
  for (const measure of ['perimeter', 'area', 'volume'] as const) {
    n += enabledShapesForMeasure(config, measure).length;
  }
  return n;
}
