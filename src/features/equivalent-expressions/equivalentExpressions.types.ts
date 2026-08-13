export type EquivalentExpressionSubtype =
  | 'square_of_sum'
  | 'square_of_difference'
  | 'parentheses_after_addition'
  | 'parentheses_after_subtraction'
  | 'distributive_property'
  | 'difference_of_squares'
  | 'factorization';

export type EquivalentExpressionToggleKey =
  | 'squareOfSum'
  | 'squareOfDifference'
  | 'parenthesesAfterAddition'
  | 'parenthesesAfterSubtraction'
  | 'distributiveProperty'
  | 'differenceOfSquares'
  | 'factorization';

export const EQUIVALENT_EXPRESSION_TOGGLES: readonly EquivalentExpressionToggleKey[] = [
  'squareOfSum',
  'squareOfDifference',
  'parenthesesAfterAddition',
  'parenthesesAfterSubtraction',
  'distributiveProperty',
  'differenceOfSquares',
  'factorization',
];
