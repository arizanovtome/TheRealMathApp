import type { AnswerOptionsCount } from '@/features/learning-plan/learningPlan.types';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { getEnabledGeometrySources } from '@/features/geometry/geometryConfig.utils';
import {
  formatPiForm,
  getFormulaForShape,
  listFormulasForMeasure,
  measureLabel,
  shapeLabel,
  shapeUsesPiForm,
} from '@/features/geometry/geometryFormulas';
import type {
  GeometryMeasure,
  GeometryShape,
  GeometrySource,
} from '@/features/geometry/geometry.types';
import { buildAnswerOptions } from '@/features/questions/answerOptionsGenerator';
import type { GeometryMathQuestion } from '@/features/questions/question.types';
import { i18n } from '@/i18n';
import { localizedMeasureLabel, localizedShapeLabel } from '@/i18n/labels';
import { pickRandom, randomIntInclusive } from '@/utils/random';

const DIM_MIN = 1;
const DIM_MAX = 10;
const PICK_ATTEMPTS = 200;

let questionIdCounter = 0;

function nextQuestionId(): string {
  questionIdCounter += 1;
  return `geo-${Date.now()}-${questionIdCounter}-${Math.random().toString(16).slice(2)}`;
}

function randDim(): number {
  return randomIntInclusive(DIM_MIN, DIM_MAX);
}

function isValidTriangle(a: number, b: number, c: number): boolean {
  return a + b > c && a + c > b && b + c > a;
}

function pickTriangleSides(): { a: number; b: number; c: number } | null {
  for (let i = 0; i < PICK_ATTEMPTS; i++) {
    const a = randDim();
    const b = randDim();
    const c = randDim();
    if (isValidTriangle(a, b, c)) return { a, b, c };
  }
  return { a: 3, b: 4, c: 5 };
}

function pickEvenProductPair(): { x: number; y: number } {
  for (let i = 0; i < PICK_ATTEMPTS; i++) {
    const x = randDim();
    const y = randDim();
    if ((x * y) % 2 === 0) return { x, y };
  }
  return { x: 2, y: 3 };
}

function pickTrapezoidDims(): { a: number; b: number; h: number } {
  for (let i = 0; i < PICK_ATTEMPTS; i++) {
    const a = randDim();
    const b = randDim();
    const h = randDim();
    if (((a + b) * h) % 2 === 0) return { a, b, h };
  }
  return { a: 2, b: 4, h: 3 };
}

function pickPyramidDims(): { s: number; h: number } {
  for (let i = 0; i < PICK_ATTEMPTS; i++) {
    const s = randDim();
    const h = randDim();
    if ((s * s * h) % 3 === 0) return { s, h };
  }
  return { s: 3, h: 2 };
}

function pickConeDims(): { r: number; h: number } {
  for (let i = 0; i < PICK_ATTEMPTS; i++) {
    const r = randDim();
    const h = randDim();
    if ((r * r * h) % 3 === 0) return { r, h };
  }
  return { r: 3, h: 4 };
}

function pickTriangularPrismDims(): { base: number; height: number; length: number } {
  for (let i = 0; i < PICK_ATTEMPTS; i++) {
    const base = randDim();
    const height = randDim();
    const length = randDim();
    if ((base * height * length) % 2 === 0) return { base, height, length };
  }
  return { base: 2, height: 3, length: 2 };
}

function pickTriangularPyramidDims(): {
  base: number;
  height: number;
  pyramidHeight: number;
} {
  for (let i = 0; i < PICK_ATTEMPTS; i++) {
    const base = randDim();
    const height = randDim();
    const pyramidHeight = randDim();
    if ((base * height * pyramidHeight) % 6 === 0) {
      return { base, height, pyramidHeight };
    }
  }
  return { base: 2, height: 3, pyramidHeight: 2 };
}

function pickRadius(): number {
  return randDim();
}

type CalcResult =
  | { answerKind: 'number'; correctAnswer: number; dimensions: Record<string, number> }
  | { answerKind: 'pi_form'; correctAnswer: string; dimensions: Record<string, number> };

