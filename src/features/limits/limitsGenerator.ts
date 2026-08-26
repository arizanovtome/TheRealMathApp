import { buildAnswerOptions } from '@/features/questions/answerOptionsGenerator';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import type { LimitMathQuestion } from '@/features/questions/question.types';
import { randomIntInclusive } from '@/utils/random';
import { i18n } from '@/i18n';
import { getEnabledLimitSubtypes } from './limitsConfig.utils';
import type { LimitSubtype } from './limits.types';

const SUBSCRIPT_DIGITS: Record<string, string> = {
  '-': '₋', '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
};

function formatApproach(approach: number | '∞'): string {
  if (approach === '∞') return approach;
  return String(approach).split('').map((char) => SUBSCRIPT_DIGITS[char] ?? char).join('');
}

function build(
  config: MathLearningConfig,
  subtype: LimitSubtype,
  expression: string,
  approach: number | '∞',
  answer: number | string,
  expressionFraction?: { numerator: string; denominator: string },
  symbolicOptions?: string[],
): Omit<LimitMathQuestion, 'id'> {
  return {
    kind: 'limit',
    operation: 'limits',
    subtype,
    questionText: i18n.t('questions:evaluateLimit', { approach: formatApproach(approach), expression }),
    approach: approach === '∞' ? approach : String(approach),
    expression,
    expressionFraction,
    correctAnswer: String(answer),
    answerOptions: typeof answer === 'number'
      ? buildAnswerOptions(answer, config.answerOptionsCount, true, { min: -100, max: 100 }).map(String)
      : (symbolicOptions ?? [answer]).slice(0, config.answerOptionsCount).sort(() => (Math.random() > 0.5 ? 1 : -1)),
    requiresMultipleChoice: true,
  };
}

function generate(config: MathLearningConfig, subtype: LimitSubtype): Omit<LimitMathQuestion, 'id'> {
  const a = randomIntInclusive(-4, 5) || 2;
  if (subtype === 'direct_substitution') {
    if (randomIntInclusive(0, 1) === 0) {
      const coefficient = randomIntInclusive(1, 4);
      const linear = randomIntInclusive(-5, 5);
      const constant = randomIntInclusive(-6, 6);
      return build(config, subtype, `(${coefficient}x² ${linear < 0 ? '−' : '+'} ${Math.abs(linear)}x ${constant < 0 ? '−' : '+'} ${Math.abs(constant)})`, a, coefficient * a * a + linear * a + constant);
    }
    let denominatorOffset = randomIntInclusive(1, 4);
    if (a + denominatorOffset === 0) denominatorOffset = denominatorOffset === 4 ? 1 : denominatorOffset + 1;
    const numerator = (a + denominatorOffset) * randomIntInclusive(1, 5);
    const denominator = `x + ${denominatorOffset}`;
    return build(config, subtype, `${numerator}/(${denominator})`, a, numerator / (a + denominatorOffset), { numerator: String(numerator), denominator });
  }
  if (subtype === 'limits_at_infinity') {
    if (randomIntInclusive(0, 1) === 0) {
      const denominatorLeading = randomIntInclusive(1, 4);
      const answer = randomIntInclusive(-4, 5) || 2;
      const numeratorLeading = denominatorLeading * answer;
      const numeratorConstant = randomIntInclusive(-6, 6);
      const denominatorConstant = randomIntInclusive(1, 7);
      const numerator = `${numeratorLeading}x² ${numeratorConstant < 0 ? '−' : '+'} ${Math.abs(numeratorConstant)}`;
      const denominator = `${denominatorLeading}x² + ${denominatorConstant}`;
      return build(
        config,
        subtype,
        `(${numerator})/(${denominator})`,
        '∞',
        answer,
        { numerator, denominator },
      );
    }
    const numeratorLeading = randomIntInclusive(1, 6);
    const numeratorConstant = randomIntInclusive(-6, 6);
    const denominatorLeading = randomIntInclusive(1, 5);
    const numerator = `${numeratorLeading}x ${numeratorConstant < 0 ? '−' : '+'} ${Math.abs(numeratorConstant)}`;
    const denominator = `${denominatorLeading}x² + 1`;
    return build(
      config,
      subtype,
      `(${numerator})/(${denominator})`,
      '∞',
      0,
      { numerator, denominator },
    );
  }
  if (subtype === 'rationalization') {
    const root = randomIntInclusive(1, 4);
    const offset = randomIntInclusive(0, 3);
    const approach = root * root - offset;
    const denominator = approach === 0 ? 'x' : `x ${approach < 0 ? '+' : '−'} ${Math.abs(approach)}`;
    const numerator = `√(x + ${offset}) − ${root}`;
    const correct = `1/${2 * root}`;
    const options = [correct, `${2 * root}`, `1/${root}`, '0', `1/${2 * root + 1}`, `${root}`];
    return build(
      config,
      subtype,
      `(${numerator})/(${denominator})`,
      approach,
      correct,
      { numerator, denominator },
      [...new Set(options)],
    );
  }
  const otherRoot = randomIntInclusive(-5, 5);
  const numerator = `x² ${-(a + otherRoot) < 0 ? '−' : '+'} ${Math.abs(a + otherRoot)}x ${a * otherRoot < 0 ? '−' : '+'} ${Math.abs(a * otherRoot)}`;
  const denominator = `x ${a < 0 ? '+' : '−'} ${Math.abs(a)}`;
  return build(
    config,
    subtype,
    `(${numerator})/(${denominator})`,
    a,
    a - otherRoot,
    { numerator, denominator },
  );
}

let subtypeBagSignature = '';
let subtypeBag: LimitSubtype[] = [];

function pickNextSubtype(subtypes: LimitSubtype[]): LimitSubtype {
  const signature = subtypes.join('|');
  if (signature !== subtypeBagSignature || subtypeBag.length === 0) {
    subtypeBagSignature = signature;
    subtypeBag = [...subtypes].sort(() => (Math.random() > 0.5 ? 1 : -1));
  }
  return subtypeBag.pop()!;
}

export function tryGenerateLimitQuestion(config: MathLearningConfig): Omit<LimitMathQuestion, 'id'> | null {
  const subtypes = getEnabledLimitSubtypes(config.limits);
  return subtypes.length ? generate(config, pickNextSubtype(subtypes)) : null;
}
