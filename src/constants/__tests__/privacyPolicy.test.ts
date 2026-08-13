import { i18n } from '@/i18n';
import { getPrivacyPolicySections } from '@/i18n/privacyPolicy';
import {
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_POLICY_LAST_UPDATED,
} from '@/constants/privacyPolicy';

describe('privacyPolicy', () => {
  it('includes required disclosure sections', () => {
    const sections = getPrivacyPolicySections(i18n.t.bind(i18n));
    const titles = sections.map((section) => section.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        i18n.t('privacy:sections.overview.title'),
        i18n.t('privacy:sections.stored.title'),
        i18n.t('privacy:sections.notCollected.title'),
        i18n.t('privacy:sections.children.title'),
        i18n.t('privacy:sections.contact.title'),
      ]),
    );
  });

  it('uses a valid last-updated date', () => {
    expect(PRIVACY_POLICY_LAST_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(PRIVACY_POLICY_LAST_UPDATED))).toBe(false);
  });

  it('includes a contact email in the Contact section', () => {
    expect(PRIVACY_CONTACT_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    const sections = getPrivacyPolicySections(i18n.t.bind(i18n));
    const contact = sections.find(
      (section) => section.title === i18n.t('privacy:sections.contact.title'),
    );
    expect(contact?.paragraphs.join(' ')).toContain(PRIVACY_CONTACT_EMAIL);
  });
});
