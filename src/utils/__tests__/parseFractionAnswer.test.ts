import {
  fractionAnswerMatches,
  isCompleteFractionAnswer,
  parseFractionAnswer,
} from '@/utils/parseFractionAnswer';

describe('parseFractionAnswer', () => {
  it('parses whole numbers', () => {
    expect(parseFractionAnswer('2')).toEqual({ numerator: 2, denominator: 1 });
  });

  it('parses and reduces fractions', () => {
    expect(parseFractionAnswer('6/8')).toEqual({ numerator: 3, denominator: 4 });
    expect(parseFractionAnswer('3/4')).toEqual({ numerator: 3, denominator: 4 });
  });

  it('parses decimal answers', () => {
    expect(parseFractionAnswer('0.25')).toEqual({ numerator: 1, denominator: 4 });
    expect(parseFractionAnswer('0.5')).toEqual({ numerator: 1, denominator: 2 });
  });

  it('accepts complete decimal input for validation', () => {
    expect(isCompleteFractionAnswer('0.083')).toBe(true);
    expect(isCompleteFractionAnswer('1/12')).toBe(true);
  });

  it('matches decimal equivalents of fractions', () => {
    expect(fractionAnswerMatches('0.25', { numerator: 1, denominator: 4 })).toBe(true);
    expect(fractionAnswerMatches('0.083', { numerator: 1, denominator: 12 })).toBe(true);
    expect(fractionAnswerMatches('0.5', { numerator: 1, denominator: 4 })).toBe(false);
  });

  it('rejects invalid input', () => {
    expect(parseFractionAnswer('')).toBe(null);
    expect(parseFractionAnswer('3/')).toBe(null);
    expect(parseFractionAnswer('/4')).toBe(null);
    expect(parseFractionAnswer('3/0')).toBe(null);
    expect(parseFractionAnswer('a/b')).toBe(null);
  });
});
