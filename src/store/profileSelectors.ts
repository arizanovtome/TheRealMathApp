import type { ChildProfile } from '@/features/onboarding/onboarding.types';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import type { SessionHistoryEntry } from '@/features/progress/sessionHistory.types';
import type { AppState } from '@/store/appStore.types';

const EMPTY_SESSION_HISTORY: SessionHistoryEntry[] = [];

export function selectActiveProfile(state: AppState): ChildProfile | null {
  if (!state.activeProfileId) return null;
  return state.profiles.find((p) => p.id === state.activeProfileId) ?? null;
}

export function selectActiveLearningConfig(
  state: AppState,
): MathLearningConfig | null {
  return selectActiveProfile(state)?.learningConfig ?? null;
}

export function selectActiveSessionHistory(
  state: AppState,
): SessionHistoryEntry[] {
  return selectActiveProfile(state)?.sessionHistory ?? EMPTY_SESSION_HISTORY;
}

export function hasCompletedSetup(state: AppState): boolean {
  return state.isOnboardingCompleted && state.profiles.length > 0;
}
