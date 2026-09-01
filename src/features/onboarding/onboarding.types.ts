import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import type { SessionHistoryEntry } from '@/features/progress/sessionHistory.types';
import type { MathKnowledgeLevel } from '@/constants/mathKnowledge';

export type ChildProfile = {
  id: string;
  /** Label for switching profiles (defaults to "Profile 1", etc.). */
  profileName: string;
  /** Name shown in greetings and practice feedback. */
  name: string;
  /** Optional; used with math knowledge to suggest a starting plan. */
  age: number | null;
  /** Self-reported comfort with math (1–5); null when not set. */
  mathKnowledgeLevel: MathKnowledgeLevel | null;
  learningConfig: MathLearningConfig | null;
  sessionHistory: SessionHistoryEntry[];
};

/** Personal fields edited in settings (without nested config/history). */
export type ChildProfilePersonal = Pick<
  ChildProfile,
  'id' | 'profileName' | 'name' | 'age' | 'mathKnowledgeLevel'
>;
