import type { CalculusOpConfig, CalculusSubtype } from '@/features/calculus/calculus.types';
import {
  DEFAULT_DIFFERENTIATION_CONFIG,
  DEFAULT_INTEGRATION_CONFIG,
} from '@/features/calculus/calculus.types';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';

function normalizeCalculusOpConfig(
  raw: unknown,
  defaults: CalculusOpConfig,
): CalculusOpConfig {
  if (!raw || typeof raw !== 'object') return { ...defaults };
  const r = raw as Record<string, unknown>;
  return {
    enabled: r.enabled === true,
    powerRule: r.powerRule !== false,
    constantRule: r.constantRule !== false,
    simpleSum: r.simpleSum === true,
    naturalLogRule: r.naturalLogRule === true,
    trigRule: r.trigRule === true,
    quotientRule: r.quotientRule === true,
  };
}

export function normalizeDifferentiationConfig(raw: unknown): CalculusOpConfig {
  return normalizeCalculusOpConfig(raw, DEFAULT_DIFFERENTIATION_CONFIG);
}

export function normalizeIntegrationConfig(raw: unknown): CalculusOpConfig {
  return normalizeCalculusOpConfig(raw, DEFAULT_INTEGRATION_CONFIG);
}

export function getEnabledCalculusSubtypes(config: CalculusOpConfig): CalculusSubtype[] {
  if (!config.enabled) return [];
  const out: CalculusSubtype[] = [];
  if (config.powerRule) out.push('power_rule');
  if (config.constantRule) out.push('constant_rule');
  if (config.simpleSum) out.push('simple_sum');
  if (config.naturalLogRule) out.push('natural_log_rule');
  if (config.trigRule) out.push('trig_rule');
  if (config.quotientRule) out.push('quotient_rule');
  return out;
}

export function hasDifferentiationSource(config: MathLearningConfig): boolean {
  return getEnabledCalculusSubtypes(config.differentiation).length > 0;
}

export function hasIntegrationSource(config: MathLearningConfig): boolean {
  return getEnabledCalculusSubtypes(config.integration).length > 0;
}
