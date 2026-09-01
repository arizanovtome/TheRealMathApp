import type { BuildInfoKind } from '@/constants/buildInfo';

/** Formats an ISO build stamp for display in the active app locale. */
export function formatBuildStampDate(stampedAt: string, locale: string): string {
  const date = new Date(stampedAt);
  if (Number.isNaN(date.getTime())) return stampedAt;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function isBuildInfoKind(value: unknown): value is BuildInfoKind {
  return value === 'development' || value === 'build' || value === 'update';
}
