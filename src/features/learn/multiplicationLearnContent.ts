import type { LearnFormulaTable } from '@/features/learn/learnTopics';
import { i18n } from '@/i18n';
import type { SupportedLocale } from '@/i18n/types';

const TABLE_COUNT = 10;

function tLearn(key: string, locale: SupportedLocale, n: number): string {
  return i18n.t(key, { lng: locale, n });
}

function tableForNumber(n: number, locale: SupportedLocale): LearnFormulaTable {
  return {
    heading: tLearn('questions:multiplicationLearn.tableHeading', locale, n),
    intro: tLearn('questions:multiplicationLearn.tableIntro', locale, n),
    rows: Array.from({ length: TABLE_COUNT }, (_, index) => {
      const m = index + 1;
      return {
        shape: '',
        formula: `${n} × ${m} = ${n * m}`,
      };
    }),
  };
}

/** Multiplication tables 1–10 for the Learn multiplication topic. */
export function buildMultiplicationFormulaTables(
  locale: SupportedLocale = 'en',
): LearnFormulaTable[] {
  return Array.from({ length: TABLE_COUNT }, (_, index) => tableForNumber(index + 1, locale));
}
