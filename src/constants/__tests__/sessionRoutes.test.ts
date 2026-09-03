import { isActiveSessionRoute } from '@/constants/sessionRoutes';

describe('isActiveSessionRoute', () => {
  it.each([
    'practice',
    'practice/index',
    'quiz',
    'quiz/index',
    'timed',
    'timed/index',
    'learn/practice',
  ])('identifies %s as a session', (routeName) => {
    expect(isActiveSessionRoute(routeName)).toBe(true);
  });

  it.each(['index', 'result/index', 'learning-plan/index', 'learn/index'])(
    'keeps the language switch available on %s',
    (routeName) => {
      expect(isActiveSessionRoute(routeName)).toBe(false);
    },
  );
});
