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
  const boolOrDefault = (key: keyof CalculusOpConfig): boolean =>
    typeof r[key] === 'boolean' ? (r[key] as boolean) : defaults[key];
  return {
    enabled: boolOrDefault('enabled'),
    powerRule: boolOrDefault('powerRule'),
    constantRule: boolOrDefault('constantRule'),
    simpleSum: boolOrDefault('simpleSum'),
    naturalLogRule: boolOrDefault('naturalLogRule'),
    trigRule: boolOrDefault('trigRule'),
    quotientRule: boolOrDefault('quotientRule'),
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
