import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

export const PERSIST_STORAGE_KEY = 'therealmathapp';

/** Pre-rename persist key — migrated automatically on first launch. */
export const LEGACY_PERSIST_STORAGE_KEY = 'math-kids-app';

export const APP_BUNDLE_ID = 'com.tome.arizanov.TheRealMathApp';

async function migrateLegacyPersistKeyIfNeeded(): Promise<void> {
  const current = await AsyncStorage.getItem(PERSIST_STORAGE_KEY);
  if (current != null) return;

  const legacy = await AsyncStorage.getItem(LEGACY_PERSIST_STORAGE_KEY);
  if (legacy == null) return;

  await AsyncStorage.setItem(PERSIST_STORAGE_KEY, legacy);
  await AsyncStorage.removeItem(LEGACY_PERSIST_STORAGE_KEY);
}

/** AsyncStorage adapter that reads legacy `math-kids-app` data once. */
export function createMigratingPersistStorage(): StateStorage {
  return {
    getItem: async (name) => {
      await migrateLegacyPersistKeyIfNeeded();
      return AsyncStorage.getItem(name);
    },
    setItem: async (name, value) => {
      await AsyncStorage.setItem(name, value);
    },
    removeItem: async (name) => {
      await AsyncStorage.removeItem(name);
    },
  };
}
