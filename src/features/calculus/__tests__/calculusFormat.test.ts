import {
  calculusAnswersMatch,
  formatDerivativePowerAnswer,
  formatDerivativePrompt,
  formatIntegralPowerAnswer,
  formatIntegralPrompt,
  formatPower,
  normalizeCalculusAnswer,
} from '@/features/calculus/calculusFormat';

describe('calculusFormat', () => {
  it('formats powers with superscripts', () => {
    expect(formatPower('x', 2)).toBe('x²');
    expect(formatPower('x', 3)).toBe('x³');
  });

  it('formats derivative and integral prompts', () => {
    expect(formatDerivativePrompt('x²')).toBe("(x²)' = ?");
    expect(formatIntegralPrompt('x²')).toBe('∫x² dx = ?');
  });

  it('formats power rule answers', () => {
    expect(formatDerivativePowerAnswer(1, 2)).toBe('2x');
    expect(formatIntegralPowerAnswer(1, 2)).toBe('x³/3 + C');
  });

  it('normalizes answers for comparison', () => {
    expect(normalizeCalculusAnswer('x³/3 + C')).toBe('x³/3+c');
    expect(calculusAnswersMatch('x³/3 + C', 'x³/3+C')).toBe(true);
  });
});
