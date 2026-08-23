export type LogarithmSubtype =
  | 'product_rule'
  | 'quotient_rule'
  | 'power_rule'
  | 'numeric_log'
  | 'numeric_ln';

export type LogarithmConfig = {
  enabled: boolean;
  /** log(ab) = log a + log b */
  productRule: boolean;
  /** log(a/b) = log a − log b */
  quotientRule: boolean;
  /** log(a^n) = n log a */
  powerRule: boolean;
  /** log₂(8), log₃(27), log₅(25), log₁₀(100) — integer answers only */
  numericLog: boolean;
  /** ln(e), ln(e²) style */
  numericLn: boolean;
};

export const DEFAULT_LOGARITHM_CONFIG: LogarithmConfig = {
  enabled: false,
  productRule: true,
  quotientRule: true,
  powerRule: true,
  numericLog: true,
  numericLn: true,
};
