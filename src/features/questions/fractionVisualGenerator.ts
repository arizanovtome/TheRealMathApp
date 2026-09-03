import { FRACTION_DENOMINATOR_POOL } from '@/constants/fractions';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { i18n } from '@/i18n';
import { formatFraction, gcd, reduceFraction } from '@/features/questions/fractions';
import type { FractionVisualMathQuestion } from '@/features/questions/question.types';
import { pickRandom, randomIntInclusive } from '@/utils/random';

function buildFractionMcOptions(
  correct: { numerator: number; denominator: number },
  count: number,
): string[] {
  const correctLabel = formatFraction(correct);
  const pool = new Set<string>([correctLabel]);
  const { denominator } = correct;

  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    if (n >= denominator) continue;
    pool.add(formatFraction(reduceFraction({ numerator: n, denominator })));
  }
  if (correct.numerator > 1) {
    pool.add(
      formatFraction(
        reduceFraction({ numerator: correct.numerator - 1, denominator }),
      ),
    );
  }
  if (correct.numerator < denominator - 1) {
    pool.add(
      formatFraction(
        reduceFraction({ numerator: correct.numerator + 1, denominator }),
      ),
    );
  }
  for (const d of FRACTION_DENOMINATOR_POOL) {
    if (d === denominator) continue;
    pool.add(formatFraction(reduceFraction({ numerator: 1, denominator: d })));
    pool.add(formatFraction(reduceFraction({ numerator: d - 1, denominator: d })));
  }

  pool.delete(correctLabel);
  const distractors = [...pool];
  const options = [correctLabel];
  while (options.length < count && distractors.length > 0) {
    const idx = randomIntInclusive(0, distractors.length - 1);
    options.push(distractors.splice(idx, 1)[0]!);
  }
  return options.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export function tryGenerateFractionVisualQuestion(
  config: MathLearningConfig,
): Omit<FractionVisualMathQuestion, 'id'> | null {
  if (!config.fractionVisual.enabled) return null;

  const denominator = pickRandom([...FRACTION_DENOMINATOR_POOL]);
  let numerator = randomIntInclusive(1, denominator - 1);
  const g = gcd(numerator, denominator);
  numerator = numerator / g;
  const denom = denominator / g;

  const shaded = { numerator, denominator: denom };
  const correctAnswer = formatFraction(shaded);
  const answerOptions = buildFractionMcOptions(shaded, config.answerOptionsCount);

  if (!answerOptions.includes(correctAnswer)) {
    return null;
  }

  return {
    kind: 'fraction_visual',
    operation: 'fraction_visual',
    model: pickRandom(['bar', 'circle'] as const),
    shaded,
    questionText: i18n.t('questions:whatFractionShaded'),
    correctAnswer,
    answerOptions,
    requiresMultipleChoice: false,
  };
}
