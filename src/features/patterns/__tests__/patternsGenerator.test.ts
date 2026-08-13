import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import type { AnswerOptionsCount } from '@/features/learning-plan/learningPlan.types';
import { tryGeneratePatternQuestion } from '@/features/patterns/patternsGenerator';

describe('patternsGenerator', () => {
  it('generates arithmetic sequence questions', () => {
    const config = getRecommendedLearningPlan(8);
    config.patterns = {
      enabled: true,
      arithmeticSequence: true,
      geometricSequence: false,
      numberPattern: false,
      shapePattern: false,
      coloredShapePattern: false,
    };
    const q = tryGeneratePatternQuestion(config);
    expect(q).not.toBeNull();
    expect(q!.subtype).toBe('arithmetic_sequence');
    expect(q!.sequenceDisplay).toContain('?');
    expect(q!.answerOptions).toContain(q!.correctAnswer);
  });

  it('generates shape pattern questions', () => {
    const config = getRecommendedLearningPlan(8);
    config.shapeRecognition.enabled = true;
    config.patterns = {
      enabled: true,
      arithmeticSequence: false,
      geometricSequence: false,
      numberPattern: false,
      shapePattern: true,
      coloredShapePattern: false,
    };
    const q = tryGeneratePatternQuestion(config);
    expect(q).not.toBeNull();
    expect(q!.subtype).toBe('shape_pattern');
    expect(q!.sequenceDisplay).toContain('?');
    expect(q!.answerOptions).toContain(q!.correctAnswer);
  });

  it('always offers all four shape icons as answer choices', () => {
    const config = getRecommendedLearningPlan(5);
    config.shapeRecognition.enabled = true;
    config.answerOptionsCount = 2;
    config.patterns = {
      enabled: true,
      arithmeticSequence: false,
      geometricSequence: false,
      numberPattern: false,
      shapePattern: true,
      coloredShapePattern: false,
    };

    for (let i = 0; i < 20; i++) {
      const q = tryGeneratePatternQuestion(config);
      expect(q?.subtype).toBe('shape_pattern');
      expect(q!.answerOptions).toHaveLength(4);
      expect(q!.answerOptions).toContain(q!.correctAnswer);
      expect(new Set(q!.answerOptions).size).toBe(4);
    }
  });

  it('shows four shapes in the sequence before asking for the fifth', () => {
    const config = getRecommendedLearningPlan(8);
    config.shapeRecognition.enabled = true;
    config.patterns = {
      enabled: true,
      arithmeticSequence: false,
      geometricSequence: false,
      numberPattern: false,
      shapePattern: true,
      coloredShapePattern: false,
    };

    for (let i = 0; i < 20; i++) {
      const q = tryGeneratePatternQuestion(config);
      expect(q?.subtype).toBe('shape_pattern');
      const shown = q!.sequenceDisplay!.replace('?', '').trim().split(/\s+/);
      expect(shown).toHaveLength(4);
      expect(q!.sequenceShapes).toHaveLength(4);

      const forms = new Set(shown);
      expect(forms.size).toBeGreaterThanOrEqual(2);
      expect(forms.size).toBeLessThanOrEqual(3);
    }
  });

  it('uses a clear repeating cycle for the fifth shape', () => {
    const config = getRecommendedLearningPlan(8);
    config.shapeRecognition.enabled = true;
    config.patterns = {
      enabled: true,
      arithmeticSequence: false,
      geometricSequence: false,
      numberPattern: false,
      shapePattern: true,
      coloredShapePattern: false,
    };

    for (let i = 0; i < 40; i++) {
      const q = tryGeneratePatternQuestion(config);
      expect(q?.subtype).toBe('shape_pattern');
      const shown = q!.sequenceDisplay!.replace('?', '').trim().split(/\s+/);
      expect(shown).toHaveLength(4);

      let matched = false;
      for (const cycleLength of [2, 3] as const) {
        const cycle = shown.slice(0, cycleLength);
        const repeats = shown.every((shape, index) => shape === cycle[index % cycleLength]);
        if (repeats) {
          expect(q!.correctAnswer).toBe(cycle[4 % cycleLength]);
          matched = true;
          break;
        }
      }
      expect(matched).toBe(true);
    }
  });

  it('generates repeating color-and-shape pattern questions', () => {
    const config = getRecommendedLearningPlan(8);
    config.shapeRecognition.enabled = true;
    config.patterns = {
      enabled: true,
      arithmeticSequence: false,
      geometricSequence: false,
      numberPattern: false,
      shapePattern: false,
      coloredShapePattern: true,
    };
    config.answerOptionsCount = 4;

    const observedCycleLengths = new Set<number>();
    for (let i = 0; i < 100; i++) {
      const q = tryGeneratePatternQuestion(config)!;
      expect(q.subtype).toBe('colored_shape_pattern');
      expect(q.sequenceColoredShapes).toHaveLength(4);

      const sequence = q.sequenceColoredShapes!;
      const cycleLength = sequence[0]?.shape === sequence[2]?.shape
        && sequence[0]?.color === sequence[2]?.color
        ? 2
        : 3;
      observedCycleLengths.add(cycleLength);
      expect(sequence[3]).toEqual(sequence[3 % cycleLength]);

      const expectedNext = sequence[4 % cycleLength]!;
      const expectedLabel = q.coloredShapeAnswerOptions?.find(
        (option) => option.shape === expectedNext.shape && option.color === expectedNext.color,
      )?.label;
      expect(q.correctAnswer).toBe(expectedLabel);
      expect(q.answerOptions).toContain(q.correctAnswer);
      expect(q.coloredShapeAnswerOptions).toHaveLength(q.answerOptions.length);
      expect(q.coloredShapeAnswerOptions?.map((option) => option.label)).toEqual(q.answerOptions);

      const cycleLabels = new Set(sequence.map((item) => `${item.color}-${item.shape}`));
      const optionLabels = new Set(
        q.coloredShapeAnswerOptions?.map((item) => `${item.color}-${item.shape}`),
      );
      for (const cycleLabel of cycleLabels) expect(optionLabels).toContain(cycleLabel);
    }
    expect(observedCycleLengths).toEqual(new Set([2, 3]));
  });

  it.each<AnswerOptionsCount>([2, 3, 4, 5, 6])(
    'provides exactly %i unique color-and-shape answers when configured',
    (answerOptionsCount) => {
      const config = getRecommendedLearningPlan(8);
      config.shapeRecognition.enabled = true;
      config.answerOptionsCount = answerOptionsCount;
      config.patterns = {
        enabled: true,
        arithmeticSequence: false,
        geometricSequence: false,
        numberPattern: false,
        shapePattern: false,
        coloredShapePattern: true,
      };

      for (let i = 0; i < 30; i++) {
        const q = tryGeneratePatternQuestion(config);
        expect(q?.answerOptions).toHaveLength(answerOptionsCount);
        expect(q?.coloredShapeAnswerOptions).toHaveLength(answerOptionsCount);
        expect(q?.answerOptions).toContain(q?.correctAnswer);
        expect(new Set(q?.answerOptions).size).toBe(answerOptionsCount);
      }
    },
  );

  it('uses only shapes selected in the Shapes section', () => {
    const config = getRecommendedLearningPlan(8);
    config.shapeRecognition.enabled = true;
    config.shapeRecognition.shapes = {
      circle: true,
      square: false,
      rectangle: false,
      triangle: false,
      star: true,
      oval: false,
    };
    config.patterns = {
      enabled: false,
      arithmeticSequence: false,
      geometricSequence: false,
      numberPattern: false,
      shapePattern: true,
      coloredShapePattern: false,
    };

    for (let i = 0; i < 30; i++) {
      const q = tryGeneratePatternQuestion(config)!;
      expect(q.sequenceShapes?.every((shape) => shape === 'circle' || shape === 'star')).toBe(true);
      expect(q.answerOptions.every((shape) => shape === 'circle' || shape === 'star')).toBe(true);
    }
  });
});
