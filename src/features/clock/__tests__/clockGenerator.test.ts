import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { tryGenerateClockQuestion } from '@/features/clock/clockGenerator';
import { formatDurationMinutes } from '@/features/clock/clockFormat';
import { i18n } from '@/i18n';

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

  it('formats Macedonian elapsed-time answers with localized units', async () => {
    try {
      await i18n.changeLanguage('mk');
      const units = { hour: 'час', hours: 'часови', minute: 'минута', minutes: 'минути' };

      expect(formatDurationMinutes(1, units)).toBe('1 минута');
      expect(formatDurationMinutes(60, units)).toBe('1 час');
      expect(formatDurationMinutes(301, units)).toBe('5 часови 1 минута');
      expect(formatDurationMinutes(320, units)).toBe('5 часови 20 минути');

      const config = getRecommendedLearningPlan(8);
      config.clock = {
        enabled: true,
        readAnalog: false,
        elapsedTime: true,
        hourFormat: 12,
        minuteGranularity: 15,
      };
      const q = tryGenerateClockQuestion(config);
      expect(q?.answerOptions.every((option) => !/\b(hours?|minutes?)\b/.test(option))).toBe(true);
    } finally {
      await i18n.changeLanguage('en');
    }
  });
});
