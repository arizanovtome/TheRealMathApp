import type { LearnFormulaTable } from '@/features/learn/learnTopics';

/** Core derivative rules for the Learn differentiation topic. */
export function buildDifferentiationFormulaTables(): LearnFormulaTable[] {
  return [
    {
      heading: 'Quotient rule (division rule)',
      intro:
        'Use when differentiating a ratio of two functions f(x) / g(x). Remember: “Low d-High minus High d-Low, over Low squared.”',
      rows: [
        {
          shape: 'Formula',
          formula: "(f/g)' = (f'g − fg') / g²",
          explanation:
            'Low = denominator g(x). High = numerator f(x). Differentiate the bottom (Low), times the top (High), minus the top times the derivative of the bottom, all over the bottom squared.',
        },
        {
          shape: 'Example',
          formula: "(2x/(x + 3))' = 6/(x + 3)²",
          explanation:
            "f = 2x, g = x + 3 → f' = 2, g' = 1. So (2·(x + 3) − 2x·1) / (x + 3)² = 6 / (x + 3)².",
        },
      ],
    },
    {
      heading: 'Other rules (quick reference)',
      intro: 'Rules used alongside the quotient rule in practice.',
      rows: [
        {
          shape: 'Power',
          formula: "(xⁿ)' = n·xⁿ⁻¹",
          explanation: 'Bring the exponent down, then subtract 1 from the exponent.',
        },
        {
          shape: 'Sine',
          formula: "(sin x)' = cos x",
          explanation: 'The derivative of sine is cosine.',
        },
        {
          shape: 'Cosine',
          formula: "(cos x)' = −sin x",
          explanation: 'The derivative of cosine is negative sine.',
        },
        {
          shape: 'Natural log',
          formula: "(ln x)' = 1/x",
          explanation: 'Special case connected to ∫(1/x) dx.',
        },
      ],
    },
  ];
}
