import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { tryGenerateShapeRecognitionQuestion } from '@/features/shapes/shapeRecognitionGenerator';

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
    expect(['Circle', 'Square', 'Rectangle', 'Triangle']).toContain(q!.correctAnswer);
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
    expect(['Red', 'Blue', 'Green', 'Yellow']).toContain(q?.correctAnswer);
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
});
