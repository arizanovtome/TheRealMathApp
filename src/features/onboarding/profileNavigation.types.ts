import type { NavigationProp } from 'expo-router/react-navigation';

/** Root stack destinations used after creating a profile. */
export type ProfileCompletionNavigation = NavigationProp<{
  index: undefined;
  'learning-plan/index': { highlightSetup?: 'true' } | undefined;
}>;