function computeCalculate(
  measure: GeometryMeasure,
  shape: GeometryShape,
): CalcResult | null {
  switch (measure) {
    case 'perimeter': {
      if (shape === 'square') {
        const side = randDim();
        return { answerKind: 'number', correctAnswer: 4 * side, dimensions: { side } };
      }
      if (shape === 'rectangle') {
        const length = randDim();
        const width = randDim();
        return {
          answerKind: 'number',
          correctAnswer: 2 * (length + width),
          dimensions: { length, width },
        };
      }
      if (shape === 'triangle') {
        const sides = pickTriangleSides();
        if (!sides) return null;
        return {
          answerKind: 'number',
          correctAnswer: sides.a + sides.b + sides.c,
          dimensions: sides,
        };
      }
      if (shape === 'circle') {
        const radius = pickRadius();
        return {
          answerKind: 'pi_form',
          correctAnswer: formatPiForm(2 * radius),
          dimensions: { radius },
        };
      }
      if (shape === 'rhombus') {
        const side = randDim();
        return { answerKind: 'number', correctAnswer: 4 * side, dimensions: { side } };
      }
      if (shape === 'kite') {
        const a = randDim();
        const b = randDim();
        return {
          answerKind: 'number',
          correctAnswer: 2 * a + 2 * b,
          dimensions: { a, b },
        };
      }
      if (shape === 'trapezoid') {
        const a = randDim();
        const b = randDim();
        const c = randDim();
        const d = randDim();
        return {
          answerKind: 'number',
          correctAnswer: a + b + c + d,
          dimensions: { a, b, c, d },
        };
      }
      if (shape === 'parallelogram') {
        const a = randDim();
        const b = randDim();
        return {
          answerKind: 'number',
          correctAnswer: 2 * (a + b),
          dimensions: { a, b },
        };
      }
      return null;
    }
    case 'area': {
      if (shape === 'square') {
        const side = randDim();
        return { answerKind: 'number', correctAnswer: side * side, dimensions: { side } };
      }
      if (shape === 'rectangle') {
        const length = randDim();
        const width = randDim();
        return {
          answerKind: 'number',
          correctAnswer: length * width,
          dimensions: { length, width },
        };
      }
      if (shape === 'triangle') {
        const { x: base, y: height } = pickEvenProductPair();
        return {
          answerKind: 'number',
          correctAnswer: (base * height) / 2,
          dimensions: { base, height },
        };
      }
      if (shape === 'circle') {
        const radius = pickRadius();
        return {
          answerKind: 'pi_form',
          correctAnswer: formatPiForm(radius * radius),
          dimensions: { radius },
        };
      }
      if (shape === 'rhombus') {
        const { x: d1, y: d2 } = pickEvenProductPair();
        return {
          answerKind: 'number',
          correctAnswer: (d1 * d2) / 2,
          dimensions: { d1, d2 },
        };
      }
      if (shape === 'kite') {
        const { x: d1, y: d2 } = pickEvenProductPair();
        return {
          answerKind: 'number',
          correctAnswer: (d1 * d2) / 2,
          dimensions: { d1, d2 },
        };
      }
      if (shape === 'trapezoid') {
        const { a, b, h } = pickTrapezoidDims();
        return {
          answerKind: 'number',
          correctAnswer: ((a + b) * h) / 2,
          dimensions: { a, b, h },
        };
      }
      if (shape === 'parallelogram') {
        const base = randDim();
        const height = randDim();
        return {
          answerKind: 'number',
          correctAnswer: base * height,
          dimensions: { base, height },
        };
      }
      return null;
    }
    case 'volume': {
      if (shape === 'cube') {
        const side = randDim();
        return {
          answerKind: 'number',
          correctAnswer: side * side * side,
          dimensions: { side },
        };
      }
      if (shape === 'cuboid') {
        const length = randDim();
        const width = randDim();
        const height = randDim();
        return {
          answerKind: 'number',
          correctAnswer: length * width * height,
          dimensions: { length, width, height },
        };
      }
      if (shape === 'pyramid') {
        const { s, h } = pickPyramidDims();
        return {
          answerKind: 'number',
          correctAnswer: (s * s * h) / 3,
          dimensions: { s, h },
        };
      }
      if (shape === 'cone') {
        const { r, h } = pickConeDims();
        const coeff = (r * r * h) / 3;
        return {
          answerKind: 'pi_form',
          correctAnswer: formatPiForm(coeff),
          dimensions: { r, h },
        };
      }
      if (shape === 'cylinder') {
        const r = pickRadius();
        const h = randDim();
        return {
          answerKind: 'pi_form',
          correctAnswer: formatPiForm(r * r * h),
          dimensions: { r, h },
        };
      }
      if (shape === 'triangular_prism') {
        const { base, height, length } = pickTriangularPrismDims();
        return {
          answerKind: 'number',
          correctAnswer: (base * height * length) / 2,
          dimensions: { base, height, length },
        };
      }
      if (shape === 'triangular_pyramid') {
        const { base, height, pyramidHeight } = pickTriangularPyramidDims();
        return {
          answerKind: 'number',
          correctAnswer: (base * height * pyramidHeight) / 6,
          dimensions: { base, height, pyramidHeight },
        };
      }
      return null;
    }
    default:
      return null;
  }
}

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDimensionsText(
  measure: GeometryMeasure,
  shape: GeometryShape,
  dimensions: Record<string, number>,
): string {
  const t = (key: string, params: Record<string, number | string>) =>
    i18n.t(`questions:geometryDimensions.${key}`, params);

  if (shape === 'square' || shape === 'cube') {
    return t('side', { side: dimensions.side });
  }
  if (shape === 'rectangle') {
    return t('rectangle', { length: dimensions.length, width: dimensions.width });
  }
  if (shape === 'triangle' && measure === 'perimeter') {
    return t('triangleSides', { a: dimensions.a, b: dimensions.b, c: dimensions.c });
  }
  if (shape === 'trapezoid' && measure === 'perimeter') {
    return t('trapezoidSides', {
      a: dimensions.a,
      b: dimensions.b,
      c: dimensions.c,
      d: dimensions.d,
    });
  }
  if (shape === 'triangle' && measure === 'area') {
    return t('baseHeight', { base: dimensions.base, height: dimensions.height });
  }
  if (shape === 'circle' || shape === 'cone' || shape === 'cylinder') {
    const parts = [
      t('radius', { radius: dimensions.r ?? dimensions.radius }),
    ];
    if (dimensions.h !== undefined) {
      parts.push(t('height', { height: dimensions.h }));
    }
    return parts.join(', ');
  }
  if (shape === 'rhombus' && measure === 'perimeter') {
    return t('side', { side: dimensions.side });
  }
  if (shape === 'kite' && measure === 'perimeter') {
    return t('kiteSides', { a: dimensions.a, b: dimensions.b });
  }
  if (shape === 'rhombus' || shape === 'kite') {
    return t('diagonals', { d1: dimensions.d1, d2: dimensions.d2 });
  }
  if (shape === 'parallelogram' && measure === 'perimeter') {
    return t('parallelogramSides', { a: dimensions.a, b: dimensions.b });
  }
  if (shape === 'parallelogram') {
    return t('baseHeight', { base: dimensions.base, height: dimensions.height });
  }
  if (shape === 'trapezoid') {
    return t('trapezoidArea', { a: dimensions.a, b: dimensions.b, height: dimensions.h });
  }
  if (shape === 'cuboid') {
    return t('cuboid', {
      length: dimensions.length,
      width: dimensions.width,
      height: dimensions.height,
    });
  }
  if (shape === 'pyramid') {
    return t('pyramid', { baseSide: dimensions.s, height: dimensions.h });
  }
  if (shape === 'triangular_prism') {
    return t('triangularPrism', {
      base: dimensions.base,
      height: dimensions.height,
      length: dimensions.length,
    });
  }
  if (shape === 'triangular_pyramid') {
    return t('triangularPyramid', {
      base: dimensions.base,
      height: dimensions.height,
      pyramidHeight: dimensions.pyramidHeight,
    });
  }
  return '';
}

