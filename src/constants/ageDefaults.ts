/** Age brackets used for recommended learning plans (BRD §10). */
export const MIN_CHILD_AGE = 1;
export const MAX_CHILD_AGE = 12;
/** Upper limit for profile age entry (number input). */
export const MAX_PROFILE_AGE = 150;

export const DEFAULT_PROFILE_NAME = 'Profile 1';

export type AgeBracket = '4-5' | '6-7' | '8-9' | '10-12';

export function getAgeBracket(age: number): AgeBracket {
  if (age <= 5) return '4-5';
  if (age <= 7) return '6-7';
  if (age <= 9) return '8-9';
  return '10-12';
}
