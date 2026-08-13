import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  migrateLegacyProfileState,
  normalizeProfiles,
} from '@/features/onboarding/profile.utils';
import { ensureLearningConfigShape } from '@/features/learning-plan/learningPlan.utils';
import { appendSessionHistory } from '@/features/progress/sessionHistory';
import { resolveInitialLocale } from '@/i18n';
import { DEFAULT_LOCALE } from '@/i18n/types';
import type { AppState } from '@/store/appStore.types';
import {
  createMigratingPersistStorage,
  PERSIST_STORAGE_KEY,
} from '@/store/persistStorage';

function mapProfiles(
  profiles: AppState['profiles'],
  profileId: string,
  updater: (profile: AppState['profiles'][number]) => AppState['profiles'][number],
): AppState['profiles'] {
  return profiles.map((p) => (p.id === profileId ? updater(p) : p));
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      isOnboardingCompleted: false,
      lastSessionResult: null,
      locale: DEFAULT_LOCALE,
      hasChosenLocale: false,

      addProfile: (profile) =>
        set((state) => ({
          profiles: [...state.profiles, profile],
          activeProfileId: profile.id,
        })),

      updateProfile: (profileId, updates) =>
        set((state) => ({
          profiles: mapProfiles(state.profiles, profileId, (p) => ({
            ...p,
            ...updates,
          })),
        })),

      switchProfile: (profileId) => {
        const exists = get().profiles.some((p) => p.id === profileId);
        if (!exists) return;
        set({ activeProfileId: profileId, lastSessionResult: null });
      },

      removeProfile: (profileId) =>
        set((state) => {
          if (state.profiles.length <= 1) return state;
          const profiles = state.profiles.filter((p) => p.id !== profileId);
          const activeProfileId =
            state.activeProfileId === profileId
              ? profiles[0]?.id ?? null
              : state.activeProfileId;
          return { profiles, activeProfileId, lastSessionResult: null };
        }),

      completeOnboarding: () => set({ isOnboardingCompleted: true }),

      setActiveLearningConfig: (config) => {
        const activeProfileId = get().activeProfileId;
        if (!activeProfileId) return;
        const shaped = ensureLearningConfigShape(config);
        set((state) => ({
          profiles: mapProfiles(state.profiles, activeProfileId, (p) => ({
            ...p,
            learningConfig: shaped,
          })),
        }));
      },

      setLastSessionResult: (result) =>
        set((state) => {
          if (!result) {
            return { lastSessionResult: null };
          }
          const activeProfileId = state.activeProfileId;
          if (!activeProfileId) {
            return { lastSessionResult: result };
          }
          return {
            lastSessionResult: result,
            profiles: mapProfiles(state.profiles, activeProfileId, (p) => ({
              ...p,
              sessionHistory: appendSessionHistory(p.sessionHistory, result),
            })),
          };
        }),

      resetOnboarding: () =>
        set({
          profiles: [],
          activeProfileId: null,
          isOnboardingCompleted: false,
          lastSessionResult: null,
        }),

      setLocale: (locale) => set({ locale, hasChosenLocale: true }),
    }),
    {
      name: PERSIST_STORAGE_KEY,
      storage: createJSONStorage(() => createMigratingPersistStorage()),
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        isOnboardingCompleted: state.isOnboardingCompleted,
        locale: state.locale,
        hasChosenLocale: state.hasChosenLocale,
      }),
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...(persistedState as object) } as AppState;
        const persisted = persistedState as Record<string, unknown>;

        const migrated = migrateLegacyProfileState(persisted);
        if (migrated) {
          merged.profiles = migrated.profiles;
          merged.activeProfileId = migrated.activeProfileId;
        } else {
          merged.profiles = normalizeProfiles(persisted.profiles);
          merged.activeProfileId =
            typeof persisted.activeProfileId === 'string'
              ? persisted.activeProfileId
              : merged.profiles[0]?.id ?? null;
        }

        if (
          merged.activeProfileId &&
          !merged.profiles.some((p) => p.id === merged.activeProfileId)
        ) {
          merged.activeProfileId = merged.profiles[0]?.id ?? null;
        }

        merged.locale = resolveInitialLocale(
          typeof persisted.locale === 'string' ? (persisted.locale as AppState['locale']) : undefined,
        );

        merged.hasChosenLocale =
          persisted.hasChosenLocale === true ||
          merged.isOnboardingCompleted ||
          merged.profiles.length > 0;

        return merged;
      },
    },
  ),
);
