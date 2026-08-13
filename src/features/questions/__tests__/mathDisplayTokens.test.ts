import {
  mathDisplayTextHasFractions,
  tokenizeMathDisplayText,
} from '@/features/questions/mathDisplayTokens';

describe('mathDisplayTokens', () => {
  it('detects slash fractions', () => {
    expect(mathDisplayTextHasFractions('8/12 + 10/12 = ?')).toBe(true);
    expect(mathDisplayTextHasFractions('7 + 4 = ?')).toBe(false);
  });

  it('tokenizes expressions with multiple fractions', () => {
    expect(tokenizeMathDisplayText('8/12 + 10/12 = ?')).toEqual([
      { kind: 'fraction', numerator: 8, denominator: 12 },
      { kind: 'text', value: ' + ' },
      { kind: 'fraction', numerator: 10, denominator: 12 },
      { kind: 'text', value: ' = ?' },
    ]);
  });

  it('tokenizes a single fraction answer', () => {
    expect(tokenizeMathDisplayText('3/2')).toEqual([
      { kind: 'fraction', numerator: 3, denominator: 2 },
    ]);
  });

  it('tokenizes parenthesized and root fractions', () => {
    expect(tokenizeMathDisplayText('√(9/16) = ?')).toEqual([
      { kind: 'text', value: '√(' },
      { kind: 'fraction', numerator: 9, denominator: 16 },
      { kind: 'text', value: ') = ?' },
    ]);
  });
});
