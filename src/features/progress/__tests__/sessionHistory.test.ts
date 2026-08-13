import {
  appendSessionHistory,
  averageScoreRecent,
  computeCurrentStreak,
  localDateKey,
  parseIsoToLocalDateKey,
  previousLocalDateKey,
  recordFromSessionResult,
} from '@/features/progress/sessionHistory';
import type { SessionHistoryEntry } from '@/features/progress/sessionHistory.types';
import type { SessionResult } from '@/features/questions/questionScoring';

function mockResult(partial: Partial<SessionResult>): SessionResult {
  return {
    totalQuestions: 10,
    correctAnswers: 8,
    wrongAnswers: 2,
    scorePercentage: 80,
    sessionMode: 'practice',
    ...partial,
  };
}

describe('appendSessionHistory', () => {
  it('prepends newest and trims length', () => {
    const first = mockResult({ scorePercentage: 70 });
    const second = mockResult({ scorePercentage: 90 });
    let h = appendSessionHistory([], first, 5);
    expect(h).toHaveLength(1);
    expect(h[0]!.scorePercentage).toBe(70);
    h = appendSessionHistory(h, second, 5);
    expect(h[0]!.scorePercentage).toBe(90);
    expect(h[1]!.scorePercentage).toBe(70);
  });
});

describe('computeCurrentStreak', () => {
  it('returns 0 for empty history', () => {
    expect(computeCurrentStreak([])).toBe(0);
  });

  it('counts today only as 1', () => {
    const entries: SessionHistoryEntry[] = [
      {
        completedAt: new Date().toISOString(),
        scorePercentage: 80,
        sessionMode: 'practice',
        totalQuestions: 5,
        correctAnswers: 4,
      },
    ];
    expect(computeCurrentStreak(entries)).toBe(1);
  });

  it('counts consecutive local days', () => {
    const today = new Date();
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    const entries: SessionHistoryEntry[] = [
      {
        completedAt: today.toISOString(),
        scorePercentage: 80,
        sessionMode: 'practice',
        totalQuestions: 5,
        correctAnswers: 4,
      },
      {
        completedAt: y.toISOString(),
        scorePercentage: 70,
        sessionMode: 'quiz',
        totalQuestions: 5,
        correctAnswers: 3,
      },
    ];
    expect(computeCurrentStreak(entries)).toBe(2);
  });

  it('breaks streak when a calendar day is skipped', () => {
    const today = new Date();
    const twoBack = new Date(today);
    twoBack.setDate(twoBack.getDate() - 2);
    const entries: SessionHistoryEntry[] = [
      {
        completedAt: today.toISOString(),
        scorePercentage: 80,
        sessionMode: 'practice',
        totalQuestions: 5,
        correctAnswers: 4,
      },
      {
        completedAt: twoBack.toISOString(),
        scorePercentage: 70,
        sessionMode: 'practice',
        totalQuestions: 5,
        correctAnswers: 3,
      },
    ];
    expect(computeCurrentStreak(entries)).toBe(1);
  });

  it('continues from yesterday when nothing logged today', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(yesterday);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const entries: SessionHistoryEntry[] = [
      {
        completedAt: yesterday.toISOString(),
        scorePercentage: 80,
        sessionMode: 'practice',
        totalQuestions: 5,
        correctAnswers: 4,
      },
      {
        completedAt: dayBefore.toISOString(),
        scorePercentage: 70,
        sessionMode: 'practice',
        totalQuestions: 5,
        correctAnswers: 3,
      },
    ];
    expect(computeCurrentStreak(entries)).toBe(2);
  });
});

describe('averageScoreRecent', () => {
  it('returns null when empty', () => {
    expect(averageScoreRecent([], 10)).toBe(null);
  });

  it('averages the newest slice', () => {
    const history: SessionHistoryEntry[] = [
      { completedAt: 'a', scorePercentage: 100, sessionMode: 'practice', totalQuestions: 1, correctAnswers: 1 },
      { completedAt: 'b', scorePercentage: 0, sessionMode: 'practice', totalQuestions: 1, correctAnswers: 0 },
    ];
    expect(averageScoreRecent(history, 2)).toBe(50);
  });
});

describe('recordFromSessionResult', () => {
  it('maps quiz mode', () => {
    const r = mockResult({ sessionMode: 'quiz', scorePercentage: 60 });
    const e = recordFromSessionResult(r);
    expect(e.sessionMode).toBe('quiz');
    expect(e.scorePercentage).toBe(60);
  });
});

describe('local date helpers', () => {
  it('previousLocalDateKey steps back one day', () => {
    const k = localDateKey(new Date(2026, 4, 9));
    expect(k).toBe('2026-05-09');
    expect(previousLocalDateKey(k)).toBe('2026-05-08');
  });

  it('parseIsoToLocalDateKey matches local calendar', () => {
    const d = new Date(2026, 4, 9, 15, 0, 0);
    expect(parseIsoToLocalDateKey(d.toISOString())).toBe(localDateKey(d));
  });
});
