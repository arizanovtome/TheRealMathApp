import type { LogarithmConfig, LogarithmSubtype } from '@/features/logarithm/logarithm.types';
import { DEFAULT_LOGARITHM_CONFIG } from '@/features/logarithm/logarithm.types';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';

function normalizeNumericLog(raw: Record<string, unknown>): boolean {
  if (typeof raw.numericLog === 'boolean') return raw.numericLog;
  const legacyLog10 = raw.numericLog10 !== false;
  const legacyLog2 = raw.numericLog2 !== false;
  return legacyLog10 || legacyLog2;
}

export function normalizeLogarithmConfig(raw: unknown): LogarithmConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_LOGARITHM_CONFIG };
  const r = raw as Record<string, unknown>;
  return {
    enabled: r.enabled === true,
    productRule: r.productRule !== false,
    quotientRule: r.quotientRule !== false,
    powerRule: r.powerRule !== false,
    numericLog: normalizeNumericLog(r),
    numericLn: r.numericLn !== false,
  };
}

export function getEnabledLogarithmSubtypes(config: LogarithmConfig): LogarithmSubtype[] {
  if (!config.enabled) return [];
  const out: LogarithmSubtype[] = [];
  if (config.productRule) out.push('product_rule');
  if (config.quotientRule) out.push('quotient_rule');
  if (config.powerRule) out.push('power_rule');
  if (config.numericLog) out.push('numeric_log');
  if (config.numericLn) out.push('numeric_ln');
  return out;
}

export function hasLogarithmSource(config: MathLearningConfig): boolean {
  return getEnabledLogarithmSubtypes(normalizeLogarithmConfig(config.logarithm)).length > 0;
}
