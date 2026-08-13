import type { TFunction } from 'i18next';

import {
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_POLICY_LAST_UPDATED,
} from '@/constants/privacyPolicy';
import type { PrivacyPolicySection } from '@/constants/privacyPolicy';

export function getPrivacyPolicySections(t: TFunction): PrivacyPolicySection[] {
  return [
    {
      title: t('privacy:sections.overview.title'),
      paragraphs: [t('privacy:sections.overview.p1'), t('privacy:sections.overview.p2')],
    },
    {
      title: t('privacy:sections.stored.title'),
      paragraphs: [t('privacy:sections.stored.p1')],
      bullets: [
        t('privacy:sections.stored.b1'),
        t('privacy:sections.stored.b2'),
        t('privacy:sections.stored.b3'),
        t('privacy:sections.stored.b4'),
        t('privacy:sections.stored.b5'),
      ],
    },
    {
      title: t('privacy:sections.notCollected.title'),
      paragraphs: [t('privacy:sections.notCollected.p1')],
      bullets: [
        t('privacy:sections.notCollected.b1'),
        t('privacy:sections.notCollected.b2'),
        t('privacy:sections.notCollected.b3'),
        t('privacy:sections.notCollected.b4'),
      ],
    },
    {
      title: t('privacy:sections.storage.title'),
      paragraphs: [
        t('privacy:sections.storage.p1'),
        t('privacy:sections.storage.p2'),
        t('privacy:sections.storage.p3'),
      ],
    },
    {
      title: t('privacy:sections.children.title'),
      paragraphs: [
        t('privacy:sections.children.p1'),
        t('privacy:sections.children.p2'),
        t('privacy:sections.children.p3'),
      ],
    },
    {
      title: t('privacy:sections.choices.title'),
      paragraphs: [t('privacy:sections.choices.p1')],
      bullets: [
        t('privacy:sections.choices.b1'),
        t('privacy:sections.choices.b2'),
        t('privacy:sections.choices.b3'),
      ],
    },
    {
      title: t('privacy:sections.changes.title'),
      paragraphs: [t('privacy:sections.changes.p1'), t('privacy:sections.changes.p2')],
    },
    {
      title: t('privacy:sections.contact.title'),
      paragraphs: [t('privacy:sections.contact.p1', { email: PRIVACY_CONTACT_EMAIL })],
    },
  ];
}

export { PRIVACY_CONTACT_EMAIL, PRIVACY_POLICY_LAST_UPDATED };
