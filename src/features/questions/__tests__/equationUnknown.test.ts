import {
  buildEquationMcOptions,
  equationAnswerMatches,
  equationMcOptionMatches,
  normalizeEquationAnswerInput,
  tryParseEquationExpressionValue,
} from '@/features/questions/equationUnknown';

describe('equationUnknown answer parsing', () => {
  it('normalizes spaces and division symbols', () => {
    expect(normalizeEquationAnswerInput('  20  :  5  ')).toBe('20:5');
    expect(normalizeEquationAnswerInput('20÷5')).toBe('20:5');
    expect(normalizeEquationAnswerInput('20/5')).toBe('20:5');
  });

  it('parses and displays a negative divisor in parentheses', () => {
    expect(tryParseEquationExpressionValue('45:(-5)')).toBe(-9);
    expect(equationAnswerMatches(-9, '45:(-5)', '45:-5')).toBe(true);
  });

  it('accepts the canonical expression or an equivalent value', () => {
    expect(equationAnswerMatches(4, '20:5', '20:5')).toBe(true);
    expect(equationAnswerMatches(4, '20:5', ' 20 : 5 ')).toBe(true);
    expect(equationAnswerMatches(4, '20:5', '4')).toBe(true);
    expect(equationAnswerMatches(4, '20:5', '5')).toBe(false);
  });

  it('builds four distinct equation options when four are requested', () => {
    const opts = buildEquationMcOptions(
      'subtraction',
      '44+100',
      144,
      4,
      { op: 'subtraction', variant: 'x_minus_c', s: 44, c: 100 },
    );
    expect(opts).toHaveLength(4);
    expect(opts.some((o) => equationMcOptionMatches('44+100', o))).toBe(true);
    expect(new Set(opts).size).toBe(4);
    expect(
      opts.some((w) => equationMcOptionMatches('100-44', w) || equationMcOptionMatches('44-100', w)),
    ).toBe(true);
  });

  it('fills four options for x − c = s when only two +/− wrongs exist', () => {
    const opts = buildEquationMcOptions(
      'subtraction',
      '20+86',
      106,
      4,
      { op: 'subtraction', variant: 'x_minus_c', s: 20, c: 86 },
    );
    expect(opts).toHaveLength(4);
    expect(opts.some((o) => equationMcOptionMatches('20+86', o))).toBe(true);
    const wrongs = opts.filter((o) => !equationMcOptionMatches('20+86', o));
    expect(wrongs.length).toBe(3);
    expect(new Set(wrongs).size).toBe(3);
  });

  it('uses only the prompt numbers and ×/÷ transformations for division distractors', () => {
    const opts = buildEquationMcOptions(
      'division',
      '35:7',
      5,
      4,
      { op: 'division', dividend: 35, rhsQuotient: 7 },
    );

    expect(new Set(opts)).toEqual(
      new Set(['35:7', '7:35', '35 × 7', '7 × 35']),
    );
  });

  it('uses the same prompt-number transformations for multiplication equations', () => {
    const opts = buildEquationMcOptions(
      'multiplication',
      '35:7',
      5,
      4,
      { op: 'multiplication', product: 35, leftFactor: 7 },
    );

    expect(new Set(opts)).toEqual(
      new Set(['35:7', '7:35', '35 × 7', '7 × 35']),
    );
  });

  it('parses addition-style expressions', () => {
    expect(tryParseEquationExpressionValue('10-3')).toBe(7);
    expect(tryParseEquationExpressionValue('4+9')).toBe(13);
  });

  it('parses expressions with negative numbers', () => {
    expect(tryParseEquationExpressionValue('-10:5')).toBe(-2);
    expect(tryParseEquationExpressionValue('10:-5')).toBe(-2);
    expect(tryParseEquationExpressionValue('-10--3')).toBe(-7);
    expect(tryParseEquationExpressionValue('-4+-9')).toBe(-13);
  });
});
