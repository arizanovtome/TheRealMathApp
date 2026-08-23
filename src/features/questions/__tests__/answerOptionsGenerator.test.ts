import type { AnswerOptionsCount } from '@/features/learning-plan/learningPlan.types';
import { buildFixedAnswerOptions, limitAnswerOptions } from '@/features/questions/answerOptionsGenerator';

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
});
