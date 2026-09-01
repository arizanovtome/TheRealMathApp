import { formatBuildStampDate, isBuildInfoKind } from '@/features/updates/buildInfo.utils';

describe('formatBuildStampDate', () => {
  it('formats a valid ISO stamp for the locale', () => {
    const formatted = formatBuildStampDate('2026-08-31T09:30:00.000Z', 'en-US');
    expect(formatted).toContain('2026');
    expect(formatted).toMatch(/Aug|8/);
  });

  it('returns the raw value when the stamp is invalid', () => {
    expect(formatBuildStampDate('not-a-date', 'en')).toBe('not-a-date');
  });
});

describe('isBuildInfoKind', () => {
  it('accepts known build stamp kinds', () => {
    expect(isBuildInfoKind('build')).toBe(true);
    expect(isBuildInfoKind('update')).toBe(true);
    expect(isBuildInfoKind('development')).toBe(true);
  });

  it('rejects unknown values', () => {
    expect(isBuildInfoKind('release')).toBe(false);
  });
});
