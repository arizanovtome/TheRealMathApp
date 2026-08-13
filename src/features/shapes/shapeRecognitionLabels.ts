import type { BasicShape } from '@/features/shapes/shapeRecognition.types';
import { basicShapeLabel as shapeLabel } from '@/i18n/labels';
import type { TFunction } from 'i18next';

export function basicShapeLabel(shape: BasicShape, t: TFunction): string {
  return shapeLabel(shape, t);
}
