import {
  buildFractionVsDecimalPair,
  buildFractionVsFractionPair,
  buildMeasurementComparePair,
  buildPercentVsFractionPair,
  compareValues,
  formatDecimalValue,
  fractionToDecimalValue,
} from '@/features/comparison/comparisonValue.utils';

describe('comparisonValue.utils', () => {
  it('compareValues returns correct symbols', () => {
    expect(compareValues(3, 5)).toBe('<');
    expect(compareValues(5, 3)).toBe('>');
    expect(compareValues(4, 4)).toBe('=');
  });

  it('formats terminating decimals cleanly', () => {
    expect(formatDecimalValue(0.75)).toBe('0.75');
    expect(formatDecimalValue(1)).toBe('1');
  });

  it('fractionToDecimalValue matches fraction arithmetic', () => {
    expect(fractionToDecimalValue({ numerator: 3, denominator: 4 })).toBe(0.75);
  });

  it('buildFractionVsDecimalPair uses fraction and decimal operands', () => {
    const pair = buildFractionVsDecimalPair();
    expect(pair.left).toMatch(/\d+\/\d+/);
    expect(pair.right).toMatch(/\d+(\.\d+)?/);
    expect(['<', '>', '=']).toContain(pair.correct);
  });

  it('buildPercentVsFractionPair uses percent and fraction', () => {
    const pair = buildPercentVsFractionPair();
    expect(pair.left).toMatch(/%$/);
    expect(pair.right).toMatch(/\d+\/\d+/);
  });

  it('buildFractionVsFractionPair compares two fractions', () => {
    for (let i = 0; i < 30; i++) {
      const pair = buildFractionVsFractionPair();
      expect(pair.left).toMatch(/\d+\/\d+/);
      expect(pair.right).toMatch(/\d+\/\d+/);
      expect(pair.left).not.toBe(pair.right);
      const leftParts = pair.left.split('/');
      const rightParts = pair.right.split('/');
      if (pair.correct !== '=') {
        expect(leftParts[1]).not.toBe(rightParts[1]);
      }
      expect(['<', '>', '=']).toContain(pair.correct);
    }
  });

  it('buildMeasurementComparePair uses metric units', () => {
    const pair = buildMeasurementComparePair();
    expect(pair.left).toMatch(/\d+ (mm|cm|m|km|g|kg|mL|L)/);
    expect(pair.right).toMatch(/\d+ (mm|cm|m|km|g|kg|mL|L)/);
    expect(['<', '>', '=']).toContain(pair.correct);
  });
});
