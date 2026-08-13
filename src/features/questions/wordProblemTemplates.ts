import type { MathOperation } from '@/features/learning-plan/learningPlan.types';
import { WORD_PROBLEM_TEMPLATES_MK } from '@/i18n/content/wordProblems/mk';
import { i18n } from '@/i18n';
import type { SupportedLocale } from '@/i18n/types';
import { pickRandom } from '@/utils/random';

type Template = (a: number, b: number, result: number) => string;

const ADDITION_TEMPLATES: Template[] = [
  (a, b, r) => `Mia has ${a} stickers and gets ${b} more. How many stickers does she have now?`,
  (a, b, r) => `There are ${a} birds in a tree. ${b} more land on it. How many birds are there now?`,
  (a, b, _r) => `Sam collected ${a} shells and found ${b} more at the beach. How many shells in all?`,
];

const SUBTRACTION_TEMPLATES: Template[] = [
  (a, b, _r) => `There were ${a} cookies. The kids ate ${b}. How many cookies are left?`,
  (a, b, _r) => `Leo had ${a} marbles and gave away ${b}. How many marbles does Leo have now?`,
  (a, b, _r) => `A bus had ${a} passengers. ${b} got off. How many passengers remain?`,
];

const MULTIPLICATION_TEMPLATES: Template[] = [
  (a, b, _r) => `Each bag has ${b} apples. You have ${a} bags. How many apples in all?`,
  (a, b, _r) => `There are ${a} rows with ${b} stars in each row. How many stars?`,
  (a, b, _r) => `A pack holds ${b} pencils. You buy ${a} packs. How many pencils?`,
];

const DIVISION_TEMPLATES: Template[] = [
  (a, b, _r) => `You share ${a} treats equally among ${b} friends. How many does each friend get?`,
  (a, b, _r) => `${a} stickers are split into ${b} equal groups. How many stickers in each group?`,
  (a, b, _r) => `A teacher has ${a} pencils and puts them in ${b} equal piles. How many in each pile?`,
];

const TEMPLATES_BY_OP: Partial<Record<MathOperation, Template[]>> = {
  addition: ADDITION_TEMPLATES,
  subtraction: SUBTRACTION_TEMPLATES,
  multiplication: MULTIPLICATION_TEMPLATES,
  division: DIVISION_TEMPLATES,
};

export function buildWordProblemText(
  operation: MathOperation,
  a: number,
  b: number,
  result: number,
  locale: SupportedLocale = i18n.language as SupportedLocale,
): string {
  const pool =
    locale === 'mk'
      ? WORD_PROBLEM_TEMPLATES_MK[operation]
      : TEMPLATES_BY_OP[operation];
  if (!pool || pool.length === 0) {
    return `Solve: ${a} ? ${b} = ${result}`.replace('?', operation === 'addition' ? '+' : '…');
  }
  const template = pickRandom(pool);
  return template(a, b, result);
}
