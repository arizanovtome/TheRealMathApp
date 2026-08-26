import { formatDivideExpression } from '@/features/questions/mathExpressionFormat';

describe('mathExpressionFormat', () => {
  it('wraps a negative divisor in parentheses', () => {
    expect(formatDivideExpression('?', -10)).toBe('? ÷ (−10)');
    expect(formatDivideExpression(-120, -10)).toBe('−120 ÷ (−10)');
  });

  it('does not wrap a positive divisor in parentheses', () => {
    expect(formatDivideExpression(120, 10)).toBe('120 ÷ 10');
  });
});
