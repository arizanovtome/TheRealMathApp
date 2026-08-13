import {
  additionRequiresRegrouping,
  matchesRegroupingPreference,
  subtractionRequiresRegrouping,
} from '@/features/questions/regrouping';

describe('additionRequiresRegrouping', () => {
  it('detects carrying in the ones place', () => {
    expect(additionRequiresRegrouping(47, 38)).toBe(true);
    expect(additionRequiresRegrouping(99, 1)).toBe(true);
  });

  it('returns false when no carrying is needed', () => {
    expect(additionRequiresRegrouping(12, 5)).toBe(false);
    expect(additionRequiresRegrouping(20, 10)).toBe(false);
  });

  it('ignores negative operands', () => {
    expect(additionRequiresRegrouping(-47, 38)).toBe(false);
  });
});

describe('subtractionRequiresRegrouping', () => {
  it('detects borrowing in the ones place', () => {
    expect(subtractionRequiresRegrouping(52, 27)).toBe(true);
    expect(subtractionRequiresRegrouping(100, 1)).toBe(true);
  });

  it('returns false when no borrowing is needed', () => {
    expect(subtractionRequiresRegrouping(58, 23)).toBe(false);
    expect(subtractionRequiresRegrouping(20, 20)).toBe(false);
  });

  it('ignores negative operands', () => {
    expect(subtractionRequiresRegrouping(-52, 27)).toBe(false);
  });
});

describe('matchesRegroupingPreference', () => {
  it('excludes regrouping when off and allows any mix when on', () => {
    expect(
      matchesRegroupingPreference(false, 'addition', { left: 47, right: 38 }),
    ).toBe(false);
    expect(
      matchesRegroupingPreference(false, 'addition', { left: 12, right: 5 }),
    ).toBe(true);
    expect(
      matchesRegroupingPreference(true, 'addition', { left: 47, right: 38 }),
    ).toBe(true);
    expect(
      matchesRegroupingPreference(true, 'addition', { left: 12, right: 5 }),
    ).toBe(true);
  });
});
