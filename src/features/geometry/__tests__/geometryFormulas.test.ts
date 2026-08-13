import {
  getFormulaForShape,
  listFormulasForMeasure,
  normalizeFormulaAnswer,
  normalizePiFormAnswer,
  shapeLabel,
  shapeUsesPiForm,
} from '@/features/geometry/geometryFormulas';
import type { GeometryShape } from '@/features/geometry/geometry.types';

describe('geometryFormulas', () => {
  it('provides formulas for every perimeter shape', () => {
    const shapes: GeometryShape[] = [
      'square',
      'rectangle',
      'triangle',
      'circle',
      'rhombus',
      'kite',
      'parallelogram',
      'trapezoid',
    ];
    for (const shape of shapes) {
      expect(getFormulaForShape('perimeter', shape)).not.toBeNull();
    }
  });

  it('provides formulas for every area shape', () => {
    const shapes: GeometryShape[] = [
      'square',
      'rectangle',
      'triangle',
      'circle',
      'rhombus',
      'kite',
      'parallelogram',
      'trapezoid',
    ];
    for (const shape of shapes) {
      expect(getFormulaForShape('area', shape)).not.toBeNull();
    }
  });

  it('provides formulas for every volume shape', () => {
    const shapes: GeometryShape[] = [
      'cube',
      'cuboid',
      'pyramid',
      'triangular_pyramid',
      'cone',
      'cylinder',
      'triangular_prism',
    ];
    for (const shape of shapes) {
      expect(getFormulaForShape('volume', shape)).not.toBeNull();
    }
  });

  it('lists a formula entry per shape for each measure', () => {
    expect(listFormulasForMeasure('perimeter')).toHaveLength(8);
    expect(listFormulasForMeasure('area')).toHaveLength(8);
    expect(listFormulasForMeasure('volume')).toHaveLength(7);
  });

  it('normalizes formula answers for comparison', () => {
    expect(normalizeFormulaAnswer('2 × (length + width)')).toBe(
      normalizeFormulaAnswer('2*(length+width)'),
    );
  });

  it('normalizes pi-form answers', () => {
    expect(normalizePiFormAnswer('10pi')).toBe('10π');
    expect(normalizePiFormAnswer('π')).toBe('π');
  });

  it('marks pi shapes correctly', () => {
    expect(shapeUsesPiForm('perimeter', 'circle')).toBe(true);
    expect(shapeUsesPiForm('volume', 'cone')).toBe(true);
    expect(shapeUsesPiForm('area', 'square')).toBe(false);
  });

  it('uses readable shape labels', () => {
    expect(shapeLabel('pyramid')).toBe('square pyramid');
    expect(shapeLabel('trapezoid')).toBe('trapezoid');
    expect(shapeLabel('triangular_prism')).toBe('triangular prism');
    expect(shapeLabel('triangular_pyramid')).toBe('triangular pyramid');
  });
});
