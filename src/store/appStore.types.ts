import type { ChildProfile } from '@/features/onboarding/onboarding.types';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import type { SessionResult } from '@/features/questions/questionScoring';
import type { SupportedLocale } from '@/i18n/types';

export type AppState = {
  profiles: ChildProfile[];
  activeProfileId: string | null;
  isOnboardingCompleted: boolean;
  lastSessionResult: SessionResult | null;
  locale: SupportedLocale;
  hasChosenLocale: boolean;

  addProfile: (profile: ChildProfile) => void;
  updateProfile: (
    profileId: string,
    updates: Partial<
      Pick<
        ChildProfile,
        'profileName' | 'name' | 'age' | 'mathKnowledgeLevel' | 'learningConfig' | 'sessionHistory'
      >
    >,
  ) => void;
  switchProfile: (profileId: string) => void;
  removeProfile: (profileId: string) => void;
  completeOnboarding: () => void;
  setActiveLearningConfig: (config: MathLearningConfig) => void;
  setLastSessionResult: (result: SessionResult | null) => void;
  resetOnboarding: () => void;
  setLocale: (locale: SupportedLocale) => void;
};
