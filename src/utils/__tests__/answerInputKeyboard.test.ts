import {
  FRACTION_ANSWER_MAX_LENGTH,
  NUMERIC_ANSWER_MAX_LENGTH,
} from '@/constants/inputLimits';
import {
  answerInputKeyboardProps,
  sanitizeDecimalAnswerInput,
  sanitizeFractionAnswerInput,
  sanitizeAnswerInput,
} from '@/utils/answerInputKeyboard';

describe('answerInputKeyboard sanitizers', () => {
  describe('answerInputKeyboardProps', () => {
    it('uses Android signed numeric input instead of decimal-pad', () => {
      expect(answerInputKeyboardProps('numeric', 'android')).toEqual({
        keyboardType: 'numeric',
      });
    });

    it('uses the iOS punctuation keyboard so a minus sign is available', () => {
      expect(answerInputKeyboardProps('numeric', 'ios')).toEqual({
        keyboardType: 'numbers-and-punctuation',
        inputMode: 'text',
      });
    });
  });

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

    it('truncates very long pasted input', () => {
      expect(sanitizeDecimalAnswerInput('1'.repeat(30))).toHaveLength(NUMERIC_ANSWER_MAX_LENGTH);
      expect(sanitizeFractionAnswerInput('9'.repeat(30))).toHaveLength(FRACTION_ANSWER_MAX_LENGTH);
      expect(sanitizeAnswerInput('x'.repeat(50), 'equation')).toHaveLength(NUMERIC_ANSWER_MAX_LENGTH);
    });
  });
});
