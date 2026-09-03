const SESSION_ROUTE_NAMES = new Set([
  'practice',
  'practice/index',
  'quiz',
  'quiz/index',
  'timed',
  'timed/index',
  'learn/practice',
]);

/** Session questions are generated in the language active when the session starts. */
export function isActiveSessionRoute(routeName: string): boolean {
  return SESSION_ROUTE_NAMES.has(routeName);
}
