import type { AnswerOptionsCount } from '@/features/learning-plan/learningPlan.types';
import type {
  TrigDiagramTarget,
  TrigRatio,
  TrigSideRole,
} from '@/features/trigonometry/trigonometry.types';
import { i18n } from '@/i18n';
import { randomIntInclusive } from '@/utils/random';

export const TRIG_RATIO_LABELS: Record<TrigRatio, string> = {
  sin: 'sin θ = opposite / hypotenuse',
  cos: 'cos θ = adjacent / hypotenuse',
  tan: 'tan θ = opposite / adjacent',
  cot: 'cot θ = adjacent / opposite',
};

export const TRIG_SIDE_LABELS: Record<TrigSideRole, string> = {
  opposite: 'Opposite',
  adjacent: 'Adjacent',
  hypotenuse: 'Hypotenuse',
};

const FLIPPED_RATIO_LABELS: Record<TrigRatio, string> = {
  sin: 'sin θ = hypotenuse / opposite',
  cos: 'cos θ = hypotenuse / adjacent',
  tan: 'tan θ = adjacent / opposite',
  cot: 'cot θ = opposite / adjacent',
};

const ALL_FORMULA_LABELS: string[] = [
  ...Object.values(TRIG_RATIO_LABELS),
  ...Object.values(FLIPPED_RATIO_LABELS),
];

const RATIO_SIDE_PARTS: Record<
  TrigRatio,
  { numerator: TrigSideRole; denominator: TrigSideRole }
> = {
  sin: { numerator: 'opposite', denominator: 'hypotenuse' },
  cos: { numerator: 'adjacent', denominator: 'hypotenuse' },
  tan: { numerator: 'opposite', denominator: 'adjacent' },
  cot: { numerator: 'adjacent', denominator: 'opposite' },
};

const ALL_RATIOS: TrigRatio[] = ['sin', 'cos', 'tan', 'cot'];

export function ratioLabel(ratio: TrigRatio): string {
  return TRIG_RATIO_LABELS[ratio];
}

export function formatRatioAngleToken(knownAngleDegrees?: number): string {
  return knownAngleDegrees !== undefined ? `${knownAngleDegrees}°` : 'θ';
}

/** e.g. sin θ = 10 / 11 or sin 33° = 15 / ? using diagram labels; unknown sides show ? */
export function formatNumericRatioLabel(
  ratio: TrigRatio,
  values: Partial<Record<TrigSideRole, number>>,
  unknown: TrigDiagramTarget,
  flipped = false,
  knownAngleDegrees?: number,
): string {
  let { numerator, denominator } = RATIO_SIDE_PARTS[ratio];
  if (flipped) {
    const swap = numerator;
    numerator = denominator;
    denominator = swap;
  }

  const part = (role: TrigSideRole): string => {
    const v = values[role];
    if (v !== undefined) return String(v);
    if (unknown === role) return '?';
    return '?';
  };

  const angle = formatRatioAngleToken(knownAngleDegrees);
  return `${ratio} ${angle} = ${part(numerator)} / ${part(denominator)}`;
}

export function hasDoubleUnknownPlaceholder(label: string): boolean {
  return (label.match(/\?/g) ?? []).length >= 2;
}

export function hasUnknownPlaceholder(label: string): boolean {
  return label.includes('?');
}

function knownSideNumbers(values: Partial<Record<TrigSideRole, number>>): number[] {
  return (['opposite', 'adjacent', 'hypotenuse'] as TrigSideRole[])
    .map((role) => values[role])
    .filter((v): v is number => v !== undefined);
}

function addFindAngleFormulaLabels(
  pool: Set<string>,
  values: Partial<Record<TrigSideRole, number>>,
  knownAngleDegrees?: number,
): void {
  const angle = formatRatioAngleToken(knownAngleDegrees);
  const numbers = knownSideNumbers(values);
  if (numbers.length !== 2) return;

  const [a, b] = numbers;
  for (const ratio of ALL_RATIOS) {
    pool.add(`${ratio} ${angle} = ${a} / ${b}`);
    if (a !== b) {
      pool.add(`${ratio} ${angle} = ${b} / ${a}`);
    }
  }
}

