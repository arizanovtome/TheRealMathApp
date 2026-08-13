import type { FractionDenominatorMode } from '@/features/learning-plan/learningPlan.types';

export type FractionStackSpec = {
  numerator: number;
  denominator: number;
};

/** Example fraction pairs shown under each denominator-mode option in settings. */
export function getFractionModeExampleGroups(
  mode: FractionDenominatorMode,
): FractionStackSpec[][] {
  switch (mode) {
    case 'same_only':
      return [
        [
          { numerator: 1, denominator: 4 },
          { numerator: 2, denominator: 4 },
        ],
      ];
    case 'different_only':
      return [
        [
          { numerator: 1, denominator: 2 },
          { numerator: 1, denominator: 3 },
        ],
      ];
    case 'mixed':
      return [
        [
          { numerator: 1, denominator: 4 },
          { numerator: 2, denominator: 4 },
        ],
        [
          { numerator: 1, denominator: 2 },
          { numerator: 1, denominator: 3 },
        ],
      ];
  }
}

/** Plain-text fallback for screen readers (matches prior slash notation). */
export function formatFractionModeExampleA11y(
  mode: FractionDenominatorMode,
  operator: string,
): string {
  const slash = (f: FractionStackSpec) => `${f.numerator}/${f.denominator}`;
  const expr = (group: FractionStackSpec[]) =>
    group.map(slash).join(` ${operator} `);

  const groups = getFractionModeExampleGroups(mode);
  return groups.map(expr).join(' or ');
}
