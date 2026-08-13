import type { ClockConfig, MathLearningConfig } from '@/features/learning-plan/learningPlan.types';

export function hasClockQuestionSource(config: MathLearningConfig): boolean {
  if (!config.clock.enabled) return false;
  return config.clock.readAnalog || config.clock.elapsedTime;
}

export function normalizeClockConfig(raw: unknown): ClockConfig {
  const base = {
    enabled: false,
    readAnalog: true,
    elapsedTime: false,
    hourFormat: 12 as const,
    minuteGranularity: 15 as const,
  };
  if (!raw || typeof raw !== 'object') return { ...base };
  const r = raw as Record<string, unknown>;
  const hourFormat = r.hourFormat === 24 ? 24 : 12;
  const minuteGranularity =
    r.minuteGranularity === 1 || r.minuteGranularity === 5 || r.minuteGranularity === 15
      ? r.minuteGranularity
      : 15;
  return {
    enabled: r.enabled === true,
    readAnalog: r.readAnalog !== false,
    elapsedTime: r.elapsedTime === true,
    hourFormat,
    minuteGranularity,
  };
}

export type ClockSubtype = 'read_analog' | 'elapsed_time';

export function getEnabledClockSubtypes(config: MathLearningConfig): ClockSubtype[] {
  if (!config.clock.enabled) return [];
  const out: ClockSubtype[] = [];
  if (config.clock.readAnalog) out.push('read_analog');
  if (config.clock.elapsedTime) out.push('elapsed_time');
  return out;
}
