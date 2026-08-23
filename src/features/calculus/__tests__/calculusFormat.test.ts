import {
  calculusAnswersMatch,
  formatDerivativePowerQuotientAnswer,
  formatDerivativeQuotientAnswer,
  formatDerivativeTrigAnswer,
  formatDifferentiationQuotientAnswer,
  formatIntegralQuotientAnswer,
  formatIntegralTrigAnswer,
} from '@/features/calculus/calculusFormat';

describe('calculusFormat trig and quotient', () => {
  it('formats trig derivatives', () => {
    expect(formatDerivativeTrigAnswer('sin')).toBe('cos x');
    expect(formatDerivativeTrigAnswer('cos')).toBe('−sin x');
    expect(formatDerivativeTrigAnswer('sin', 3)).toBe('3 cos x');
  });

  it('formats trig integrals', () => {
    expect(formatIntegralTrigAnswer('sin')).toBe('−cos x + C');
    expect(formatIntegralTrigAnswer('cos')).toBe('sin x + C');
    expect(calculusAnswersMatch('−cos x + C', '−cos x + C')).toBe(true);
  });

  it('formats power-over-power quotient derivatives (integration simplify path)', () => {
    expect(formatDerivativeQuotientAnswer(1, 2, 1)).toBe('1');
    expect(formatDerivativeQuotientAnswer(1, 3, 1)).toBe('2x');
    expect(formatDerivativePowerQuotientAnswer(4, 5, 3)).toBe('8x');
    expect(formatIntegralQuotientAnswer(1, 3, 1)).toBe('x³/3 + C');
  });

  it('formats true quotient-rule derivatives', () => {
    expect(
      formatDifferentiationQuotientAnswer({ kind: 'x_over_shift', shift: 3 }),
    ).toBe('3/(x + 3)²');
    expect(
      formatDifferentiationQuotientAnswer({ kind: 'kx_over_shift', coeff: 2, shift: 3 }),
    ).toBe('6/(x + 3)²');
    expect(
      formatDifferentiationQuotientAnswer({ kind: 'k_over_shift', coeff: 4, shift: 3 }),
    ).toBe('-4/(x + 3)²');
  });
});
