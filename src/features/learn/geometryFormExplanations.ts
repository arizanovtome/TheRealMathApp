import type { GeometryMeasure, GeometryShape } from '@/features/geometry/geometry.types';

type ExplanationKey = `${GeometryMeasure}:${GeometryShape}`;

const EXPLANATIONS: Partial<Record<ExplanationKey, string>> = {
  'perimeter:square':
    'Perimeter is the distance around the outside. A square has four equal sides a, so add a + a + a + a, or 4 × a.',
  'perimeter:rectangle':
    'Walk all the way around: two sides of length a and two of length b. That is 2 × a + 2 × b, or 2 × (a + b).',
  'perimeter:triangle':
    'Add the lengths of all three sides a, b, and c. There is no shortcut unless two or more sides happen to be equal.',
  'perimeter:circle':
    'The distance around a circle is called the circumference. Multiply the diameter by π, or use 2 × π × r.',
  'perimeter:rhombus':
    'A rhombus has four equal sides a, like a tilted square. Perimeter is 4 × a.',
  'perimeter:kite':
    'A kite has two pairs of equal adjacent sides: two sides of length a meet at the top, and two longer sides of length b meet at the bottom. Perimeter is 2 × a + 2 × b.',
  'perimeter:parallelogram':
    'Opposite sides match in pairs: two sides of length a and two of length b. Perimeter is 2 × a + 2 × b, or 2 × (a + b).',
  'perimeter:trapezoid':
    'A trapezoid has four sides with one pair parallel: a and b are the top and bottom bases. The slanted legs are c and d. Perimeter = a + b + c + d.',

  'area:square':
    'Area counts square units that fit inside. A square with side a covers a rows of a squares, so area = a × a.',
  'area:rectangle':
    'Imagine rows of unit squares: a tells how many across, b how many down. Area = a × b.',
  'area:triangle':
    'A triangle is half of a matching rectangle with the same base a and height h. Area = ½ × a × h.',
  'area:circle':
    'Every circle with radius r covers π × r × r square units. That is why we write π × r².',
  'area:rhombus':
    'Diagonals d1 and d2 cross at right angles. Area equals half of d1 × d2.',
  'area:kite':
    'Like a rhombus, a kite has diagonals d1 and d2 that cross at right angles. Area = ½ × d1 × d2.',
  'area:parallelogram':
    'Use base a and the height h perpendicular to it (not the slanted side). Area = a × h.',
  'area:trapezoid':
    'Sides a and b are the parallel bases (top and bottom). Average them, then multiply by the height h between them: ½ × (a + b) × h.',

  'volume:cube':
    'A cube is like a 3D square. Multiply a × a × a to count cubic units inside.',
  'volume:cuboid':
    'A box shape: multiply a × b × c to fill it with unit cubes.',
  'volume:pyramid':
    'A square pyramid is one third of a box with the same square base a and height h: ⅓ × a² × h.',
  'volume:cone':
    'A cone is one third of a cylinder with the same circular base r and height h: ⅓ × π × r² × h.',
  'volume:cylinder':
    'Find the circular base area (π × r²), then stack it up through height h: π × r² × h.',
  'volume:triangular_prism':
    'First find the triangle face area (½ × a × h), then stretch it along length c.',
  'volume:triangular_pyramid':
    'Use triangle base a, triangle height b, and pyramid height h: one third of ½ × a × b × h.',
};

export function getGeometryFormExplanation(
  measure: GeometryMeasure,
  shape: GeometryShape,
): string {
  const key = `${measure}:${shape}` as ExplanationKey;
  return EXPLANATIONS[key] ?? 'Use the formula with the labeled dimensions on the diagram.';
}
