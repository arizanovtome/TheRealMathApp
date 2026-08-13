import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { tryGenerateNumberSenseQuestion } from '@/features/number-sense/numberSenseGenerator';

describe('numberSenseGenerator', () => {
  const types = ['countObjects','beforeAfter','missingNumber','compareQuantities','oddEven'] as const;
  it.each(types)('generates valid %s questions', (enabledType) => {
    const config = getRecommendedLearningPlan(5);
    config.numberSense = { enabled: true, numberRecognition: false, countObjects: false, beforeAfter: false, missingNumber: false, compareQuantities: false, oddEven: false, maxNumber: 10, [enabledType]: true };
    for (let i = 0; i < 20; i++) {
      const q = tryGenerateNumberSenseQuestion(config);
      expect(q?.subtype).toBe(enabledType);
      expect(q?.answerOptions).toContain(q?.correctAnswer);
      expect(new Set(q?.answerOptions).size).toBe(q?.answerOptions.length);
    }
  });

  it('returns null when Numbers is disabled', () => {
    const config = getRecommendedLearningPlan(5);
    config.numberSense.enabled = false;
    config.numberSense.countObjects = false;
    config.numberSense.compareQuantities = false;
    expect(tryGenerateNumberSenseQuestion(config)).toBeNull();
  });

  it('does not generate retired number-recognition questions from legacy settings', () => {
    const config = getRecommendedLearningPlan(5);
    config.numberSense.numberRecognition = true;
    for (let i = 0; i < 100; i++) {
      expect(tryGenerateNumberSenseQuestion(config)?.subtype).not.toBe('numberRecognition');
    }
  });

  it('caps both quantity-comparison groups at 10', () => {
    const config = getRecommendedLearningPlan(8);
    config.shapeRecognition.enabled = true;
    config.numberSense = { enabled: true, numberRecognition: false, countObjects: false, beforeAfter: false, missingNumber: false, compareQuantities: true, oddEven: false, maxNumber: 100 };
    for (let i = 0; i < 100; i++) {
      const q = tryGenerateNumberSenseQuestion(config)!;
      expect(q.quantityShapeGroups?.first.length).toBeGreaterThanOrEqual(1);
      expect(q.quantityShapeGroups?.first.length).toBeLessThanOrEqual(10);
      expect(q.quantityShapeGroups?.second.length).toBeGreaterThanOrEqual(1);
      expect(q.quantityShapeGroups?.second.length).toBeLessThanOrEqual(10);
      const allShapes = [
        ...(q.quantityShapeGroups?.first ?? []),
        ...(q.quantityShapeGroups?.second ?? []),
      ];
      expect(new Set(allShapes.map((item) => `${item.color}-${item.shape}`)).size).toBe(1);
    }
  });

  it('keeps object-counting questions and choices at 10 or below', () => {
    const config = getRecommendedLearningPlan(8);
    config.shapeRecognition.enabled = true;
    config.answerOptionsCount = 6;
    config.numberSense = {
      enabled: true,
      numberRecognition: false,
      countObjects: true,
      beforeAfter: false,
      missingNumber: false,
      compareQuantities: false,
      oddEven: false,
      maxNumber: 100,
    };

    for (let i = 0; i < 100; i++) {
      const q = tryGenerateNumberSenseQuestion(config)!;
      expect(Number(q.correctAnswer)).toBeLessThanOrEqual(10);
      expect(q.answerOptions.every((answer) => Number(answer) <= 10)).toBe(true);
      expect(q.answerOptions.every((answer) => Number(answer) >= 1)).toBe(true);
      expect(q.countTarget).toBeDefined();
      const matches = q.countingShapes?.filter(
        (item) => item.shape === q.countTarget?.shape && item.color === q.countTarget?.color,
      ).length;
      expect(matches).toBe(Number(q.correctAnswer));
    }
  });
});
