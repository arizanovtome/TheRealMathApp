import { getPrivacyPolicySections } from '@/i18n/privacyPolicy';
import { i18n, initI18n, normalizeLocale, resolveDeviceLocale } from '@/i18n';
import { DEFAULT_LOCALE } from '@/i18n/types';

describe('i18n', () => {
  beforeAll(async () => {
    await initI18n('en');
  });

  it('normalizes locale codes', () => {
    expect(normalizeLocale('mk-MK')).toBe('mk');
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale(undefined)).toBe(DEFAULT_LOCALE);
  });

  it('resolves device locale fallback to en for unknown codes', () => {
    expect(resolveDeviceLocale()).toBe('en');
  });

  it('translates a home string in English', () => {
    expect(i18n.t('home:greeting', { name: 'Ana' })).toBe('Hi Ana!');
  });

  it('switches to Macedonian', async () => {
    await initI18n('mk');
    expect(i18n.t('home:greeting', { name: 'Ana' })).toBe('Здраво Ana!');
    await initI18n('en');
  });

  it('builds privacy sections with contact email', () => {
    const sections = getPrivacyPolicySections(i18n.t.bind(i18n));
    const contact = sections.find((section) => section.title === i18n.t('privacy:sections.contact.title'));
    expect(contact?.paragraphs.join(' ')).toContain('support@therealmathapp.com');
  });
});
