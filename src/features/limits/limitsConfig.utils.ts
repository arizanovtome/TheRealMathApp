import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { DEFAULT_LIMITS_CONFIG, type LimitsConfig, type LimitSubtype } from './limits.types';

export function normalizeLimitsConfig(raw: unknown): LimitsConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_LIMITS_CONFIG };
  const r = raw as Record<string, unknown>;
  const directSubstitution = typeof r.directSubstitution === 'boolean'
    ? r.directSubstitution
    : r.polynomialSubstitution !== false || r.rationalSubstitution !== false;
  return {
    enabled: r.enabled === true,
    directSubstitution,
    factorAndCancel: r.factorAndCancel !== false,
    limitsAtInfinity: r.limitsAtInfinity !== false,
    rationalization: r.rationalization !== false,
  };
}

export function getEnabledLimitSubtypes(c: LimitsConfig): LimitSubtype[] {
  if (!c.enabled) return [];
  const out: LimitSubtype[] = [];
  if (c.directSubstitution) out.push('direct_substitution');
  if (c.factorAndCancel) out.push('factor_and_cancel');
  if (c.limitsAtInfinity) out.push('limits_at_infinity');
  if (c.rationalization) out.push('rationalization');
  return out;
}

export function hasLimitsSource(config: MathLearningConfig): boolean {
  return getEnabledLimitSubtypes(config.limits).length > 0;
}
