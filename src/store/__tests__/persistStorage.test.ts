import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createMigratingPersistStorage,
  LEGACY_PERSIST_STORAGE_KEY,
  PERSIST_STORAGE_KEY,
} from '@/store/persistStorage';

describe('persistStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('migrates legacy persist key on first read', async () => {
    await AsyncStorage.setItem(LEGACY_PERSIST_STORAGE_KEY, '{"state":{"profiles":[]}}');

    const storage = createMigratingPersistStorage();
    const value = await storage.getItem(PERSIST_STORAGE_KEY);

    expect(value).toBe('{"state":{"profiles":[]}}');
    expect(await AsyncStorage.getItem(PERSIST_STORAGE_KEY)).toBe(
      '{"state":{"profiles":[]}}',
    );
    expect(await AsyncStorage.getItem(LEGACY_PERSIST_STORAGE_KEY)).toBeNull();
  });

  it('does not overwrite an existing new persist key', async () => {
    await AsyncStorage.setItem(PERSIST_STORAGE_KEY, '{"state":{"profiles":[1]}}');
    await AsyncStorage.setItem(LEGACY_PERSIST_STORAGE_KEY, '{"state":{"profiles":[2]}}');

    const storage = createMigratingPersistStorage();
    const value = await storage.getItem(PERSIST_STORAGE_KEY);

    expect(value).toBe('{"state":{"profiles":[1]}}');
  });
});
