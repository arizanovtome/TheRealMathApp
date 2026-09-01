import type { MathOperation } from '@/features/learning-plan/learningPlan.types';
import { ALL_MATH_OPERATIONS } from '@/features/learning-plan/learningPlan.types';
import type {
  SessionHistoryEntry,
  SessionHistoryModeFilter,
} from '@/features/progress/sessionHistory.types';
import type {
  OperationStatsRollup,
  SessionModeResult,
  SessionResult,
  TimedRunSummary,
} from '@/features/questions/questionScoring';

const ALL_OPS = ALL_MATH_OPERATIONS;

function normalizeOperationStats(raw: unknown): OperationStatsRollup | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const out: OperationStatsRollup = {};
  for (const op of ALL_OPS) {
    const v = (raw as Record<string, unknown>)[op];
    if (!v || typeof v !== 'object') continue;
    const o = v as Record<string, unknown>;
    const attempted = typeof o.attempted === 'number' ? o.attempted : Number(o.attempted);
    const wrong = typeof o.wrong === 'number' ? o.wrong : Number(o.wrong);
    if (!Number.isFinite(attempted) || !Number.isFinite(wrong)) continue;
    out[op] = {
      attempted: Math.max(0, Math.round(attempted)),
      wrong: Math.max(0, Math.round(wrong)),
    };
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function normalizeTimedRunSummary(raw: unknown): TimedRunSummary | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const survivedSeconds = typeof o.survivedSeconds === 'number' ? o.survivedSeconds : Number(o.survivedSeconds);
  const initialSeconds = typeof o.initialSeconds === 'number' ? o.initialSeconds : Number(o.initialSeconds);
  const bonusSeconds = typeof o.bonusSeconds === 'number' ? o.bonusSeconds : Number(o.bonusSeconds);
  const penaltySeconds = typeof o.penaltySeconds === 'number' ? o.penaltySeconds : Number(o.penaltySeconds);
  if (
    !Number.isFinite(survivedSeconds) ||
    !Number.isFinite(initialSeconds) ||
    !Number.isFinite(bonusSeconds) ||
    !Number.isFinite(penaltySeconds)
  ) {
    return undefined;
  }
  return {
    survivedSeconds: Math.max(0, Math.round(survivedSeconds)),
    initialSeconds: Math.max(0, Math.round(initialSeconds)),
    bonusSeconds: Math.max(0, Math.round(bonusSeconds)),
    penaltySeconds: Math.max(0, Math.round(penaltySeconds)),
  };
}

export const SESSION_HISTORY_LIMIT = 50;

/** Keep recent-performance averages and lists aligned with the saved history window. */
export const RECENT_SESSIONS_DISPLAY_COUNT = SESSION_HISTORY_LIMIT;

export function filterSessionHistory(
  history: SessionHistoryEntry[],
  mode: SessionHistoryModeFilter,
): SessionHistoryEntry[] {
  if (mode === 'all') return history;
  return history.filter((entry) => entry.sessionMode === mode);
}

export function recordFromSessionResult(result: SessionResult): SessionHistoryEntry {
  return {
    completedAt: new Date().toISOString(),
    scorePercentage: result.scorePercentage,
    sessionMode: result.sessionMode ?? 'practice',
    totalQuestions: result.totalQuestions,
    correctAnswers: result.correctAnswers,
    operationStats: result.operationStats,
    timedRun: result.timedRun,
  };
}

export function appendSessionHistory(
  prev: SessionHistoryEntry[],
  result: SessionResult,
  maxEntries: number = SESSION_HISTORY_LIMIT,
): SessionHistoryEntry[] {
  const entry = recordFromSessionResult(result);
  return [entry, ...prev].slice(0, maxEntries);
}

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function previousLocalDateKey(key: string): string {
  const parts = key.split('-').map(Number);
  const y = parts[0]!;
  const mo = parts[1]!;
  const da = parts[2]!;
  const dt = new Date(y, mo - 1, da);
  dt.setDate(dt.getDate() - 1);
  return localDateKey(dt);
}

export function parseIsoToLocalDateKey(iso: string): string {
  return localDateKey(new Date(iso));
}

/**
 * Consecutive calendar days (local) with at least one completed session.
 * If there was no session today, yesterday still continues the streak (common “grace” rule).
 */
export function computeCurrentStreak(history: SessionHistoryEntry[]): number {
  if (history.length === 0) return 0;
  const daySet = new Set(history.map((h) => parseIsoToLocalDateKey(h.completedAt)));
  const todayKey = localDateKey(new Date());
  const yesterdayKey = previousLocalDateKey(todayKey);

  let checkKey = todayKey;
  if (!daySet.has(todayKey)) {
    if (!daySet.has(yesterdayKey)) return 0;
    checkKey = yesterdayKey;
  }

  let streak = 0;
  let guard = 0;
  while (daySet.has(checkKey) && guard < 366) {
    guard += 1;
    streak += 1;
    checkKey = previousLocalDateKey(checkKey);
  }
  return streak;
}

export function averageScoreRecent(history: SessionHistoryEntry[], count: number): number | null {
  const slice = history.slice(0, Math.min(count, history.length));
  if (slice.length === 0) return null;
  const sum = slice.reduce((acc, e) => acc + e.scorePercentage, 0);
  return Math.round(sum / slice.length);
}

export function normalizeSessionHistory(raw: unknown): SessionHistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: SessionHistoryEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const completedAt = typeof o.completedAt === 'string' ? o.completedAt : null;
    const sp = o.scorePercentage;
    const scorePercentage = typeof sp === 'number' ? sp : Number(sp);
    const mode: SessionModeResult =
      o.sessionMode === 'quiz' ? 'quiz' : o.sessionMode === 'timed' ? 'timed' : 'practice';
    const tq = o.totalQuestions;
    const ca = o.correctAnswers;
    const totalQuestions = typeof tq === 'number' ? tq : Number(tq);
    const correctAnswers = typeof ca === 'number' ? ca : Number(ca);
    if (
      !completedAt ||
      !Number.isFinite(scorePercentage) ||
      !Number.isFinite(totalQuestions) ||
      !Number.isFinite(correctAnswers)
    ) {
      continue;
    }
    const entry: SessionHistoryEntry = {
      completedAt,
      scorePercentage: Math.round(scorePercentage),
      sessionMode: mode,
      totalQuestions: Math.max(0, Math.round(totalQuestions)),
      correctAnswers: Math.max(0, Math.round(correctAnswers)),
    };
    const os = normalizeOperationStats(o.operationStats);
    if (os) entry.operationStats = os;
    const timedRun = normalizeTimedRunSummary(o.timedRun);
    if (timedRun) entry.timedRun = timedRun;
    out.push(entry);
  }
  return out.slice(0, SESSION_HISTORY_LIMIT);
}
