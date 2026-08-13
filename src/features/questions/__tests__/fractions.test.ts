import {
  addFractions,
  buildFractionMcOptions,
  divideFractions,
  formatFraction,
  fractionsEqual,
  generateFractionQuestion,
  generateFractionSquareQuestion,
  generateFractionSquareRootQuestion,
  multiplyFractions,
  reduceFraction,
  subtractFractions,
} from '@/features/questions/fractions';

describe('fractions', () => {
  it('reduces fractions', () => {
    expect(reduceFraction({ numerator: 6, denominator: 8 })).toEqual({
      numerator: 3,
      denominator: 4,
    });
  });

  it('formats whole results without denominator', () => {
    expect(formatFraction({ numerator: 4, denominator: 2 })).toBe('2');
    expect(formatFraction({ numerator: 3, denominator: 4 })).toBe('3/4');
  });

  it('adds and subtracts fractions', () => {
    const half = { numerator: 1, denominator: 2 };
    const quarter = { numerator: 1, denominator: 4 };
    expect(addFractions(half, quarter)).toEqual({ numerator: 3, denominator: 4 });
    expect(subtractFractions(half, quarter)).toEqual({ numerator: 1, denominator: 4 });
  });

  it('multiplies and divides fractions', () => {
    const a = { numerator: 2, denominator: 3 };
    const b = { numerator: 3, denominator: 4 };
    expect(multiplyFractions(a, b)).toEqual({ numerator: 1, denominator: 2 });
    expect(divideFractions(a, b)).toEqual({ numerator: 8, denominator: 9 });
  });

  it('compares reduced fractions', () => {
    expect(
      fractionsEqual({ numerator: 1, denominator: 2 }, { numerator: 2, denominator: 4 }),
    ).toBe(true);
  });

  it('generates same-denominator addition', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateFractionQuestion('addition', 'same_only');
      const matches = q.questionText.match(/\d+\/\d+/g);
      expect(matches?.length).toBeGreaterThanOrEqual(2);
      expect(matches![0]!.split('/')[1]).toBe(matches![1]!.split('/')[1]);
    }
  });

  it('generates different-denominator addition', () => {
    let sawDifferent = false;
    for (let i = 0; i < 40; i++) {
      const q = generateFractionQuestion('addition', 'different_only');
      const parts = q.questionText.split(' ');
      const left = parts[0]!;
      const right = parts[2]!;
      if (left.split('/')[1] !== right.split('/')[1]) sawDifferent = true;
    }
    expect(sawDifferent).toBe(true);
  });

  it('builds multiple-choice options including the correct answer', () => {
    const correct = { numerator: 3, denominator: 4 };
    const opts = buildFractionMcOptions(correct, 4);
    expect(opts).toHaveLength(4);
    expect(new Set(opts).size).toBe(4);
    expect(opts).toContain('3/4');
  });

  it('generates fraction squaring as (1/2)² = ?', () => {
    const q = generateFractionSquareQuestion();
    expect(q.questionText).toMatch(/^\(.+\/.+\)² = \?$/);
    expect(q.correctFraction).toEqual(
      multiplyFractions(
        { numerator: q.left.numerator, denominator: q.left.denominator },
        { numerator: q.left.numerator, denominator: q.left.denominator },
      ),
    );
  });

  it('generates fraction square roots as √(9/16) = ?', () => {
    const q = generateFractionSquareRootQuestion();
    expect(q.questionText).toMatch(/^√\(\d+\/\d+\) = \?$/);
    const inner = q.questionText.slice(2, -5);
    const [num, den] = inner.split('/').map(Number);
    expect(num).toBe(q.correctFraction.numerator ** 2);
    expect(den).toBe(q.correctFraction.denominator ** 2);
  });
});
