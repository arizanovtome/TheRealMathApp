import { formatThousandsDots } from '@/utils/numbers';

describe('formatThousandsDots', () => {
  it('groups thousands with dots', () => {
    expect(formatThousandsDots(1)).toBe('1');
    expect(formatThousandsDots(1000)).toBe('1.000');
    expect(formatThousandsDots(1_000_000)).toBe('1.000.000');
    expect(formatThousandsDots(1234567)).toBe('1.234.567');
  });
});
