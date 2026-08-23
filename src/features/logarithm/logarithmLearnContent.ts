import type { LearnFormulaTable } from '@/features/learn/learnTopics';

/** Log rules and natural-log reference for the Learn logarithm topic. */
export function buildLogarithmFormulaTables(): LearnFormulaTable[] {
  return [
    {
      heading: 'Log rules',
      intro: 'Use these to rewrite logarithms without calculating a decimal.',
      rows: [
        {
          shape: 'Product',
          formula: 'log(ab) = log a + log b',
          explanation: 'The log of a product is the sum of the logs.',
        },
        {
          shape: 'Quotient',
          formula: 'log(a/b) = log a − log b',
          explanation: 'The log of a quotient is the difference of the logs.',
        },
        {
          shape: 'Power',
          formula: 'log(aⁿ) = n log a',
          explanation: 'An exponent in the argument moves in front as a multiplier.',
        },
      ],
    },
    {
      heading: 'The number e and ln',
      intro: 'e ≈ 2.718… is the base of the natural logarithm ln.',
      rows: [
        {
          shape: 'Definition',
          formula: 'ln(e) = 1',
          explanation: 'ln asks: e to what power gives this number?',
        },
        {
          shape: 'Powers of e',
          formula: 'ln(eⁿ) = n',
          explanation: 'Example: ln(e²) = 2 because e² = e × e.',
        },
        {
          shape: 'Derivative',
          formula: "(ln x)' = 1/x",
          explanation: 'The slope of ln x at any point is 1 divided by x.',
        },
        {
          shape: 'Integral',
          formula: '∫(1/x) dx = ln|x| + C',
          explanation: 'This is why the power rule for integration does not work when the exponent is −1.',
        },
      ],
    },
  ];
}
