import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { tryGenerateShapeRecognitionQuestion } from '@/features/shapes/shapeRecognitionGenerator';
import { colorAndShapeLabel } from '@/features/shapes/shapeRecognitionLabels';
import { i18n } from '@/i18n';

describe('shapeRecognitionGenerator', () => {
  it('generates shape naming questions with MC options', () => {
    const config = getRecommendedLearningPlan(5);
    config.shapeRecognition = {
      enabled: true,
      shapeQuestions: true,
      colorQuestions: false,
      colorAndShapeQuestions: false,
      shapes: {
        circle: true,
        square: true,
        rectangle: true,
        triangle: true,
        star: false,
        oval: false,
      },
    };
    const q = tryGenerateShapeRecognitionQuestion(config);
    expect(q).not.toBeNull();
    expect(q!.questionText).toBe('What shape is this?');
    expect(q!.answerOptions).toContain(q!.correctAnswer);
    expect(['circle', 'square', 'rectangle', 'triangle']).toContain(q!.correctAnswer);
  });

  it('uses disabled shapes as distractors to provide six shape answers', () => {
    const config = getRecommendedLearningPlan(5);
    config.answerOptionsCount = 6;
    config.shapeRecognition = {
      enabled: true,
      shapeQuestions: true,
      colorQuestions: false,
      colorAndShapeQuestions: false,
      shapes: {
        circle: true,
        square: true,
        rectangle: true,
        triangle: true,
        star: true,
        oval: false,
      },
    };

    const q = tryGenerateShapeRecognitionQuestion(config);

    expect(q?.shape).not.toBe('oval');
    expect(q?.answerOptions).toHaveLength(6);
    expect(q?.answerOptions).toContain('oval');
    expect(new Set(q?.answerOptions).size).toBe(6);
  });

  it('returns null when no shapes are enabled', () => {
    const config = getRecommendedLearningPlan(5);
    config.shapeRecognition = {
      enabled: true,
      shapeQuestions: true,
      colorQuestions: false,
      colorAndShapeQuestions: false,
      shapes: {
        circle: false,
        square: false,
        rectangle: false,
        triangle: false,
        star: false,
        oval: false,
      },
    };
    expect(tryGenerateShapeRecognitionQuestion(config)).toBeNull();
  });

  it('generates color recognition questions when selected', () => {
    const config = getRecommendedLearningPlan(5);
    config.shapeRecognition = {
      ...config.shapeRecognition,
      enabled: true,
      shapeQuestions: false,
      colorQuestions: true,
      colorAndShapeQuestions: false,
    };
    const q = tryGenerateShapeRecognitionQuestion(config);
    expect(q?.subtype).toBe('color');
    expect(q?.questionText).toBe('What color is this shape?');
    expect(['red', 'blue', 'green', 'yellow', 'orange', 'purple']).toContain(q?.correctAnswer);
    expect(q?.answerOptions).toContain(q?.correctAnswer);
  });

  it('generates six color answers when six options are selected', () => {
    const config = getRecommendedLearningPlan(5);
    config.answerOptionsCount = 6;
    config.shapeRecognition = {
      ...config.shapeRecognition,
      enabled: true,
      shapeQuestions: false,
      colorQuestions: true,
      colorAndShapeQuestions: false,
    };

    const q = tryGenerateShapeRecognitionQuestion(config);

    expect(q?.answerOptions).toHaveLength(6);
    expect(new Set(q?.answerOptions).size).toBe(6);
    expect(q?.answerOptions).toContain(q?.correctAnswer);
  });

  it('generates combined color-and-shape answers when selected', () => {
    const config = getRecommendedLearningPlan(5);
    config.shapeRecognition = {
      ...config.shapeRecognition,
      enabled: true,
      shapeQuestions: false,
      colorQuestions: false,
      colorAndShapeQuestions: true,
    };
    const q = tryGenerateShapeRecognitionQuestion(config);
    expect(q?.subtype).toBe('color_and_shape');
    expect(q?.questionText).toBe('Which color and shape is this?');
    expect(q?.correctAnswer.split(' ')).toHaveLength(2);
    expect(q?.answerOptions).toContain(q?.correctAnswer);
    expect(new Set(q?.answerOptions).size).toBe(q?.answerOptions.length);
  });

  it('uses masculine Macedonian color adjectives with masculine shape names', async () => {
    try {
      await i18n.changeLanguage('mk');
      const t = i18n.t.bind(i18n);

      expect(colorAndShapeLabel('yellow', 'triangle', t, 'mk')).toBe('жолт триаголник');
      expect(colorAndShapeLabel('blue', 'rectangle', t, 'mk')).toBe('син правоаголник');
      expect(colorAndShapeLabel('red', 'circle', t, 'mk')).toBe('црвен круг');
      expect(colorAndShapeLabel('green', 'square', t, 'mk')).toBe('зелен квадрат');
      expect(colorAndShapeLabel('yellow', 'star', t, 'mk')).toBe('жолта ѕвезда');
    } finally {
      await i18n.changeLanguage('en');
    }
  });
});
