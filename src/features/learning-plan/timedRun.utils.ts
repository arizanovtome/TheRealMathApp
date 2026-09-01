import {
  TIMED_BONUS_HEADROOM_SECONDS,
  type TimedDurationMinutes,
} from '@/features/learning-plan/learningPlan.types';

export function formatTimedDurationCompact(minutes: TimedDurationMinutes): string {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)}s`;
  }
  return `${minutes} min`;
}

export function formatTimedSecondsClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r}s`;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function adjustedTimedRemainingSeconds(
  currentRemaining: number,
  delta: number,
  initialDuration: number,
): number {
  const current = Math.max(0, Math.round(currentRemaining));
  const change = Math.round(delta);
  const initial = Math.max(0, Math.round(initialDuration));
  return Math.min(
    initial + TIMED_BONUS_HEADROOM_SECONDS,
    Math.max(0, current + change),
  );
}
