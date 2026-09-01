import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { getEnabledClockSubtypes } from '@/features/clock/clockConfig.utils';
import {
  elapsedMinutesBetween,
  formatAnalogReadTime,
  formatClockTime,
  formatDurationMinutes,
  type ClockTime,
  type DurationUnitLabels,
} from '@/features/clock/clockFormat';
import type { ClockMathQuestion } from '@/features/questions/question.types';
import { i18n } from '@/i18n';
import { pickRandom, randomIntInclusive } from '@/utils/random';

function pickMinute(granularity: 1 | 5 | 15): number {
  if (granularity === 15) {
    return pickRandom([0, 15, 30, 45]);
  }
  if (granularity === 5) {
    return randomIntInclusive(0, 11) * 5;
  }
  return randomIntInclusive(0, 59);
}

function randomClockTime(config: MathLearningConfig): ClockTime {
  const hour = randomIntInclusive(0, 23);
  const minute = pickMinute(config.clock.minuteGranularity);
  return { hour, minute };
}

function randomAnalogReadTime(config: MathLearningConfig): ClockTime {
  const hour =
    config.clock.hourFormat === 24
      ? randomIntInclusive(0, 23)
      : randomIntInclusive(1, 12);
  const minute = pickMinute(config.clock.minuteGranularity);
  return { hour, minute };
}

function durationUnitLabels(): DurationUnitLabels {
  return {
    hour: i18n.t('questions:durationUnits.hour'),
    hours: i18n.t('questions:durationUnits.hours'),
    minute: i18n.t('questions:durationUnits.minute'),
    minutes: i18n.t('questions:durationUnits.minutes'),
  };
}

function formatLocalizedDuration(totalMinutes: number): string {
  return formatDurationMinutes(totalMinutes, durationUnitLabels());
}

function buildTimeMcOptions(
  correctLabel: string,
  time: ClockTime,
  hourFormat: 12 | 24,
  count: number,
  formatTime: (time: ClockTime, hourFormat: 12 | 24) => string = formatClockTime,
): string[] {
  const pool = new Set<string>([correctLabel]);
  for (let i = 0; i < 40 && pool.size < count + 8; i++) {
    const offsetHour = randomIntInclusive(-2, 2);
    const offsetMin = pickRandom([-30, -15, -5, 5, 15, 30, 45]);
    const candidate: ClockTime = {
      hour: (time.hour + offsetHour + 24) % 24,
      minute: (time.minute + offsetMin + 60) % 60,
    };
    pool.add(formatTime(candidate, hourFormat));
  }
  pool.delete(correctLabel);
  const distractors = [...pool];
  const options = [correctLabel];
  while (options.length < count && distractors.length > 0) {
    const idx = randomIntInclusive(0, distractors.length - 1);
    options.push(distractors.splice(idx, 1)[0]!);
  }
  return options.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

function buildDurationMcOptions(correctMinutes: number, count: number): string[] {
  const correctLabel = formatLocalizedDuration(correctMinutes);
  const pool = new Set<string>([correctLabel]);
  const offsets = [-45, -30, -15, -10, -5, 5, 10, 15, 30, 45, 60, 90];
  for (const offset of offsets) {
    const mins = correctMinutes + offset;
    if (mins > 0 && mins <= 24 * 60) {
      pool.add(formatLocalizedDuration(mins));
    }
  }
  pool.delete(correctLabel);
  const distractors = [...pool];
  const options = [correctLabel];
  while (options.length < count && distractors.length > 0) {
    const idx = randomIntInclusive(0, distractors.length - 1);
    options.push(distractors.splice(idx, 1)[0]!);
  }
  return options.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

function generateReadAnalog(config: MathLearningConfig): Omit<ClockMathQuestion, 'id'> {
  const time = randomAnalogReadTime(config);
  const correctAnswer = formatAnalogReadTime(time, config.clock.hourFormat);
  return {
    kind: 'clock',
    operation: 'clock',
    subtype: 'read_analog',
    questionText: i18n.t('questions:whatTimeIsIt'),
    correctAnswer,
    answerOptions: buildTimeMcOptions(
      correctAnswer,
      time,
      config.clock.hourFormat,
      config.answerOptionsCount,
      formatAnalogReadTime,
    ),
    requiresMultipleChoice: true,
    displayTime: time,
  };
}

function generateElapsedTime(config: MathLearningConfig): Omit<ClockMathQuestion, 'id'> {
  const start = randomClockTime(config);
  let end = randomClockTime(config);
  for (let i = 0; i < 20; i++) {
    const mins = elapsedMinutesBetween(start, end);
    if (mins >= 15 && mins <= 8 * 60) break;
    end = randomClockTime(config);
  }
  const elapsed = elapsedMinutesBetween(start, end);
  const startLabel = formatClockTime(start, config.clock.hourFormat);
  const endLabel = formatClockTime(end, config.clock.hourFormat);
  const correctAnswer = formatLocalizedDuration(elapsed);
  return {
    kind: 'clock',
    operation: 'clock',
    subtype: 'elapsed_time',
    questionText: i18n.t('questions:elapsedTime', { start: startLabel, end: endLabel }),
    correctAnswer,
    answerOptions: buildDurationMcOptions(elapsed, config.answerOptionsCount),
    requiresMultipleChoice: true,
    elapsedStart: start,
    elapsedEnd: end,
  };
}

export function tryGenerateClockQuestion(
  config: MathLearningConfig,
): Omit<ClockMathQuestion, 'id'> | null {
  const subtypes = getEnabledClockSubtypes(config);
  if (subtypes.length === 0) return null;
  const subtype = pickRandom(subtypes);
  switch (subtype) {
    case 'read_analog':
      return generateReadAnalog(config);
    case 'elapsed_time':
      return generateElapsedTime(config);
  }
}
