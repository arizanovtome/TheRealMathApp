import { DEFAULT_GEOMETRY_CONFIG } from '@/features/geometry/geometry.types';
import {
  buildCalculateQuestionText,
  tryGenerateGeometryQuestion,
} from '@/features/geometry/geometryGenerator';
import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { ensureLearningConfigShape, validateLearningConfig } from '@/features/learning-plan/learningPlan.utils';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { isGeometryQuestion } from '@/features/questions/question.types';
import { submittedAnswerIsCorrect } from '@/features/questions/questionScoring';
import { i18n } from '@/i18n';

function geometryConfig(
  overrides: Partial<MathLearningConfig['geometry']> = {},
): MathLearningConfig {
  const base = getRecommendedLearningPlan(12);
  return ensureLearningConfigShape({
    ...base,
    geometry: {
      ...DEFAULT_GEOMETRY_CONFIG,
      enabled: true,
      perimeter: {
        enabled: true,
        shapes: {
          ...DEFAULT_GEOMETRY_CONFIG.perimeter.shapes,
          square: true,
          rectangle: true,
          triangle: true,
          circle: true,
        },
      },
      area: {
        enabled: true,
        shapes: {
          ...DEFAULT_GEOMETRY_CONFIG.area.shapes,
          square: true,
          rectangle: true,
          triangle: true,
          circle: true,
          rhombus: true,
          trapezoid: true,
        },
      },
      volume: {
        enabled: true,
        shapes: {
          ...DEFAULT_GEOMETRY_CONFIG.volume.shapes,
          cube: true,
          cuboid: true,
          pyramid: true,
          cone: true,
          cylinder: true,
        },
      },
      questionKinds: { formula: true, calculate: true },
      ...overrides,
    },
  });
}

describe('geometryGenerator', () => {
  it('formats rectangle area questions with locale-aware text', async () => {
    try {
      await i18n.changeLanguage('en');
      expect(
        buildCalculateQuestionText('area', 'rectangle', { length: 6, width: 2 }),
      ).toBe('A rectangle has length 6 cm and width 2 cm. What is its area?');

      await i18n.changeLanguage('mk');
      expect(
        buildCalculateQuestionText('area', 'rectangle', { length: 6, width: 2 }),
      ).toBe(
        'Правоаголник има должина 6 см и ширина 2 см. Која е неговата плоштина?',
      );
    } finally {
      await i18n.changeLanguage('en');
    }
  });

  it('generates formula questions with multiple choices', () => {
    const config = geometryConfig({
      questionKinds: { formula: true, calculate: false },
      perimeter: {
        enabled: true,
        shapes: {
          ...DEFAULT_GEOMETRY_CONFIG.perimeter.shapes,
          square: true,
          rectangle: false,
          triangle: false,
          circle: false,
        },
      },
      area: { enabled: false, shapes: DEFAULT_GEOMETRY_CONFIG.area.shapes },
      volume: { enabled: false, shapes: DEFAULT_GEOMETRY_CONFIG.volume.shapes },
    });
    const q = tryGenerateGeometryQuestion(config);
    expect(q).not.toBeNull();
    expect(q!.subtype).toBe('formula');
    expect(q!.requiresMultipleChoice).toBe(true);
    expect(q!.answerOptions.length).toBeGreaterThanOrEqual(2);
    expect(q!.answerOptions).toContain(q!.correctAnswer);
  });

  it('generates integer calculate questions for a square', () => {
    const config = geometryConfig({
      questionKinds: { formula: false, calculate: true },
      perimeter: {
        enabled: true,
        shapes: {
          ...DEFAULT_GEOMETRY_CONFIG.perimeter.shapes,
          square: true,
          rectangle: false,
          triangle: false,
          circle: false,
        },
      },
      area: { enabled: false, shapes: DEFAULT_GEOMETRY_CONFIG.area.shapes },
      volume: { enabled: false, shapes: DEFAULT_GEOMETRY_CONFIG.volume.shapes },
    });
    for (let i = 0; i < 20; i++) {
      const q = tryGenerateGeometryQuestion(config);
      expect(q).not.toBeNull();
      if (q!.shape === 'square' && q!.subtype === 'calculate') {
        expect(q!.answerKind).toBe('number');
        expect(Number.isInteger(q!.correctAnswer)).toBe(true);
        return;
      }
    }
    throw new Error('expected a square calculate question');
  });

  it('uses pi-form MC for circle calculate questions', () => {
    const config = {
      ...geometryConfig({
        questionKinds: { formula: false, calculate: true },
        perimeter: {
          enabled: true,
          shapes: {
            ...DEFAULT_GEOMETRY_CONFIG.perimeter.shapes,
            square: false,
            rectangle: false,
            triangle: false,
            circle: true,
          },
        },
        area: { enabled: false, shapes: DEFAULT_GEOMETRY_CONFIG.area.shapes },
        volume: { enabled: false, shapes: DEFAULT_GEOMETRY_CONFIG.volume.shapes },
      }),
      answerEntryMode: 'keyboard' as const,
    };
    for (let i = 0; i < 30; i++) {
      const q = tryGenerateGeometryQuestion(config);
      expect(q).not.toBeNull();
      if (q!.shape === 'circle') {
        expect(q!.answerKind).toBe('pi_form');
        expect(q!.requiresMultipleChoice).toBe(true);
        expect(String(q!.correctAnswer)).toMatch(/π$/);
        expect(q!.answerOptions.length).toBeGreaterThanOrEqual(2);
        return;
      }
    }
    throw new Error('expected a circle question');
  });
});

