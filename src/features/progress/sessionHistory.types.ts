import type {
  OperationStatsRollup,
  SessionModeResult,
  TimedRunSummary,
} from '@/features/questions/questionScoring';

export type { TimedRunSummary };

export type SessionHistoryEntry = {
  completedAt: string;
  scorePercentage: number;
  sessionMode: SessionModeResult;
  totalQuestions: number;
  correctAnswers: number;
  operationStats?: OperationStatsRollup;
  timedRun?: TimedRunSummary;
};

export type SessionHistoryModeFilter = SessionModeResult | 'all';
