import type { GeometryMeasure, GeometryShape } from '@/features/geometry/geometry.types';
import { i18n } from '@/i18n';
import type { SupportedLocale } from '@/i18n/types';

export function getGeometryFormExplanation(
  measure: GeometryMeasure,
  shape: GeometryShape,
  locale: SupportedLocale = 'en',
): string {
  const key = `questions:geometryLearn.explanations.${measure}.${shape}`;
  if (!i18n.exists(key, { lng: locale })) {
    return i18n.t('questions:geometryLearn.fallbackExplanation', { lng: locale });
  }
  return i18n.t(key, { lng: locale });
}
