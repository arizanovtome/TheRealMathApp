import type { BasicShape } from '@/features/shapes/shapeRecognition.types';
import type { ShapeColor } from '@/features/shapes/shapeColors';
import { basicShapeLabel as shapeLabel } from '@/i18n/labels';
import type { TFunction } from 'i18next';

export function basicShapeLabel(shape: BasicShape, t: TFunction): string {
  return shapeLabel(shape, t);
}

export function colorAndShapeLabel(
  color: ShapeColor,
  shape: BasicShape,
  t: TFunction,
  language: string,
): string {
  const colorKey = language.startsWith('mk') && shape !== 'star'
    ? `common:colorsMasculine.${color}`
    : `common:colors.${color}`;

  return t('common:colorAndShape', {
    color: t(colorKey),
    shape: basicShapeLabel(shape, t).toLocaleLowerCase(language),
  });
}
