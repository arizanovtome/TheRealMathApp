import { DEFAULT_PROFILE_NAME, MAX_PROFILE_AGE, MIN_CHILD_AGE } from '@/constants/ageDefaults';
import { i18n } from '@/i18n';
import { ensureLearningConfigShape } from '@/features/learning-plan/learningPlan.utils';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import type { ChildProfile } from '@/features/onboarding/onboarding.types';
import { normalizeSessionHistory } from '@/features/progress/sessionHistory';
import type { SessionHistoryEntry } from '@/features/progress/sessionHistory.types';

export function createProfileId(): string {
  return `profile-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function nextDefaultProfileName(profiles: ChildProfile[]): string {
  const used = new Set(profiles.map((p) => p.profileName.trim().toLowerCase()));
  for (let i = 1; i <= profiles.length + 1; i++) {
    const candidate = i18n.t('common:profileN', { n: i });
    if (!used.has(candidate.toLowerCase())) return candidate;
  }
  return i18n.t('common:profileN', { n: profiles.length + 1 });
}

export function createChildProfile(input: {
  name: string;
  age: number;
  profileName?: string;
  learningConfig?: MathLearningConfig | null;
  sessionHistory?: SessionHistoryEntry[];
}): ChildProfile {
  return {
    id: createProfileId(),
    profileName: input.profileName ?? DEFAULT_PROFILE_NAME,
    name: input.name.trim(),
    age: clampProfileAge(input.age),
    learningConfig: input.learningConfig ?? null,
    sessionHistory: input.sessionHistory ?? [],
  };
}

export function clampProfileAge(age: number): number {
  if (!Number.isFinite(age)) return MIN_CHILD_AGE;
  return Math.min(MAX_PROFILE_AGE, Math.max(MIN_CHILD_AGE, Math.round(age)));
}

export function normalizeChildProfile(raw: unknown): ChildProfile | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === 'string' ? r.name.trim() : '';
  const age =
    typeof r.age === 'number' && Number.isFinite(r.age)
      ? clampProfileAge(r.age)
      : MIN_CHILD_AGE;
  if (!name) return null;

  const profileName =
    typeof r.profileName === 'string' && r.profileName.trim()
      ? r.profileName.trim()
      : DEFAULT_PROFILE_NAME;

  return {
    id: typeof r.id === 'string' && r.id ? r.id : createProfileId(),
    profileName,
    name,
    age,
    learningConfig:
      r.learningConfig && typeof r.learningConfig === 'object'
        ? ensureLearningConfigShape(r.learningConfig as MathLearningConfig)
        : null,
    sessionHistory: normalizeSessionHistory(r.sessionHistory),
  };
}

export function normalizeProfiles(raw: unknown): ChildProfile[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeChildProfile(item))
    .filter((p): p is ChildProfile => p !== null);
}

/** Migrate legacy single-profile persisted state. */
export function migrateLegacyProfileState(persisted: Record<string, unknown>): {
  profiles: ChildProfile[];
  activeProfileId: string | null;
} | null {
  if (Array.isArray(persisted.profiles)) return null;

  const legacyProfile = persisted.childProfile;
  if (!legacyProfile || typeof legacyProfile !== 'object') return null;

  const legacy = legacyProfile as Record<string, unknown>;
  const name = typeof legacy.name === 'string' ? legacy.name.trim() : '';
  const age =
    typeof legacy.age === 'number' && Number.isFinite(legacy.age)
      ? clampProfileAge(legacy.age)
      : MIN_CHILD_AGE;
  if (!name) return null;

  const profile = createChildProfile({
    name,
    age,
    profileName: DEFAULT_PROFILE_NAME,
    learningConfig:
      persisted.learningConfig && typeof persisted.learningConfig === 'object'
        ? ensureLearningConfigShape(persisted.learningConfig as MathLearningConfig)
        : null,
    sessionHistory: normalizeSessionHistory(persisted.sessionHistory),
  });

  return { profiles: [profile], activeProfileId: profile.id };
}
