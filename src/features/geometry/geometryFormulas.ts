import type {
  AreaShape,
  GeometryMeasure,
  GeometryShape,
  PerimeterShape,
  VolumeShape,
} from '@/features/geometry/geometry.types';
import { VOLUME_SHAPES } from '@/features/geometry/geometry.types';

export type GeometryFormulaEntry = {
  /** Canonical key for scoring (lowercase, normalized). */
  canonical: string;
  /** Shown in multiple-choice options. */
  label: string;
};

const PERIMETER_FORMULAS: Record<PerimeterShape, GeometryFormulaEntry> = {
  square: { canonical: '4s', label: '4 × side' },
  rectangle: { canonical: '2(l+w)', label: '2 × (length + width)' },
  triangle: { canonical: 'a+b+c', label: 'side a + side b + side c' },
  circle: { canonical: '2πr', label: '2 × π × radius' },
  rhombus: { canonical: '4s', label: '4 × side' },
  kite: { canonical: '2a+2b', label: '2 × a + 2 × b' },
  parallelogram: { canonical: '2(a+b)', label: '2 × (side a + side b)' },
  trapezoid: { canonical: 'a+b+c+d', label: 'side a + side b + side c + side d' },
};

const AREA_FORMULAS: Record<AreaShape, GeometryFormulaEntry> = {
  square: { canonical: 's²', label: 'side × side' },
  rectangle: { canonical: 'l×w', label: 'length × width' },
  triangle: { canonical: '½×b×h', label: '½ × base × height' },
  circle: { canonical: 'πr²', label: 'π × radius × radius' },
  rhombus: { canonical: '½×d₁×d₂', label: '½ × diagonal 1 × diagonal 2' },
  kite: { canonical: '½×d₁×d₂', label: '½ × diagonal 1 × diagonal 2' },
  parallelogram: { canonical: 'b×h', label: 'base × height' },
  trapezoid: { canonical: '½×(a+b)×h', label: '½ × (base 1 + base 2) × height' },
};

const VOLUME_FORMULAS: Record<VolumeShape, GeometryFormulaEntry> = {
  cube: { canonical: 's³', label: 'side × side × side' },
  cuboid: { canonical: 'a×b×c', label: 'a × b × c' },
  pyramid: { canonical: '⅓×s²×h', label: '⅓ × base side² × height' },
  triangular_pyramid: {
    canonical: '⅓×½×b×h×H',
    label: '⅓ × ½ × base × height × pyramid height',
  },
  cone: { canonical: '⅓×πr²h', label: '⅓ × π × radius² × height' },
  cylinder: { canonical: 'πr²h', label: 'π × radius² × height' },
  triangular_prism: {
    canonical: '½×b×h×l',
    label: '½ × base × height × length',
  },
};

export function getFormulaForShape(
  measure: GeometryMeasure,
  shape: GeometryShape,
): GeometryFormulaEntry | null {
  if (measure === 'perimeter' && shape in PERIMETER_FORMULAS) {
    return PERIMETER_FORMULAS[shape as PerimeterShape];
  }
  if (measure === 'area' && shape in AREA_FORMULAS) {
    return AREA_FORMULAS[shape as AreaShape];
  }
  if (measure === 'volume' && shape in VOLUME_FORMULAS) {
    return VOLUME_FORMULAS[shape as VolumeShape];
  }
  return null;
}

export function listFormulasForMeasure(measure: GeometryMeasure): GeometryFormulaEntry[] {
  if (measure === 'perimeter') return Object.values(PERIMETER_FORMULAS);
  if (measure === 'area') return Object.values(AREA_FORMULAS);
  return VOLUME_SHAPES.map((shape) => VOLUME_FORMULAS[shape]);
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
