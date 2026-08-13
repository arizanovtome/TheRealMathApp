import type { TFunction } from 'i18next';

import type { MathOperation } from '@/features/learning-plan/learningPlan.types';
import type { QuestionStyle } from '@/features/learning-plan/learningPlan.types';
import type { BasicShape } from '@/features/shapes/shapeRecognition.types';
import type { GeometryMeasure, GeometryShape } from '@/features/geometry/geometry.types';
import type { RoundingNearest } from '@/features/learning-plan/learningPlan.types';
import { i18n } from '@/i18n';

export function operationLabel(operation: MathOperation, t: TFunction): string {
  return t(`common:operations.${operation}`);
}

export function questionStyleLabel(style: QuestionStyle, t: TFunction): string {
  return t(`common:questionStyles.${style}`);
}

export function basicShapeLabel(shape: BasicShape, t: TFunction): string {
  return t(`common:shapes.${shape}`);
}

export function positiveFeedbackKey(correctCount: number, totalCount: number): string {
  if (correctCount <= 0) return 'common:keepGoing';
  if (totalCount <= 1) return 'common:youGotIt';

  const pct = (correctCount / totalCount) * 100;
  if (pct <= 15) return 'common:keepGoing';
  if (pct <= 25) return 'common:youGotIt';
  if (pct <= 40) return 'common:wellDone';
  if (pct <= 60) return 'common:greatJob';
  if (pct <= 80) return 'common:niceWork';
  return 'common:amazing';
}

export function positiveFeedbackForCorrectCount(
  correctCount: number,
  totalCount: number,
  t: TFunction,
): string {
  const key = positiveFeedbackKey(correctCount, totalCount).replace('common:', '');
  return t(`common:${key}`);
}

export function localizedShapeLabel(shape: GeometryShape): string {
  return i18n.t(`questions:shapes.${shape}`);
}

export function localizedMeasureLabel(measure: GeometryMeasure): string {
  return i18n.t(`questions:measures.${measure}`);
}

export function roundingUnitLabel(unit: RoundingNearest): string {
  if (unit === 10) return i18n.t('questions:roundingUnits.ten');
  if (unit === 100) return i18n.t('questions:roundingUnits.hundred');
  if (unit === 'whole') return i18n.t('questions:roundingUnits.whole');
  if (unit === 'tenth') return i18n.t('questions:roundingUnits.oneDecimal');
  return i18n.t('questions:roundingUnits.twoDecimals');
}