export function buildCalculateQuestionText(
  measure: GeometryMeasure,
  shape: GeometryShape,
  dimensions: Record<string, number>,
): string {
  const dimText = formatDimensionsText(measure, shape, dimensions);
  const shapeName = localizedShapeLabel(shape);
  const isMk = i18n.language === 'mk';

  return i18n.t('questions:geometryCalculate', {
    article: isMk ? '' : 'A',
    shape: isMk ? capitalizeFirst(shapeName) : shapeName,
    dimensions: dimText,
    measure: localizedMeasureLabel(measure),
  });
}

function buildFormulaQuestionText(measure: GeometryMeasure, shape: GeometryShape): string {
  return i18n.t('questions:geometryFormula', {
    measure: localizedMeasureLabel(measure),
    shape: localizedShapeLabel(shape),
  });
}

function buildFormulaMcOptions(
  measure: GeometryMeasure,
  correct: string,
  optionCount: AnswerOptionsCount,
): string[] {
  const pool = listFormulasForMeasure(measure)
    .map((f) => f.label)
    .filter((label) => label !== correct);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const wrong = shuffled.slice(0, optionCount - 1);
  const options = [...wrong, correct];
  return options.sort(() => Math.random() - 0.5);
}

function buildPiFormMcOptions(
  correct: string,
  optionCount: AnswerOptionsCount,
): string[] {
  const coeff =
    correct === 'π'
      ? 1
      : Number.parseInt(correct.replace('π', ''), 10);
  const distractors = new Set<string>();
  const offsets = [-3, -2, -1, 1, 2, 3, 4, 5];
  for (const off of offsets) {
    const c = coeff + off;
    if (c > 0) distractors.add(formatPiForm(c));
    if (distractors.size >= optionCount - 1) break;
  }
  distractors.delete(correct);
  const wrong = [...distractors].slice(0, optionCount - 1);
  while (wrong.length < optionCount - 1) {
    const extra = formatPiForm(randomIntInclusive(1, 20));
    if (extra !== correct && !wrong.includes(extra)) wrong.push(extra);
  }
  const options = [...wrong, correct];
  return options.sort(() => Math.random() - 0.5);
}

