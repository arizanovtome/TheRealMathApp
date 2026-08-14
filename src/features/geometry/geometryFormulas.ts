import type {
  AreaShape,
  GeometryMeasure,
  GeometryShape,
  PerimeterShape,
  VolumeShape,
} from '@/features/geometry/geometry.types';
import { VOLUME_SHAPES } from '@/features/geometry/geometry.types';
import { i18n } from '@/i18n';
import type { SupportedLocale } from '@/i18n/types';

export type GeometryFormulaEntry = {
  /** Canonical key for scoring (lowercase, normalized). */
  canonical: string;
  /** Shown in multiple-choice options (locale-aware). */
  label: string;
};

type FormulaDef = {
  canonical: string;
  shape: GeometryShape;
};

const PERIMETER_FORMULAS: Record<PerimeterShape, FormulaDef> = {
  square: { canonical: '4s', shape: 'square' },
  rectangle: { canonical: '2(l+w)', shape: 'rectangle' },
  triangle: { canonical: 'a+b+c', shape: 'triangle' },
  circle: { canonical: '2πr', shape: 'circle' },
  rhombus: { canonical: '4s', shape: 'rhombus' },
  kite: { canonical: '2a+2b', shape: 'kite' },
  parallelogram: { canonical: '2(a+b)', shape: 'parallelogram' },
  trapezoid: { canonical: 'a+b+c+d', shape: 'trapezoid' },
};

const AREA_FORMULAS: Record<AreaShape, FormulaDef> = {
  square: { canonical: 's²', shape: 'square' },
  rectangle: { canonical: 'l×w', shape: 'rectangle' },
  triangle: { canonical: '½×b×h', shape: 'triangle' },
  circle: { canonical: 'πr²', shape: 'circle' },
  rhombus: { canonical: '½×d₁×d₂', shape: 'rhombus' },
  kite: { canonical: '½×d₁×d₂', shape: 'kite' },
  parallelogram: { canonical: 'b×h', shape: 'parallelogram' },
  trapezoid: { canonical: '½×(a+b)×h', shape: 'trapezoid' },
};

const VOLUME_FORMULAS: Record<VolumeShape, FormulaDef> = {
  cube: { canonical: 's³', shape: 'cube' },
  cuboid: { canonical: 'a×b×c', shape: 'cuboid' },
  pyramid: { canonical: '⅓×s²×h', shape: 'pyramid' },
  triangular_pyramid: {
    canonical: '⅓×½×b×h×H',
    shape: 'triangular_pyramid',
  },
  cone: { canonical: '⅓×πr²h', shape: 'cone' },
  cylinder: { canonical: 'πr²h', shape: 'cylinder' },
  triangular_prism: {
    canonical: '½×b×h×l',
    shape: 'triangular_prism',
  },
};

function localizedFormulaLabel(
  measure: GeometryMeasure,
  shape: GeometryShape,
  locale?: SupportedLocale,
): string {
  return i18n.t(`questions:geometryFormulas.${measure}.${shape}`, locale ? { lng: locale } : undefined);
}

function toEntry(
  measure: GeometryMeasure,
  def: FormulaDef,
  locale?: SupportedLocale,
): GeometryFormulaEntry {
  return {
    canonical: def.canonical,
    label: localizedFormulaLabel(measure, def.shape, locale),
  };
}

export function getFormulaForShape(
  measure: GeometryMeasure,
  shape: GeometryShape,
  locale?: SupportedLocale,
): GeometryFormulaEntry | null {
  if (measure === 'perimeter' && shape in PERIMETER_FORMULAS) {
    return toEntry(measure, PERIMETER_FORMULAS[shape as PerimeterShape], locale);
  }
  if (measure === 'area' && shape in AREA_FORMULAS) {
    return toEntry(measure, AREA_FORMULAS[shape as AreaShape], locale);
  }
  if (measure === 'volume' && shape in VOLUME_FORMULAS) {
    return toEntry(measure, VOLUME_FORMULAS[shape as VolumeShape], locale);
  }
  return null;
}

export function listFormulasForMeasure(
  measure: GeometryMeasure,
  locale?: SupportedLocale,
): GeometryFormulaEntry[] {
  if (measure === 'perimeter') {
    return Object.values(PERIMETER_FORMULAS).map((def) => toEntry(measure, def, locale));
  }
  if (measure === 'area') {
    return Object.values(AREA_FORMULAS).map((def) => toEntry(measure, def, locale));
  }
  return VOLUME_SHAPES.map((shape) => toEntry(measure, VOLUME_FORMULAS[shape], locale));
}

export function shapeLabel(shape: GeometryShape): string {
  const labels: Record<GeometryShape, string> = {
    square: 'square',
    rectangle: 'rectangle',
    triangle: 'triangle',
    circle: 'circle',
    rhombus: 'rhombus',
    kite: 'kite',
    parallelogram: 'parallelogram',
    trapezoid: 'trapezoid',
    cube: 'cube',
    cuboid: 'cuboid',
    pyramid: 'square pyramid',
    cone: 'cone',
    cylinder: 'cylinder',
    triangular_prism: 'triangular prism',
    triangular_pyramid: 'triangular pyramid',
  };
  return labels[shape];
}

export function measureLabel(measure: GeometryMeasure): string {
  if (measure === 'perimeter') return 'perimeter';
  if (measure === 'area') return 'area';
  return 'volume';
}

/** Shapes whose numeric calculate answers use π-form multiple choice. */
export function shapeUsesPiForm(measure: GeometryMeasure, shape: GeometryShape): boolean {
  if (measure === 'perimeter' && shape === 'circle') return true;
  if (measure === 'area' && shape === 'circle') return true;
  if (measure === 'volume' && (shape === 'cone' || shape === 'cylinder')) return true;
  return false;
}

export function formatPiForm(coefficient: number): string {
  if (coefficient === 1) return 'π';
  return `${coefficient}π`;
}

/** Normalize formula text for answer comparison. */
export function normalizeFormulaAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/×/g, '×')
    .replace(/\*/g, '×')
    .replace(/x/g, '×')
    .replace(/·/g, '×')
    .replace(/½/g, '1/2')
    .replace(/⅓/g, '1/3')
    .replace(/²/g, '²')
    .replace(/³/g, '³')
    .replace(/pi/g, 'π')
    .replace(/d1/g, 'd₁')
    .replace(/d2/g, 'd₂');
}

export function normalizePiFormAnswer(raw: string): string {
  const t = raw.trim().toLowerCase().replace(/\s+/g, '').replace(/pi/g, 'π');
  if (t === 'π') return 'π';
  const m = t.match(/^(\d+)π$/);
  if (m) return `${m[1]}π`;
  return t;
}

export function formulasMatch(a: string, b: string): boolean {
  return normalizeFormulaAnswer(a) === normalizeFormulaAnswer(b);
}

export function piFormsMatch(a: string, b: string): boolean {
  return normalizePiFormAnswer(a) === normalizePiFormAnswer(b);
}
