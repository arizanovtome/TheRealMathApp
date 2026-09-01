export type ClockTime = {
  /** 0–23 */
  hour: number;
  /** 0–59 */
  minute: number;
};

export type ClockQuestionSubtype = 'read_analog' | 'elapsed_time';

export type DurationUnitLabels = {
  hour: string;
  hours: string;
  minute: string;
  minutes: string;
};

const ENGLISH_DURATION_UNITS: DurationUnitLabels = {
  hour: 'hour',
  hours: 'hours',
  minute: 'minute',
  minutes: 'minutes',
};

export function formatClockTime(time: ClockTime, hourFormat: 12 | 24): string {
  const minuteText = String(time.minute).padStart(2, '0');
  if (hourFormat === 24) {
    return `${time.hour}:${minuteText}`;
  }
  const h12 = time.hour % 12 || 12;
  const ampm = time.hour < 12 ? 'AM' : 'PM';
  return `${h12}:${minuteText} ${ampm}`;
}

/** Analog clock answers — the face has no AM/PM indicator. */
export function formatAnalogReadTime(time: ClockTime, hourFormat: 12 | 24): string {
  const minuteText = String(time.minute).padStart(2, '0');
  if (hourFormat === 24) {
    return `${time.hour}:${minuteText}`;
  }
  const h12 = time.hour % 12 || 12;
  return `${h12}:${minuteText}`;
}

export function formatDurationMinutes(
  totalMinutes: number,
  units: DurationUnitLabels = ENGLISH_DURATION_UNITS,
): string {
  if (totalMinutes <= 0) return `0 ${units.minutes}`;
  if (totalMinutes < 60) {
    return `${totalMinutes} ${totalMinutes === 1 ? units.minute : units.minutes}`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) {
    return `${hours} ${hours === 1 ? units.hour : units.hours}`;
  }
  const hourUnit = hours === 1 ? units.hour : units.hours;
  const minuteUnit = minutes === 1 ? units.minute : units.minutes;
  return `${hours} ${hourUnit} ${minutes} ${minuteUnit}`;
}

export function elapsedMinutesBetween(start: ClockTime, end: ClockTime): number {
  const startTotal = start.hour * 60 + start.minute;
  const endTotal = end.hour * 60 + end.minute;
  let diff = endTotal - startTotal;
  if (diff <= 0) diff += 24 * 60;
  return diff;
}
