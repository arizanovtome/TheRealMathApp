import { TRIG_RATIO_LABELS } from '@/features/trigonometry/trigonometryFormulas';
import type { LearnFormulaTable } from '@/features/learn/learnTopics';

const COMMON_TRIG_ANGLE_VALUES = [
  {
    angle: '30°',
    sin: '1/2',
    cos: '√3/2',
    note: 'Short side is half the hypotenuse.',
  },
  {
    angle: '45°',
    sin: '√2/2',
    cos: '√2/2',
    note: 'Both legs are equal in a 45°-45°-90° triangle.',
  },
  {
    angle: '60°',
    sin: '√3/2',
    cos: '1/2',
    note: 'Complements 30° — swap sine and cosine.',
  },
  {
    angle: '90°',
    sin: '1',
    cos: '0',
    note: 'At a right angle, the opposite side equals the hypotenuse and the adjacent side is zero length along the line.',
  },
] as const;

/** SOH-CAH-TOA table for the Learn trigonometry topic. */
export function buildTrigonometryFormulaTable(): LearnFormulaTable {
  return {
    heading: 'Right-triangle ratios (SOH-CAH-TOA)',
    intro: 'Pick the ratio that matches the sides you know and the side you want to find.',
    rows: [
      {
        shape: 'Sine',
        formula: TRIG_RATIO_LABELS.sin,
        explanation:
          'Use sine when you know or want the opposite side and the hypotenuse relative to angle θ.',
        trigonometryDiagram: {
          thetaCorner: 'bottom_left',
          unknownSide: 'opposite',
        },
      },
      {
        shape: 'Cosine',
        formula: TRIG_RATIO_LABELS.cos,
        explanation:
          'Use cosine when you know or want the adjacent side and the hypotenuse relative to angle θ.',
        trigonometryDiagram: {
          thetaCorner: 'bottom_left',
          unknownSide: 'adjacent',
        },
      },
      {
        shape: 'Tangent',
        formula: TRIG_RATIO_LABELS.tan,
        explanation:
          'Use tangent when you know or want the opposite side and the adjacent side (both legs, no hypotenuse).',
        trigonometryDiagram: {
          thetaCorner: 'bottom_left',
          unknownSide: 'opposite',
        },
      },
      {
        shape: 'Cotangent',
        formula: TRIG_RATIO_LABELS.cot,
        explanation:
          'Use cotangent when you know or want the adjacent side and the opposite side — it is the reciprocal of tangent.',
        trigonometryDiagram: {
          thetaCorner: 'bottom_left',
          unknownSide: 'adjacent',
        },
      },
    ],
  };
}

/** Common exact sin/cos values for special angles. */
export function buildTrigonometryCommonValuesTable(): LearnFormulaTable {
  return {
    heading: 'Common sin & cos values',
    intro:
      'These angles come up often. You do not need to memorize every degree — start with 30°, 45°, 60°, and 90°.',
    rows: COMMON_TRIG_ANGLE_VALUES.map(({ angle, sin, cos, note }) => ({
      shape: angle,
      formula: `sin ${angle} = ${sin}   ·   cos ${angle} = ${cos}`,
      explanation: note,
    })),
  };
}

export function buildTrigonometryFormulaTables(): LearnFormulaTable[] {
  return [buildTrigonometryFormulaTable(), buildTrigonometryCommonValuesTable()];
}
