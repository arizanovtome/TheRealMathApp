/** Update when the in-app privacy policy text changes (store listings should match). */
export const PRIVACY_POLICY_LAST_UPDATED = '2026-06-01';

/** Contact for privacy questions. Update before store submission if needed. */
export const PRIVACY_CONTACT_EMAIL = 'support@therealmathapp.com';

export type PrivacyPolicySection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};
