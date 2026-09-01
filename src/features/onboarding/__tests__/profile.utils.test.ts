import {
  createChildProfile,
  migrateLegacyProfileState,
  nextDefaultProfileName,
} from '@/features/onboarding/profile.utils';

describe('createChildProfile', () => {
  it('stores null math knowledge when not provided', () => {
    const profile = createChildProfile({ name: 'Sam', age: 8 });
    expect(profile.mathKnowledgeLevel).toBeNull();
  });
});

describe('nextDefaultProfileName', () => {
  it('returns Profile 1 for an empty list', () => {
    expect(nextDefaultProfileName([])).toBe('Profile 1');
  });

  it('skips names already in use', () => {
    const profiles = [createChildProfile({ name: 'A', age: 8, profileName: 'Profile 1' })];
    expect(nextDefaultProfileName(profiles)).toBe('Profile 2');
  });
});

describe('migrateLegacyProfileState', () => {
  it('migrates old childProfile and learningConfig into profiles', () => {
    const migrated = migrateLegacyProfileState({
      childProfile: { name: 'Sam', age: 9 },
      sessionHistory: [],
    });
    expect(migrated).not.toBeNull();
    expect(migrated!.profiles).toHaveLength(1);
    expect(migrated!.profiles[0]?.name).toBe('Sam');
    expect(migrated!.profiles[0]?.profileName).toBe('Profile 1');
    expect(migrated!.activeProfileId).toBe(migrated!.profiles[0]?.id);
  });
});
