import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import {
  DEFAULT_ADVANCED_EQUATIONS_CONFIG,
  type AdvancedEquationsConfig,
  type AdvancedEquationSubtype,
} from './advancedEquations.types';

export function normalizeAdvancedEquationsConfig(raw: unknown): AdvancedEquationsConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_ADVANCED_EQUATIONS_CONFIG };
  const r = raw as Record<string, unknown>;
  return {
    enabled: r.enabled === true,
    multiStepLinear: r.multiStepLinear !== false,
    variablesBothSides: r.variablesBothSides !== false,
    linearParentheses: r.linearParentheses !== false,
    factorableQuadratic: r.factorableQuadratic !== false,
  };
}

export function getEnabledAdvancedEquationSubtypes(c: AdvancedEquationsConfig): AdvancedEquationSubtype[] {
  if (!c.enabled) return [];
  const out: AdvancedEquationSubtype[] = [];
  if (c.multiStepLinear) out.push('multi_step_linear');
  if (c.variablesBothSides) out.push('variables_both_sides');
  if (c.linearParentheses) out.push('linear_parentheses');
  if (c.factorableQuadratic) out.push('factorable_quadratic');
  return out;
}

export function hasAdvancedEquationsSource(config: MathLearningConfig): boolean {
  return getEnabledAdvancedEquationSubtypes(config.advancedEquations).length > 0;
}