export function buildPickFormulaNumericDistractors(
  correctRatio: TrigRatio,
  values: Partial<Record<TrigSideRole, number>>,
  unknown: TrigDiagramTarget,
  knownAngleDegrees?: number,
): string[] {
  const correct = formatNumericRatioLabel(
    correctRatio,
    values,
    unknown,
    false,
    knownAngleDegrees,
  );
  const pool = new Set<string>();

  if (unknown === 'angle') {
    addFindAngleFormulaLabels(pool, values, knownAngleDegrees);
    pool.delete(correct);
    return [...pool];
  }

  for (const ratio of ALL_RATIOS) {
    pool.add(formatNumericRatioLabel(ratio, values, unknown, false, knownAngleDegrees));
    pool.add(formatNumericRatioLabel(ratio, values, unknown, true, knownAngleDegrees));
  }
  pool.delete(correct);
  return [...pool].filter((label) => !hasDoubleUnknownPlaceholder(label));
}

export function sideLabel(role: TrigSideRole): string {
  const label = i18n.t(`questions:trigSides.${role}`);
  return label.charAt(0).toLocaleUpperCase(i18n.language) + label.slice(1);
}

export function sideLabelLower(role: TrigSideRole): string {
  return role;
}

export function targetLabel(target: TrigDiagramTarget): string {
  return target === 'angle' ? 'angle θ' : sideLabelLower(target);
}

export function normalizeTrigAnswer(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/°/g, 'deg')
    .replace(/θ/g, 'theta')
    .replace(/×/g, '*');
}

function canonicalizeReciprocalLegRatio(value: string): string {
  const match = /^(tan|cot)(theta|\d+deg)=([^/]+)\/([^/]+)$/.exec(value);
  if (!match) return value;
  const [, ratio, angle, numerator, denominator] = match;
  return ratio === 'cot'
    ? `tan${angle}=${denominator}/${numerator}`
    : value;
}

export function trigAnswersMatch(a: string, b: string): boolean {
  return canonicalizeReciprocalLegRatio(normalizeTrigAnswer(a)) ===
    canonicalizeReciprocalLegRatio(normalizeTrigAnswer(b));
}

type LegRatioOptions = {
  tanEnabled: boolean;
  cotEnabled: boolean;
};

/** Which ratio links a known side pair (used when finding θ or picking from two known legs). */
export function ratioForKnownSidePair(known: TrigSideRole[]): TrigRatio | null {
  const set = new Set(known);
  if (set.has('opposite') && set.has('hypotenuse')) return 'sin';
  if (set.has('adjacent') && set.has('hypotenuse')) return 'cos';
  if (set.has('opposite') && set.has('adjacent')) return 'tan';
  return null;
}

/** Which ratio applies when finding `unknown` given the other known side(s). */
export function ratioForUnknownSide(
  unknown: TrigSideRole,
  known: TrigSideRole[],
  legRatios: LegRatioOptions,
): TrigRatio {
  if (unknown === 'opposite') {
    if (legRatios.tanEnabled && known.includes('adjacent') && !known.includes('hypotenuse')) {
      return 'tan';
    }
    return 'sin';
  }
  if (unknown === 'adjacent') {
    if (legRatios.cotEnabled && known.includes('opposite') && !known.includes('hypotenuse')) {
      return 'cot';
    }
    return 'cos';
  }
  return known.includes('opposite') ? 'sin' : 'cos';
}

export function ratioForDiagramTarget(
  unknown: TrigDiagramTarget,
  knownSides: TrigSideRole[],
  legRatios: LegRatioOptions,
): TrigRatio {
  if (unknown === 'angle') {
    const pair = ratioForKnownSidePair(knownSides);
    if (pair) return pair;
    return 'sin';
  }
  return ratioForUnknownSide(unknown, knownSides, legRatios);
}

