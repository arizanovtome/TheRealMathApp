export type ShapeColor = 'red' | 'blue' | 'green' | 'yellow';

export const SHAPE_COLORS: readonly ShapeColor[] = ['red', 'blue', 'green', 'yellow'];

export const SHAPE_COLOR_HEX: Record<ShapeColor, string> = {
  red: '#E74C3C',
  blue: '#3498DB',
  green: '#2ECC71',
  yellow: '#F1C40F',
};
