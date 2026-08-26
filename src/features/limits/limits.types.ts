export type LimitSubtype =
  | 'direct_substitution'
  | 'factor_and_cancel'
  | 'limits_at_infinity'
  | 'rationalization';

export type LimitsConfig = {
  enabled: boolean;
  directSubstitution: boolean;
  factorAndCancel: boolean;
  limitsAtInfinity: boolean;
  rationalization: boolean;
};

export const DEFAULT_LIMITS_CONFIG: LimitsConfig = {
  enabled: false,
  directSubstitution: true,
  factorAndCancel: true,
  limitsAtInfinity: true,
  rationalization: true,
};
