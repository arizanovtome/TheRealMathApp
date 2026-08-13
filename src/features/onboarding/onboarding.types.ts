import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import type { SessionHistoryEntry } from '@/features/progress/sessionHistory.types';

export type ChildProfile = {
  id: string;
  /** Label for switching profiles (defaults to "Profile 1", etc.). */
  profileName: string;
  /** Name shown in greetings and practice feedback. */
  name: string;
  age: number;
  learningConfig: MathLearningConfig | null;
  sessionHistory: SessionHistoryEntry[];
};

/** Personal fields edited in settings (without nested config/history). */
export type ChildProfilePersonal = Pick<
  ChildProfile,
  'id' | 'profileName' | 'name' | 'age'
>;
