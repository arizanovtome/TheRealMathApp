export type AdvancedEquationSubtype =
  | 'multi_step_linear'
  | 'variables_both_sides'
  | 'linear_parentheses'
  | 'factorable_quadratic';

export type AdvancedEquationsConfig = {
  enabled: boolean;
  multiStepLinear: boolean;
  variablesBothSides: boolean;
  linearParentheses: boolean;
  factorableQuadratic: boolean;
};

export const DEFAULT_ADVANCED_EQUATIONS_CONFIG: AdvancedEquationsConfig = {
  enabled: false,
  multiStepLinear: true,
  variablesBothSides: true,
  linearParentheses: true,
  factorableQuadratic: true,
};
