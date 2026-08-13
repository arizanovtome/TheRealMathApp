import {
  buildAnswerOptions,
  positiveFeedbackForCorrectCount,
  pickWrongDistractorNearCorrect,
} from '@/features/questions/answerOptionsGenerator';

describe('positiveFeedbackForCorrectCount', () => {
  it('escalates messages by share of session answered correctly', () => {
    expect(positiveFeedbackForCorrectCount(1, 10)).toBe('Keep going!');
    expect(positiveFeedbackForCorrectCount(2, 10)).toBe('You got it!');
    expect(positiveFeedbackForCorrectCount(3, 10)).toBe('Well done!');
    expect(positiveFeedbackForCorrectCount(5, 10)).toBe('Great job!');
    expect(positiveFeedbackForCorrectCount(7, 10)).toBe('Nice work!');
    expect(positiveFeedbackForCorrectCount(9, 10)).toBe('Amazing!');
  });

  it('scales for shorter sessions', () => {
    expect(positiveFeedbackForCorrectCount(1, 5)).toBe('You got it!');
    expect(positiveFeedbackForCorrectCount(2, 5)).toBe('Well done!');
    expect(positiveFeedbackForCorrectCount(3, 5)).toBe('Great job!');
    expect(positiveFeedbackForCorrectCount(5, 5)).toBe('Amazing!');
  });

  it('keeps the first timed answer modest when accuracy is 100%', () => {
    expect(positiveFeedbackForCorrectCount(1, 1)).toBe('You got it!');
  });
});

describe('buildAnswerOptions', () => {
  it('includes the correct answer exactly once', () => {
    const options = buildAnswerOptions(15, 4, false, { min: 0, max: 100 });
    expect(options).toHaveLength(4);
    expect(options.filter((x) => x === 15)).toHaveLength(1);
  });

  it('does not contain duplicates', () => {
    const options = buildAnswerOptions(8, 3, false, { min: 0, max: 100 });
    expect(new Set(options).size).toBe(options.length);
  });

  it('uses wrong answers within ±10 of correct when bounds allow', () => {
    const correct = 20;
    const options = buildAnswerOptions(correct, 4, true, { min: -1000, max: 1000 });
    for (const v of options) {
      if (v !== correct) {
        expect(Math.abs(v - correct)).toBeGreaterThanOrEqual(1);
        expect(Math.abs(v - correct)).toBeLessThanOrEqual(10);
      }
    }
  });

  it('never uses negative distractors when disallowed', () => {
    const options = buildAnswerOptions(2, 4, false, { min: 0, max: 100 });
    for (const v of options) {
      expect(v).toBeGreaterThanOrEqual(0);
    }
    expect(options).toContain(2);
    expect(new Set(options).size).toBe(4);
  });

  it('clips distractors to supplied bounds', () => {
    const options = buildAnswerOptions(98, 4, false, { min: 0, max: 100 });
    for (const v of options) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
    expect(options).toContain(98);
  });

  it('supports correct near zero with ±10 pool when bounds allow', () => {
    const options = buildAnswerOptions(1, 4, false, { min: 0, max: 100 });
    expect(options).toHaveLength(4);
    expect(options).toContain(1);
    for (const v of options) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it('supports six options', () => {
    const options = buildAnswerOptions(10, 6, false, { min: 0, max: 100 });
    expect(options).toHaveLength(6);
    expect(options).toContain(10);
    expect(new Set(options).size).toBe(6);
  });

  it('pickWrongDistractorNearCorrect stays in bounds and differs from correct', () => {
    const w = pickWrongDistractorNearCorrect(20, false, { min: 0, max: 100 });
    expect(w).not.toBe(20);
    expect(w).toBeGreaterThanOrEqual(0);
    expect(w).toBeLessThanOrEqual(100);
  });
});
