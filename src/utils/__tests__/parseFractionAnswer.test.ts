import { parseFractionAnswer } from '@/utils/parseFractionAnswer';

describe('parseFractionAnswer', () => {
  it('parses whole numbers', () => {
    expect(parseFractionAnswer('2')).toEqual({ numerator: 2, denominator: 1 });
  });

  it('parses and reduces fractions', () => {
    expect(parseFractionAnswer('6/8')).toEqual({ numerator: 3, denominator: 4 });
    expect(parseFractionAnswer('3/4')).toEqual({ numerator: 3, denominator: 4 });
  });

  it('rejects invalid input', () => {
    expect(parseFractionAnswer('')).toBe(null);
    expect(parseFractionAnswer('3/')).toBe(null);
    expect(parseFractionAnswer('/4')).toBe(null);
    expect(parseFractionAnswer('3/0')).toBe(null);
    expect(parseFractionAnswer('a/b')).toBe(null);
  });
});
