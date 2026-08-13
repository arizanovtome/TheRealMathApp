import { i18n } from '@/i18n';
import { stackScreenTitle } from '@/constants/stackScreenTitles';

describe('stackScreenTitle', () => {
  const t = i18n.t.bind(i18n);

  it('maps known routes to friendly titles', () => {
    expect(stackScreenTitle('learning-plan', t)).toBe('Settings');
    expect(stackScreenTitle('learning-plan/index', t)).toBe('Settings');
    expect(stackScreenTitle('onboarding/recommended-plan', t)).toBe('Your plan');
    expect(stackScreenTitle('practice', t)).toBe('Practice');
    expect(stackScreenTitle('practice/index', t)).toBe('Practice');
    expect(stackScreenTitle('timed', t)).toBe('Timed run');
    expect(stackScreenTitle('timed/index', t)).toBe('Timed run');
    expect(stackScreenTitle('progress', t)).toBe('Recent performance');
    expect(stackScreenTitle('progress/index', t)).toBe('Recent performance');
    expect(stackScreenTitle('learn/index', t)).toBe('Learn');
    expect(stackScreenTitle('learn/[topicId]', t)).toBe('Learn');
    expect(stackScreenTitle('privacy', t)).toBe('Privacy policy');
    expect(stackScreenTitle('privacy/index', t)).toBe('Privacy policy');
  });

  it('uses Macedonian titles when locale is mk', async () => {
    await i18n.changeLanguage('mk');
    const tMk = i18n.t.bind(i18n);
    expect(stackScreenTitle('practice/index', tMk)).toBe('Вежбање');
    expect(stackScreenTitle('learning-plan/index', tMk)).toBe('Поставки');
    await i18n.changeLanguage('en');
  });

  it('prettifies unknown hyphenated routes', () => {
    expect(stackScreenTitle('some-new-screen', t)).toBe('Some New Screen');
  });
});
