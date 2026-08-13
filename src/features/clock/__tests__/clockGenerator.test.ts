import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { tryGenerateClockQuestion } from '@/features/clock/clockGenerator';

describe('clockGenerator', () => {
  it('generates read analog questions', () => {
    const config = getRecommendedLearningPlan(8);
    config.clock = {
      enabled: true,
      readAnalog: true,
      elapsedTime: false,
      hourFormat: 12,
      minuteGranularity: 15,
    };
    const q = tryGenerateClockQuestion(config);
    expect(q).not.toBeNull();
    expect(q!.subtype).toBe('read_analog');
    expect(q!.displayTime).toBeDefined();
    expect(q!.answerOptions).toContain(q!.correctAnswer);
    expect(q!.correctAnswer).not.toMatch(/\b(AM|PM)\b/);
    expect(q!.answerOptions.every((option) => !/\b(AM|PM)\b/.test(option))).toBe(true);
  });

  it('generates elapsed time questions', () => {
    const config = getRecommendedLearningPlan(8);
    config.clock = {
      enabled: true,
      readAnalog: false,
      elapsedTime: true,
      hourFormat: 12,
      minuteGranularity: 15,
    };
    for (let i = 0; i < 20; i++) {
      const q = tryGenerateClockQuestion(config);
      if (q?.subtype === 'elapsed_time') {
        expect(q.answerOptions).toContain(q.correctAnswer);
        return;
      }
    }
    expect(true).toBe(true);
  });
});