describe('geometry scoring integration', () => {
  it('accepts matching formula and pi-form answers', () => {
    const config = geometryConfig();
    const formulaQ = tryGenerateGeometryQuestion({
      ...config,
      geometry: {
        ...config.geometry,
        questionKinds: { formula: true, calculate: false },
      },
    });
    expect(formulaQ).not.toBeNull();
    expect(
      submittedAnswerIsCorrect(formulaQ!, String(formulaQ!.correctAnswer)),
    ).toBe(true);

    const calcConfig = geometryConfig({
      questionKinds: { formula: false, calculate: true },
      perimeter: {
        enabled: true,
        shapes: {
          ...DEFAULT_GEOMETRY_CONFIG.perimeter.shapes,
          square: true,
          rectangle: false,
          triangle: false,
          circle: false,
        },
      },
      area: { enabled: false, shapes: DEFAULT_GEOMETRY_CONFIG.area.shapes },
      volume: { enabled: false, shapes: DEFAULT_GEOMETRY_CONFIG.volume.shapes },
    });
    const calcQ = tryGenerateGeometryQuestion(calcConfig);
    expect(calcQ).not.toBeNull();
    expect(isGeometryQuestion(calcQ!)).toBe(true);
    if (calcQ!.answerKind === 'number') {
      expect(submittedAnswerIsCorrect(calcQ!, calcQ!.correctAnswer as number)).toBe(
        true,
      );
    }
  });
});

describe('geometry config migration', () => {
  it('adds default geometry block to legacy configs', () => {
    const shaped = ensureLearningConfigShape(getRecommendedLearningPlan(8));
    expect(shaped.geometry.enabled).toBe(false);
    expect(shaped.geometry.questionKinds.formula).toBe(true);
  });

  it('validates geometry when enabled without shapes', () => {
    const config = geometryConfig();
    const invalid = {
      ...config,
      geometry: {
        ...config.geometry,
        perimeter: {
          enabled: true,
          shapes: {
            ...DEFAULT_GEOMETRY_CONFIG.perimeter.shapes,
            square: false,
            rectangle: false,
            triangle: false,
            circle: false,
          },
        },
        area: {
          enabled: false,
          shapes: config.geometry.area.shapes,
        },
        volume: {
          enabled: false,
          shapes: config.geometry.volume.shapes,
        },
      },
    };
    const result = validateLearningConfig(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Geometry'))).toBe(true);
  });
});
