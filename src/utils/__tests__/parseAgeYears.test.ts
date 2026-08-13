import { parseAgeYears } from '@/utils/parseAgeYears';

describe('parseAgeYears', () => {
  it('accepts ages within the allowed range', () => {
    expect(parseAgeYears('1')).toBe(1);
    expect(parseAgeYears('4')).toBe(4);
    expect(parseAgeYears('12')).toBe(12);
    expect(parseAgeYears('150')).toBe(150);
  });

  it('rejects out-of-range ages', () => {
    expect(parseAgeYears('0')).toBeNull();
    expect(parseAgeYears('151')).toBeNull();
  });
});
