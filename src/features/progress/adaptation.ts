import type { MathOperation } from '@/features/learning-plan/learningPlan.types';
import { ALL_MATH_OPERATIONS } from '@/features/learning-plan/learningPlan.types';
import type { SessionHistoryEntry } from '@/features/progress/sessionHistory.types';
import type { OperationStatsRollup } from '@/features/questions/questionScoring';

/** How many most recent sessions contribute to adaptation stats. */
export const ADAPTATION_SESSION_WINDOW = 5;

/** Minimum wrong answers on one operation in the window to suggest extra practice. */
export const ADAPTATION_MIN_WRONG = 2;

/** Minimum attempts on that operation so the rate is meaningful. */
export const ADAPTATION_MIN_ATTEMPTS = 3;

/** Wrong / attempted threshold (34%+ misses). */
export const ADAPTATION_WRONG_RATE = 0.34;

const ALL_OPS = ALL_MATH_OPERATIONS;

export function aggregateOperationStatsFromHistory(
  history: SessionHistoryEntry[],
  maxSessions: number,
): OperationStatsRollup {
  const slice = history.slice(0, maxSessions);
  const agg: OperationStatsRollup = {};
  for (const entry of slice) {
    if (!entry.operationStats) continue;
    for (const op of ALL_OPS) {
      const s = entry.operationStats[op];
      if (!s) continue;
      const cur = agg[op] ?? { attempted: 0, wrong: 0 };
      cur.attempted += s.attempted;
      cur.wrong += s.wrong;
      agg[op] = cur;
    }
  }
  return agg;
}

export type AdaptationSuggestion = {
  operation: MathOperation;
  wrong: number;
  attempted: number;
  wrongRate: number;
};

export type OperationCorrectSnapshot = {
  /** Rounded percent correct, or null if no attempts in window. */
  correctPercent: number | null;
  attempted: number;
};

/** Per-operation % correct from aggregated session history (recent sessions first). */
export function computeOperationCorrectSnapshots(
  history: SessionHistoryEntry[],
  maxSessions: number,
): Record<MathOperation, OperationCorrectSnapshot> {
  const agg = aggregateOperationStatsFromHistory(history, maxSessions);
  const result = {} as Record<MathOperation, OperationCorrectSnapshot>;
  for (const op of ALL_OPS) {
    const s = agg[op];
    if (!s || s.attempted === 0) {
      result[op] = { correctPercent: null, attempted: 0 };
    } else {
      result[op] = {
        correctPercent: Math.round(((s.attempted - s.wrong) / s.attempted) * 100),
        attempted: s.attempted,
      };
    }
  }
  return result;
}

/**
 * If recent misses cluster on one enabled operation, suggest focused practice.
 */
export function computeAdaptationSuggestion(
  history: SessionHistoryEntry[],
  enabledOperations: MathOperation[],
): AdaptationSuggestion | null {
  if (enabledOperations.length === 0) return null;
  const agg = aggregateOperationStatsFromHistory(history, ADAPTATION_SESSION_WINDOW);
  let best: AdaptationSuggestion | null = null;

  for (const op of enabledOperations) {
    const s = agg[op];
    if (!s || s.attempted < ADAPTATION_MIN_ATTEMPTS) continue;
    const wrongRate = s.wrong / s.attempted;
    if (s.wrong < ADAPTATION_MIN_WRONG || wrongRate < ADAPTATION_WRONG_RATE) continue;

    if (
      !best ||
      s.wrong > best.wrong ||
      (s.wrong === best.wrong && wrongRate > best.wrongRate)
    ) {
      best = {
        operation: op,
        wrong: s.wrong,
        attempted: s.attempted,
        wrongRate,
      };
    }
  }
  return best;
}