function buildNumericMcOptions(
  correct: number,
  optionCount: AnswerOptionsCount,
): string[] {
  const nums = buildAnswerOptions(correct, optionCount, false, {
    min: 0,
    max: 1000,
  });
  return nums.map(String);
}

function finalizeGeometryQuestion(
  config: MathLearningConfig,
  draft: Omit<GeometryMathQuestion, 'id'>,
): GeometryMathQuestion | null {
  if (
    draft.requiresMultipleChoice &&
    config.answerEntryMode === 'keyboard' &&
    draft.answerOptions.length < 2
  ) {
    return null;
  }
  if (
    !draft.requiresMultipleChoice &&
    config.answerEntryMode !== 'keyboard' &&
    draft.answerOptions.length < 2
  ) {
    return null;
  }
  return { ...draft, id: nextQuestionId() };
}

function generateFromSource(
  config: MathLearningConfig,
  source: GeometrySource,
): GeometryMathQuestion | null {
  const { measure, shape, subtype } = source;

  if (subtype === 'formula') {
    const formula = getFormulaForShape(measure, shape);
    if (!formula) return null;
    const answerOptions = buildFormulaMcOptions(
      measure,
      formula.label,
      config.answerOptionsCount,
    );
    return finalizeGeometryQuestion(config, {
      kind: 'geometry',
      operation: 'geometry',
      measure,
      shape,
      subtype,
      answerKind: 'formula',
      questionText: buildFormulaQuestionText(measure, shape),
      correctAnswer: formula.label,
      answerOptions,
      requiresMultipleChoice: true,
      dimensions: {},
    });
  }

  const calc = computeCalculate(measure, shape);
  if (!calc) return null;

  const requiresMc =
    shapeUsesPiForm(measure, shape) || config.answerEntryMode !== 'keyboard';

  let answerOptions: string[] = [];
  if (requiresMc) {
    if (calc.answerKind === 'pi_form') {
      answerOptions = buildPiFormMcOptions(
        calc.correctAnswer,
        config.answerOptionsCount,
      );
    } else {
      answerOptions = buildNumericMcOptions(
        calc.correctAnswer,
        config.answerOptionsCount,
      );
    }
  }

  return finalizeGeometryQuestion(config, {
    kind: 'geometry',
    operation: 'geometry',
    measure,
    shape,
    subtype,
    answerKind: calc.answerKind,
    questionText: buildCalculateQuestionText(measure, shape, calc.dimensions),
    correctAnswer: calc.correctAnswer,
    answerOptions,
    requiresMultipleChoice: requiresMc,
    dimensions: calc.dimensions,
  });
}

export function generateGeometryQuestion(
  config: MathLearningConfig,
): GeometryMathQuestion | null {
  const sources = getEnabledGeometrySources(config);
  if (sources.length === 0) return null;
  const source = pickRandom(sources);
  return generateFromSource(config, source);
}

export function tryGenerateGeometryQuestion(
  config: MathLearningConfig,
): GeometryMathQuestion | null {
  const sources = getEnabledGeometrySources(config);
  if (sources.length === 0) return null;
  for (let i = 0; i < 40; i++) {
    const source = pickRandom(sources);
    const q = generateFromSource(config, source);
    if (q) return q;
  }
  return null;
}