export function buildTrigMcOptions(
  correct: string,
  distractors: string[],
  count: AnswerOptionsCount,
): string[] {
  const pool = new Set<string>();
  for (const d of distractors) {
    if (!trigAnswersMatch(d, correct) && !hasDoubleUnknownPlaceholder(d)) pool.add(d);
  }
  const options = [correct];
  const available = [...pool];
  const legRatioCounterpart = /^(tan|cot)(\s+.+)$/.exec(correct);
  if (legRatioCounterpart && options.length < count) {
    const [, ratio, remainder] = legRatioCounterpart;
    const counterpart = `${ratio === 'tan' ? 'cot' : 'tan'}${remainder}`;
    const counterpartIndex = available.findIndex(
      (option) => normalizeTrigAnswer(option) === normalizeTrigAnswer(counterpart),
    );
    if (counterpartIndex >= 0) {
      options.push(available.splice(counterpartIndex, 1)[0]!);
    }
  }
  while (options.length < count && available.length > 0) {
    const idx = randomIntInclusive(0, available.length - 1);
    options.push(available.splice(idx, 1)[0]!);
  }
  return options.sort(() => Math.random() - 0.5);
}

export function buildPickFormulaDistractors(correctRatio: TrigRatio): string[] {
  return ALL_FORMULA_LABELS.filter(
    (label) => !trigAnswersMatch(label, TRIG_RATIO_LABELS[correctRatio]),
  );
}

export function buildNameSideDistractors(correct: TrigSideRole): string[] {
  return [
    ...((Object.keys(TRIG_SIDE_LABELS) as TrigSideRole[])
      .filter((role) => role !== correct)
      .map(sideLabel)),
    i18n.t('questions:trigSides.rightAngle'),
  ];
}

const MIN_SIDE_LENGTH = 3;
const MAX_SIDE_LENGTH = 15;

export function randomSideLength(): number {
  return randomIntInclusive(MIN_SIDE_LENGTH, MAX_SIDE_LENGTH);
}

/** Random side lengths that satisfy hypotenuse > each known leg. */
export function randomKnownSideValues(
  knownSides: TrigSideRole[],
): Partial<Record<TrigSideRole, number>> {
  const set = new Set(knownSides);
  const values: Partial<Record<TrigSideRole, number>> = {};
  const hasHypotenuse = set.has('hypotenuse');
  const hasOpposite = set.has('opposite');
  const hasAdjacent = set.has('adjacent');

  if (hasHypotenuse && (hasOpposite || hasAdjacent)) {
    if (hasOpposite) {
      values.opposite = randomIntInclusive(MIN_SIDE_LENGTH, MAX_SIDE_LENGTH - 1);
    }
    if (hasAdjacent) {
      values.adjacent = randomIntInclusive(MIN_SIDE_LENGTH, MAX_SIDE_LENGTH - 1);
    }
    const maxLeg = Math.max(values.opposite ?? 0, values.adjacent ?? 0);
    values.hypotenuse = randomIntInclusive(maxLeg + 1, MAX_SIDE_LENGTH);
    return values;
  }

  if (hasHypotenuse) {
    values.hypotenuse = randomSideLength();
    return values;
  }

  if (hasOpposite) values.opposite = randomSideLength();
  if (hasAdjacent) values.adjacent = randomSideLength();
  return values;
}

export function isValidRightTriangleSideValues(
  values: Partial<Record<TrigSideRole, number>>,
): boolean {
  const { opposite, adjacent, hypotenuse } = values;
  if (hypotenuse !== undefined) {
    if (opposite !== undefined && hypotenuse <= opposite) return false;
    if (adjacent !== undefined && hypotenuse <= adjacent) return false;
  }
  return true;
}

export function randomAngleDegrees(): number {
  return randomIntInclusive(25, 65);
}

export function buildPickFormulaQuestionText(unknown: TrigDiagramTarget): string {
  if (unknown === 'angle') {
    return i18n.t('questions:trigFindAngle');
  }
  return i18n.t(`questions:trigFindSide.${unknown}`);
}
