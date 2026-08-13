import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import type { ColoredShapeItem, NumberSenseMathQuestion } from '@/features/questions/question.types';
import { buildAnswerOptions } from '@/features/questions/answerOptionsGenerator';
import { i18n } from '@/i18n';
import { pickRandom, randomIntInclusive } from '@/utils/random';
import { getEnabledBasicShapes } from '@/features/shapes/shapeRecognitionConfig.utils';
import { SHAPE_COLORS } from '@/features/shapes/shapeColors';
import { basicShapeLabel } from '@/features/shapes/shapeRecognitionLabels';

function randomColoredShape(shapes: ReturnType<typeof getEnabledBasicShapes>): ColoredShapeItem {
  return { shape: pickRandom(shapes), color: pickRandom([...SHAPE_COLORS]) };
}

export function tryGenerateNumberSenseQuestion(config: MathLearningConfig): Omit<NumberSenseMathQuestion, 'id'> | null {
  const n = config.numberSense;
  const shapes = getEnabledBasicShapes(config);
  const numericTypes = n.enabled ? (['beforeAfter','missingNumber','oddEven'] as const).filter(k => n[k]) : [];
  const visualTypes = config.shapeRecognition.enabled && shapes.length > 0 ? (['countObjects','compareQuantities'] as const).filter(k => n[k]) : [];
  const types = [...numericTypes, ...visualTypes];
  if (!types.length) return null;
  const subtype = pickRandom(types);
  const max = n.maxNumber;
  let questionText = '';
  let correctAnswer: string | number = 0;
  if (subtype === 'countObjects') {
    const target = randomColoredShape(shapes);
    correctAnswer = randomIntInclusive(1, 6);
    const distractorCount = randomIntInclusive(2, 4);
    const countingShapes: ColoredShapeItem[] = Array.from({ length: Number(correctAnswer) }, () => ({ ...target }));
    while (countingShapes.length < Number(correctAnswer) + distractorCount) {
      const candidate = randomColoredShape(shapes);
      if (candidate.shape !== target.shape || candidate.color !== target.color) countingShapes.push(candidate);
    }
    countingShapes.sort(() => (Math.random() > 0.5 ? 1 : -1));
    const targetLabel = `${i18n.t(`common:colors.${target.color}`)} ${basicShapeLabel(target.shape, i18n.t.bind(i18n))}`;
    questionText = i18n.t('questions:howManyNamedShapes', { target: targetLabel.toLocaleLowerCase() });
    return {
      kind: 'number_sense',
      operation: 'number_sense',
      subtype,
      questionText,
      correctAnswer: String(correctAnswer),
      answerOptions: buildAnswerOptions(
        Number(correctAnswer),
        config.answerOptionsCount,
        false,
        { min: 1, max: 10 },
      ).map(String),
      requiresMultipleChoice: true,
      countTarget: target,
      countingShapes,
    };
  } else if (subtype === 'beforeAfter') {
    const value = randomIntInclusive(1, Math.max(1, max - 1));
    const after = Math.random() > 0.5;
    correctAnswer = after ? value + 1 : value - 1;
    questionText = i18n.t(after ? 'questions:whatComesAfter' : 'questions:whatComesBefore', { number: value });
  } else if (subtype === 'missingNumber') {
    const start = randomIntInclusive(0, Math.max(0, max - 3));
    const missing = randomIntInclusive(0, 3);
    correctAnswer = start + missing;
    questionText = `${i18n.t('questions:missingNumber')}\n${[0,1,2,3].map(i => i === missing ? '?' : start + i).join(', ')}`;
  } else if (subtype === 'compareQuantities') {
    const first = randomIntInclusive(1, Math.min(max, 10));
    const second = randomIntInclusive(1, Math.min(max, 10));
    const groupShape = randomColoredShape(shapes);
    correctAnswer = first === second ? i18n.t('common:same') : first > second ? i18n.t('common:groupA') : i18n.t('common:groupB');
    questionText = i18n.t('questions:whichHasMore');
    return { kind: 'number_sense', operation: 'number_sense', subtype, questionText, correctAnswer: String(correctAnswer), answerOptions: [i18n.t('common:groupA'), i18n.t('common:groupB'), i18n.t('common:same')], requiresMultipleChoice: true, quantityShapeGroups: { first: Array.from({ length: first }, () => ({ ...groupShape })), second: Array.from({ length: second }, () => ({ ...groupShape })) } };
  } else {
    const value = randomIntInclusive(0, max);
    correctAnswer = i18n.t(value % 2 === 0 ? 'common:even' : 'common:odd');
    questionText = i18n.t('questions:oddOrEven', { number: value });
    return { kind: 'number_sense', operation: 'number_sense', subtype, questionText, correctAnswer: String(correctAnswer), answerOptions: [i18n.t('common:even'), i18n.t('common:odd')], requiresMultipleChoice: true };
  }
  return { kind: 'number_sense', operation: 'number_sense', subtype, questionText, correctAnswer: String(correctAnswer), answerOptions: buildAnswerOptions(Number(correctAnswer), config.answerOptionsCount, false, { min: 0, max }).map(String), requiresMultipleChoice: true };
}
