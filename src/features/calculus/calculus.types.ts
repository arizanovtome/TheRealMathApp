export type CalculusOpConfig = {
  enabled: boolean;
  /** d/dx(x^n) or ∫ x^n dx */
  powerRule: boolean;
  /** d/dx(c) = 0 or ∫ k dx */
  constantRule: boolean;
  /** Two-term expressions (differentiation sums or integration sums) */
  simpleSum: boolean;
};

export const DEFAULT_DIFFERENTIATION_CONFIG: CalculusOpConfig = {
  enabled: false,
  powerRule: true,
  constantRule: true,
  simpleSum: false,
};

export const DEFAULT_INTEGRATION_CONFIG: CalculusOpConfig = {
  enabled: false,
  powerRule: true,
  constantRule: true,
  simpleSum: false,
};

/** Exponent range for power-rule questions (inclusive). */
export const CALCULUS_POWER_MIN = 2;
export const CALCULUS_POWER_MAX = 5;

/** Coefficient range for k·x^n terms (inclusive). */
export const CALCULUS_COEFFICIENT_MIN = 2;
export const CALCULUS_COEFFICIENT_MAX = 5;

/** Constant value range for d/dx(c) and ∫ k dx (inclusive). */
export const CALCULUS_CONSTANT_MIN = 1;
export const CALCULUS_CONSTANT_MAX = 12;

export type CalculusSubtype = 'power_rule' | 'constant_rule' | 'simple_sum';
