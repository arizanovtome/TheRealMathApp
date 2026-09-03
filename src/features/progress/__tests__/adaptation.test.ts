import {
  ADAPTATION_MIN_ATTEMPTS,
  aggregateOperationStatsFromHistory,
  computeAdaptationSuggestion,
  computeOperationCorrectSnapshots,
  hasOperationStatsSnapshots,
} from '@/features/progress/adaptation';
import type { SessionHistoryEntry } from '@/features/progress/sessionHistory.types';

function entry(stats: SessionHistoryEntry['operationStats']): SessionHistoryEntry {
  return {
    completedAt: new Date().toISOString(),
    scorePercentage: 50,
    sessionMode: 'quiz',
    totalQuestions: 10,
    correctAnswers: 5,
    operationStats: stats,
  };
}

describe('computeAdaptationSuggestion', () => {
  it('returns null when no operation stats', () => {
    const history: SessionHistoryEntry[] = [
      {
        completedAt: new Date().toISOString(),
        scorePercentage: 50,
        sessionMode: 'practice',
        totalQuestions: 5,
        correctAnswers: 2,
      },
    ];
    expect(computeAdaptationSuggestion(history, ['multiplication'])).toBe(null);
  });

  it('suggests multiplication when misses cluster there', () => {
    const history: SessionHistoryEntry[] = [
      entry({
        multiplication: { attempted: 5, wrong: 3 },
        addition: { attempted: 5, wrong: 0 },
      }),
    ];
    const s = computeAdaptationSuggestion(history, ['multiplication', 'addition']);
    expect(s?.operation).toBe('multiplication');
    expect(s?.wrong).toBe(3);
  });

  it('does not suggest when wrong rate is below threshold', () => {
    const history: SessionHistoryEntry[] = [
      entry({
        multiplication: { attempted: ADAPTATION_MIN_ATTEMPTS, wrong: 1 },
      }),
    ];
    expect(computeAdaptationSuggestion(history, ['multiplication'])).toBe(null);
  });

  it('aggregates across sessions', () => {
    const history: SessionHistoryEntry[] = [
      entry({ multiplication: { attempted: 2, wrong: 1 } }),
      entry({ multiplication: { attempted: 2, wrong: 1 } }),
    ];
    const agg = aggregateOperationStatsFromHistory(history, 5);
    expect(agg.multiplication).toEqual({ attempted: 4, wrong: 2 });
  });

  it('ignores disabled operations', () => {
    const history: SessionHistoryEntry[] = [
      entry({
        multiplication: { attempted: 5, wrong: 4 },
      }),
    ];
    expect(computeAdaptationSuggestion(history, ['addition'])).toBe(null);
  });
});

describe('computeOperationCorrectSnapshots', () => {
  it('computes percent correct per operation', () => {
    const history: SessionHistoryEntry[] = [
      entry({
        addition: { attempted: 10, wrong: 2 },
        multiplication: { attempted: 4, wrong: 3 },
      }),
    ];
    const snap = computeOperationCorrectSnapshots(history, 5);
    expect(snap.addition.correctPercent).toBe(80);
    expect(snap.addition.attempted).toBe(10);
    expect(snap.multiplication.correctPercent).toBe(25);
    expect(snap.division.correctPercent).toBe(null);
    expect(snap.division.attempted).toBe(0);
    expect(snap.rounding.correctPercent).toBe(null);
    expect(snap.rounding.attempted).toBe(0);
    expect(snap.order_of_operations.correctPercent).toBe(null);
    expect(snap.order_of_operations.attempted).toBe(0);
  });
});

describe('hasOperationStatsSnapshots', () => {
  it('returns false when every topic has zero attempts', () => {
    const snap = computeOperationCorrectSnapshots([], 5);
    expect(hasOperationStatsSnapshots(snap)).toBe(false);
  });

  it('returns true when at least one topic has attempts', () => {
    const snap = computeOperationCorrectSnapshots(
      [entry({ addition: { attempted: 2, wrong: 0 } })],
      5,
    );
    expect(hasOperationStatsSnapshots(snap)).toBe(true);
  });
});
