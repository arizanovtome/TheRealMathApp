import {
  sanitizeDecimalAnswerInput,
  sanitizeFractionAnswerInput,
} from '@/utils/answerInputKeyboard';

describe('answerInputKeyboard sanitizers', () => {
  describe('sanitizeFractionAnswerInput', () => {
    it('allows digits, slash, and dot', () => {
      expect(sanitizeFractionAnswerInput('2/5')).toBe('2/5');
      expect(sanitizeFractionAnswerInput('0.25')).toBe('0.25');
      expect(sanitizeFractionAnswerInput('-1/12')).toBe('-1/12');
    });

    it('strips letters and other symbols', () => {
      expect(sanitizeFractionAnswerInput('Tio')).toBe('');
      expect(sanitizeFractionAnswerInput('3a/4b')).toBe('3/4');
      expect(sanitizeFractionAnswerInput('1+2')).toBe('12');
    });

    it('normalizes comma to dot for locales that show comma on the keyboard', () => {
      expect(sanitizeFractionAnswerInput('0,25')).toBe('0.25');
      expect(sanitizeDecimalAnswerInput('3,14')).toBe('3.14');
    });

    it('allows only one slash or dot', () => {
      expect(sanitizeFractionAnswerInput('2//5')).toBe('2/5');
      expect(sanitizeFractionAnswerInput('0..25')).toBe('0.25');
      expect(sanitizeFractionAnswerInput('2/3.5')).toBe('2/35');
    });
  });

  describe('sanitizeDecimalAnswerInput', () => {
    it('allows digits and one dot', () => {
      expect(sanitizeDecimalAnswerInput('42')).toBe('42');
      expect(sanitizeDecimalAnswerInput('-3.14')).toBe('-3.14');
    });

    it('strips non-numeric characters', () => {
      expect(sanitizeDecimalAnswerInput('abc12.3')).toBe('12.3');
    });
  });
});
