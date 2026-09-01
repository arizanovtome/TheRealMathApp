import { roundingAlternateAnswer } from '@/features/questions/questionGenerator';

describe('roundingAlternateAnswer', () => {
  it('returns the lower bracket when rounding up to the nearest ten', () => {
    expect(roundingAlternateAnswer(35, 10, 40)).toBe(30);
  });

  it('returns the upper bracket when rounding down to the nearest ten', () => {
    expect(roundingAlternateAnswer(34, 10, 30)).toBe(40);
  });

  it('returns the other hundred when rounding 450 to the nearest hundred', () => {
    expect(roundingAlternateAnswer(450, 100, 500)).toBe(400);
    expect(roundingAlternateAnswer(449, 100, 400)).toBe(500);
  });

  it('returns the other whole number when rounding decimals', () => {
    expect(roundingAlternateAnswer(3.7, 'whole', 4)).toBe(3);
    expect(roundingAlternateAnswer(3.2, 'whole', 3)).toBe(4);
  });

  it('returns the adjacent decimal place value for tenths and hundredths', () => {
    expect(roundingAlternateAnswer(3.74, 'tenth', 3.7)).toBe(3.8);
    expect(roundingAlternateAnswer(3.76, 'tenth', 3.8)).toBe(3.7);
    expect(roundingAlternateAnswer(1.234, 'hundredth', 1.23)).toBe(1.24);
  });
});
