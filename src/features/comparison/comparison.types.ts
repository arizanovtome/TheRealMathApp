export type ComparisonSubtype =
  | 'relational'
  | 'expression'
  | 'ordering'
  | 'fraction_vs_decimal'
  | 'percent_vs_fraction'
  | 'fraction_vs_fraction'
  | 'measurement';

export type ComparisonSymbol = '<' | '>' | '=';

export type ComparisonSubtypeToggleKey =
  | 'relational'
  | 'ordering'
  | 'fractionVsDecimal'
  | 'percentVsFraction'
  | 'fractionVsFraction'
  | 'measurementUnitConversion';

export const COMPARISON_SUBTYPE_TOGGLES: {
  key: ComparisonSubtypeToggleKey;
  label: string;
}[] = [
  { key: 'relational', label: 'Relational (<, >, =)' },
  { key: 'ordering', label: 'Ordering' },
  { key: 'fractionVsDecimal', label: 'Fraction vs decimal' },
  { key: 'percentVsFraction', label: 'Percent vs fraction' },
  { key: 'fractionVsFraction', label: 'Fraction vs fraction' },
  { key: 'measurementUnitConversion', label: 'Measurement' },
];
