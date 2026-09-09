import type { TFunction } from 'i18next';

/** Expo Router often reports index routes as `practice/index`, not `practice`. */
export function normalizeStackRouteName(routeName: string): string {
  if (routeName.endsWith('/index')) {
    const base = routeName.slice(0, -'/index'.length);
    return base.length > 0 ? base : 'index';
  }
  return routeName;
}

/** Maps Expo Router stack `route.name` to a readable header title (not raw segments like `learning-plan`). */
export function stackScreenTitle(routeName: string, t: TFunction): string {
  const normalized = normalizeStackRouteName(routeName);

  const known: Record<string, string> = {
    index: t('navigation:home'),
    practice: t('navigation:practice'),
    progress: t('navigation:progress'),
    quiz: t('navigation:quiz'),
    timed: t('navigation:timedRun'),
    'learning-plan': t('navigation:settings'),
    'learning-plan/profile': t('settings:profileDetails'),
    'learning-plan/profile-form': t('settings:profileDetails'),
    'learning-plan/session': t('settings:sessionSettings'),
    'learning-plan/topics': t('settings:topics'),
    'learning-plan/topics/[category]': t('settings:topics'),
    'learning-plan/share': t('settings:sharePlanSection'),
    'learning-plan/import': t('settings:importPlanTitle'),
    result: t('navigation:results'),
    'onboarding/name': t('navigation:profileSetup'),
    'onboarding/age': t('navigation:yourAge'),
    'onboarding/recommended-plan': t('navigation:yourPlan'),
    learn: t('navigation:learn'),
    'learn/[topicId]': t('navigation:learn'),
    'learn/practice': t('navigation:practice'),
    privacy: t('navigation:privacyPolicy'),
    about: t('navigation:about'),
  };

  if (known[normalized]) return known[normalized]!;
  if (known[routeName]) return known[routeName]!;

  return prettifyRouteKey(normalized);
}

function prettifyRouteKey(routeName: string): string {
  const segments = routeName.split('/').filter(Boolean);
  const last = segments[segments.length - 1] ?? routeName;
  const segment = last === 'index' && segments.length > 1 ? segments[segments.length - 2]! : last;

  return segment
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
