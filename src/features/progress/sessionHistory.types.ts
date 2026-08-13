import type { OperationStatsRollup, SessionModeResult } from '@/features/questions/questionScoring';

export type SessionHistoryEntry = {
  completedAt: string;
  scorePercentage: number;
  sessionMode: SessionModeResult;
  totalQuestions: number;
  correctAnswers: number;
  operationStats?: OperationStatsRollup;
};
