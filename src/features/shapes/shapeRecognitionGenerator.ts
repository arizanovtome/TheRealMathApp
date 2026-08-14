import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { getEnabledBasicShapes } from '@/features/shapes/shapeRecognitionConfig.utils';
import { basicShapeLabel } from '@/features/shapes/shapeRecognitionLabels';
import { BASIC_SHAPES, type BasicShape } from '@/features/shapes/shapeRecognition.types';
import { SHAPE_COLORS, type ShapeColor } from '@/features/shapes/shapeColors';
import type { ShapeRecognitionMathQuestion } from '@/features/questions/question.types';
import { i18n } from '@/i18n';
import { pickRandom, randomIntInclusive } from '@/utils/random';

function labelShape(shape: BasicShape): string {
  return basicShapeLabel(shape, i18n.t.bind(i18n));
}

function labelColor(color: ShapeColor): string {
  return i18n.t(`common:colors.${color}`);
}

function labelColorAndShape(color: ShapeColor, shape: BasicShape): string {
  return i18n.t('common:colorAndShape', {
    color: labelColor(color),
    shape: labelShape(shape).toLocaleLowerCase(i18n.language),
  });
}

function buildShapeMcOptions<T>(
  correctLabel: string,
  values: readonly T[],
  count: number,
  label: (value: T) => string,
): string[] {
  const pool = new Set<string>([correctLabel]);
  for (const value of values) {
    pool.add(label(value));
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

export function tryGenerateShapeRecognitionQuestion(
  config: MathLearningConfig,
): Omit<ShapeRecognitionMathQuestion, 'id'> | null {
  const enabledShapes = getEnabledBasicShapes(config);
  if (
    enabledShapes.length === 0 ||
    (!config.shapeRecognition.shapeQuestions &&
      !config.shapeRecognition.colorQuestions &&
      !config.shapeRecognition.colorAndShapeQuestions)
  ) return null;

  const shape = pickRandom(enabledShapes);
  const color = pickRandom([...SHAPE_COLORS]);
  const enabledSubtypes: ShapeRecognitionMathQuestion['subtype'][] = [];
  if (config.shapeRecognition.shapeQuestions) enabledSubtypes.push('shape');
  if (config.shapeRecognition.colorQuestions) enabledSubtypes.push('color');
  if (config.shapeRecognition.colorAndShapeQuestions) enabledSubtypes.push('color_and_shape');
  const subtype = pickRandom(enabledSubtypes);
  const correctAnswer = subtype === 'color'
    ? labelColor(color)
    : subtype === 'color_and_shape'
      ? labelColorAndShape(color, shape)
      : labelShape(shape);
  const answerOptions = subtype === 'color'
    ? buildShapeMcOptions(correctAnswer, SHAPE_COLORS, config.answerOptionsCount, labelColor)
    : subtype === 'color_and_shape'
      ? buildShapeMcOptions(
          correctAnswer,
          SHAPE_COLORS.flatMap((optionColor) =>
            enabledShapes.map((optionShape) => ({ color: optionColor, shape: optionShape })),
          ),
          config.answerOptionsCount,
          (item) => labelColorAndShape(item.color, item.shape),
        )
      : buildShapeMcOptions(correctAnswer, BASIC_SHAPES, config.answerOptionsCount, labelShape);

  if (!answerOptions.includes(correctAnswer)) return null;

  return {
    kind: 'shape_recognition',
    operation: 'shape_recognition',
    shape,
    color,
    subtype,
    questionText: i18n.t(
      subtype === 'color'
        ? 'common:whatColorIsThisShape'
        : subtype === 'color_and_shape'
          ? 'common:whatColorAndShapeIsThis'
          : 'common:whatShapeIsThis',
    ),
    correctAnswer,
    answerOptions,
    requiresMultipleChoice: true,
  };
}
