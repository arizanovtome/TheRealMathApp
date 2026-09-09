import type { AnswerOptionsCount } from '@/features/learning-plan/learningPlan.types';
import {
  buildAnswerOptions,
  buildArithmeticAnswerOptions,
  buildDecimalAnswerOptions,
  buildFixedAnswerOptions,
  buildSteppedAnswerOptions,
  limitAnswerOptions,
} from '@/features/questions/answerOptionsGenerator';

describe('answerOptionsGenerator helpers', () => {
  describe('limitAnswerOptions', () => {
    it('truncates generated options to max count', () => {
      expect(limitAnswerOptions(['a', 'b', 'c', 'd', 'e'], 3)).toEqual(['a', 'b', 'c']);
    });

    it('never truncates fixed categorical sets', () => {
      expect(limitAnswerOptions(['Even', 'Odd'], 6, { fixedSet: true })).toEqual(['Even', 'Odd']);
      expect(limitAnswerOptions(['<', '>', '='], 2, { fixedSet: true })).toEqual(['<', '>', '=']);
    });
  });

  describe('buildFixedAnswerOptions', () => {
    it('returns all options for odd/even regardless of max', () => {
      const options = buildFixedAnswerOptions(['Even', 'Odd'], 6 as AnswerOptionsCount);
      expect(options).toHaveLength(2);
      expect(options).toContain('Even');
      expect(options).toContain('Odd');
    });
  });

  describe('buildAnswerOptions', () => {
    it('always includes a preferred sign-confusion distractor', () => {
      const options = buildAnswerOptions(-5, 4, true, undefined, [5]);

      expect(options).toHaveLength(4);
      expect(options).toContain(-5);
      expect(options).toContain(5);
    });

    it('includes a preferred sign-confusion distractor for decimals', () => {
      const options = buildDecimalAnswerOptions(-2.5, 4, true, undefined, [2.5]);

      expect(options).toContain(-2.5);
      expect(options).toContain(2.5);
    });

    it('includes the exact hundredths answer', () => {
      const options = buildDecimalAnswerOptions(-24.18, 4, true);

      expect(options).toHaveLength(4);
      expect(options).toContain(-24.18);
      expect(new Set(options).size).toBe(4);
    });
  });

  describe('buildArithmeticAnswerOptions', () => {
    it('changes meaningful higher places for large non-regrouping addition', () => {
      const correct = 968199;
      const options = buildArithmeticAnswerOptions(
        correct,
        4,
        false,
        undefined,
        { operation: 'addition', left: 525092, right: 443107, result: correct },
        'standard',
      );

      expect(options).toHaveLength(4);
      expect(options).toContain(correct);
      expect(options.some((value) => Math.abs(value - correct) >= 100)).toBe(true);
    });

    it('does not use plus or minus ten for small addition without regrouping', () => {
      const correct = 68;
      const options = buildArithmeticAnswerOptions(
        correct,
        4,
        false,
        undefined,
        { operation: 'addition', left: 35, right: 33, result: correct },
        'standard',
      );

      expect(options).not.toContain(correct - 10);
      expect(options).not.toContain(correct + 10);
      expect(options.some((value) => Math.abs(value - correct) >= 11)).toBe(true);
    });

    it('mixes a missed carry with errors that change both digits', () => {
      const correct = 72;
      const options = buildArithmeticAnswerOptions(
        correct,
        4,
        false,
        undefined,
        { operation: 'addition', left: 35, right: 37, result: correct },
        'standard',
      );

      expect(options).toContain(62);
      expect(options.some((value) => Math.abs(value - correct) >= 11)).toBe(true);
    });
  });

  describe('buildSteppedAnswerOptions', () => {
    it('always includes preferred rounding bracket distractors first', () => {
      const options = buildSteppedAnswerOptions(40, 4, 10, [30]);

      expect(options).toHaveLength(4);
      expect(options).toContain(40);
      expect(options).toContain(30);
    });
  });
});
