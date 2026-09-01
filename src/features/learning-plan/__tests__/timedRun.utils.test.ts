import {
  adjustedTimedRemainingSeconds,
  formatTimedDurationCompact,
  formatTimedSecondsClock,
} from '@/features/learning-plan/timedRun.utils';

describe('formatTimedDurationCompact', () => {
  it('formats sub-minute presets as seconds', () => {
    expect(formatTimedDurationCompact(0.25)).toBe('15s');
    expect(formatTimedDurationCompact(0.5)).toBe('30s');
  });

  it('formats minute presets compactly', () => {
    expect(formatTimedDurationCompact(1)).toBe('1 min');
    expect(formatTimedDurationCompact(10)).toBe('10 min');
  });
});

describe('formatTimedSecondsClock', () => {
  it('formats sub-minute and minute durations', () => {
    expect(formatTimedSecondsClock(15)).toBe('15s');
    expect(formatTimedSecondsClock(92)).toBe('1:32');
  });
});

describe('adjustedTimedRemainingSeconds', () => {
  it('adds and removes configured seconds', () => {
    expect(adjustedTimedRemainingSeconds(40, 2)).toBe(42);
    expect(adjustedTimedRemainingSeconds(40, -5)).toBe(35);
  });

  it('never drops below zero', () => {
    expect(adjustedTimedRemainingSeconds(3, -5)).toBe(0);
  });

  it('always applies the full configured bonus', () => {
    expect(adjustedTimedRemainingSeconds(89, 5)).toBe(94);
  });
});
