import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { getEnabledPatternSubtypes } from '@/features/patterns/patternsConfig.utils';
import type { PatternMathQuestion } from '@/features/questions/question.types';
import { i18n } from '@/i18n';
import { pickRandom, randomIntInclusive } from '@/utils/random';
import type { BasicShape } from '@/features/shapes/shapeRecognition.types';
import { basicShapeLabel } from '@/features/shapes/shapeRecognitionLabels';
import { SHAPE_COLORS, type ShapeColor } from '@/features/shapes/shapeColors';
import { getEnabledBasicShapes } from '@/features/shapes/shapeRecognitionConfig.utils';

const VISIBLE_SHAPE_PATTERN_COUNT = 4;

function buildNumericMcOptions(correct: number, count: number): string[] {
  const correctLabel = String(correct);
  const pool = new Set<string>([correctLabel]);
  for (const delta of [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 10, -10]) {
    const v = correct + delta;
    if (Number.isFinite(v)) pool.add(String(v));
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

function buildShapeMcOptions(correct: string, shapes: readonly string[], count: number): string[] {
  const pool = new Set<string>([correct]);
  for (const shape of shapes) {
    pool.add(shape);
  }
  pool.delete(correct);
  const distractors = [...pool];
  const options = [correct];
  while (options.length < count && distractors.length > 0) {
    const idx = randomIntInclusive(0, distractors.length - 1);
    options.push(distractors.splice(idx, 1)[0]!);
  }
  return options.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

function generateArithmeticSequence(config: MathLearningConfig): Omit<PatternMathQuestion, 'id'> {
  const start = randomIntInclusive(1, 20);
  const diff = pickRandom([2, 3, 4, 5, -2, -3]);
  const terms = [
    start,
    start + diff,
    start + diff * 2,
    start + diff * 3,
    start + diff * 4,
  ];
  const correct = terms[4]!;
  const sequenceDisplay = `${terms.slice(0, 4).join(', ')}, ?`;
  return {
    kind: 'pattern',
    operation: 'pattern',
    subtype: 'arithmetic_sequence',
    questionText: i18n.t('questions:whatComesNext'),
    sequenceDisplay,
    correctAnswer: String(correct),
    answerOptions: buildNumericMcOptions(correct, config.answerOptionsCount),
    requiresMultipleChoice: true,
  };
}

function generateGeometricSequence(config: MathLearningConfig): Omit<PatternMathQuestion, 'id'> {
  const start = randomIntInclusive(1, 5);
  const ratio = pickRandom([2, 3]);
  const terms = [
    start,
    start * ratio,
    start * ratio * ratio,
    start * ratio * ratio * ratio,
    start * ratio * ratio * ratio * ratio,
  ];
  const correct = terms[4]!;
  const sequenceDisplay = `${terms.slice(0, 4).join(', ')}, ?`;
  return {
    kind: 'pattern',
    operation: 'pattern',
    subtype: 'geometric_sequence',
    questionText: i18n.t('questions:whatComesNext'),
    sequenceDisplay,
    correctAnswer: String(correct),
    answerOptions: buildNumericMcOptions(correct, config.answerOptionsCount),
    requiresMultipleChoice: true,
  };
}

function generateNumberPattern(config: MathLearningConfig): Omit<PatternMathQuestion, 'id'> {
  const kind = pickRandom(['skip_count', 'alternating'] as const);
  if (kind === 'skip_count') {
    const step = pickRandom([2, 3, 5, 10]);
    const start = randomIntInclusive(1, 12);
    const terms = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
    const correct = terms[4]!;
    return {
      kind: 'pattern',
      operation: 'pattern',
      subtype: 'number_pattern',
      questionText: i18n.t('questions:whatComesNext'),
      sequenceDisplay: `${terms.slice(0, 4).join(', ')}, ?`,
      correctAnswer: String(correct),
      answerOptions: buildNumericMcOptions(correct, config.answerOptionsCount),
      requiresMultipleChoice: true,
    };
  }
  const start = randomIntInclusive(5, 30);
  const terms = [start, start + 3, start + 2, start + 5, start + 4];
  const correct = terms[4]!;
  return {
    kind: 'pattern',
    operation: 'pattern',
    subtype: 'number_pattern',
    questionText: i18n.t('questions:whatComesNext'),
    sequenceDisplay: `${terms.slice(0, 4).join(', ')}, ?`,
    correctAnswer: String(correct),
    answerOptions: buildNumericMcOptions(correct, config.answerOptionsCount),
    requiresMultipleChoice: true,
  };
}

function generateShapePattern(config: MathLearningConfig): Omit<PatternMathQuestion, 'id'> {
  // Repeat a cycle of 2 or 3 shapes; show 4 shapes and ask for the 5th.
  const enabledShapes = getEnabledBasicShapes(config);
  const cycleLength = Math.min(randomIntInclusive(2, 3), enabledShapes.length);
  const chosen = [...enabledShapes].sort(() => (Math.random() > 0.5 ? 1 : -1)).slice(0, cycleLength);
  const sequenceShapes = Array.from(
    { length: VISIBLE_SHAPE_PATTERN_COUNT },
    (_, i) => chosen[i % cycleLength]!,
  );
  const correct = chosen[VISIBLE_SHAPE_PATTERN_COUNT % cycleLength]!;
  const sequenceDisplay = `${sequenceShapes.join(' ')} ?`;
  return {
    kind: 'pattern',
    operation: 'pattern',
    subtype: 'shape_pattern',
    questionText: i18n.t('questions:whatShapeComesNext'),
    sequenceDisplay,
    correctAnswer: correct,
    answerOptions: buildShapeMcOptions(correct, enabledShapes, Math.min(4, enabledShapes.length)),
    requiresMultipleChoice: true,
    sequenceShapes,
  };
}

function generateColoredShapePattern(config: MathLearningConfig): Omit<PatternMathQuestion, 'id'> {
  const enabledShapes = getEnabledBasicShapes(config);
  const cycleLength = randomIntInclusive(2, 3);
  const cycle: { shape: BasicShape; color: ShapeColor }[] = [];
  while (cycle.length < cycleLength) {
    const candidate = {
      shape: pickRandom(enabledShapes),
      color: pickRandom([...SHAPE_COLORS]),
    };
    if (!cycle.some((item) => item.shape === candidate.shape && item.color === candidate.color)) {
      cycle.push(candidate);
    }
  }
  const sequenceColoredShapes = Array.from(
    { length: VISIBLE_SHAPE_PATTERN_COUNT },
    (_, index) => cycle[index % cycleLength]!,
  );
  const label = (item: { shape: BasicShape; color: ShapeColor }) =>
    `${i18n.t(`common:colors.${item.color}`)} ${basicShapeLabel(item.shape, i18n.t.bind(i18n))}`;
  const correctItem = cycle[VISIBLE_SHAPE_PATTERN_COUNT % cycleLength]!;
  const correctAnswer = label(correctItem);
  const candidates = [
    ...cycle,
    ...enabledShapes.map((shape) => ({ shape, color: correctItem.color })),
    ...SHAPE_COLORS.map((color) => ({ shape: correctItem.shape, color })),
    ...SHAPE_COLORS.flatMap((optionColor) =>
      enabledShapes.map((optionShape) => ({ color: optionColor, shape: optionShape })),
    ),
  ];
  const uniqueOptions = candidates
    .map((item) => ({ ...item, label: label(item) }))
    .filter((item, index, all) => all.findIndex((other) => other.label === item.label) === index);
  const correctOption = uniqueOptions.find((item) => item.label === correctAnswer)!;
  const distractors = uniqueOptions
    .filter((item) => item.label !== correctAnswer);
  const coloredShapeAnswerOptions = [
    correctOption,
    ...distractors.slice(0, config.answerOptionsCount - 1),
  ].sort(() => (Math.random() > 0.5 ? 1 : -1));
  return {
    kind: 'pattern',
    operation: 'pattern',
    subtype: 'colored_shape_pattern',
    questionText: i18n.t('questions:whatColorAndShapeComeNext'),
    correctAnswer,
    answerOptions: coloredShapeAnswerOptions.map((item) => item.label),
    requiresMultipleChoice: true,
    sequenceColoredShapes,
    coloredShapeAnswerOptions,
  };
}

export function tryGeneratePatternQuestion(
  config: MathLearningConfig,
): Omit<PatternMathQuestion, 'id'> | null {
  const subtypes = getEnabledPatternSubtypes(config);
  if (subtypes.length === 0) return null;
  const subtype = pickRandom(subtypes);
  switch (subtype) {
    case 'arithmetic_sequence':
      return generateArithmeticSequence(config);
    case 'geometric_sequence':
      return generateGeometricSequence(config);
    case 'number_pattern':
      return generateNumberPattern(config);
    case 'shape_pattern':
      return generateShapePattern(config);
    case 'colored_shape_pattern':
      return generateColoredShapePattern(config);
  }
}
