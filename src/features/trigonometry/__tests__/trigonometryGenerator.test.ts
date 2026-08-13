import { DEFAULT_TRIGONOMETRY_CONFIG } from '@/features/trigonometry/trigonometry.types';
import {
  buildPickFormulaNumericDistractors,
  buildPickFormulaQuestionText,
  formatNumericRatioLabel,
  hasDoubleUnknownPlaceholder,
  hasUnknownPlaceholder,
  isValidRightTriangleSideValues,
  randomKnownSideValues,
  ratioForDiagramTarget,
  ratioLabel,
  trigAnswersMatch,
} from '@/features/trigonometry/trigonometryFormulas';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { tryGenerateTrigonometryQuestion } from '@/features/trigonometry/trigonometryGenerator';
import { submittedAnswerIsCorrect } from '@/features/questions/questionScoring';

function trigConfig(overrides?: Partial<MathLearningConfig['trigonometry']>): MathLearningConfig {
  const base = getRecommendedLearningPlan(12);
  return {
    ...base,
    trigonometry: {
      ...DEFAULT_TRIGONOMETRY_CONFIG,
      enabled: true,
      ...overrides,
    },
    answerEntryMode: 'multiple_choice',
    answerOptionsCount: 4,
  };
}

describe('trigonometryFormulas', () => {
  it('maps unknown opposite with hypotenuse known to sine', () => {
    expect(
      ratioForDiagramTarget('opposite', ['hypotenuse'], {
        tanEnabled: false,
        cotEnabled: false,
      }),
    ).toBe('sin');
    expect(ratioLabel('sin')).toBe('sin θ = opposite / hypotenuse');
  });

  it('maps find angle with opposite and hypotenuse to sine', () => {
    expect(
      ratioForDiagramTarget('angle', ['opposite', 'hypotenuse'], {
        tanEnabled: false,
        cotEnabled: false,
      }),
    ).toBe('sin');
  });

  it('builds short question text from the unknown target', () => {
    expect(buildPickFormulaQuestionText('adjacent')).toBe('Find the adjacent side.');
    expect(buildPickFormulaQuestionText('hypotenuse')).toBe('Find the hypotenuse side.');
    expect(buildPickFormulaQuestionText('angle')).toBe('Find angle θ.');
  });

  it('matches answers with spacing differences', () => {
    expect(
      trigAnswersMatch(
        'sin θ = opposite / hypotenuse',
        'sinθ=opposite/hypotenuse',
      ),
    ).toBe(true);
  });

  it('formats numeric formula labels from diagram values', () => {
    expect(formatNumericRatioLabel('sin', { opposite: 10, hypotenuse: 11 }, 'angle')).toBe(
      'sin θ = 10 / 11',
    );
    expect(formatNumericRatioLabel('sin', { hypotenuse: 11 }, 'opposite')).toBe(
      'sin θ = ? / 11',
    );
    expect(
      formatNumericRatioLabel('sin', { opposite: 15 }, 'hypotenuse', false, 33),
    ).toBe('sin 33° = 15 / ?');
  });

  it('keeps hypotenuse longer than known legs', () => {
    for (let i = 0; i < 50; i++) {
      const values = randomKnownSideValues(['opposite', 'hypotenuse']);
      expect(isValidRightTriangleSideValues(values)).toBe(true);
      expect(values.hypotenuse!).toBeGreaterThan(values.opposite!);
    }
    for (let i = 0; i < 50; i++) {
      const values = randomKnownSideValues(['adjacent', 'hypotenuse']);
      expect(isValidRightTriangleSideValues(values)).toBe(true);
      expect(values.hypotenuse!).toBeGreaterThan(values.adjacent!);
    }
  });

  it('includes enough numeric formula distractors for four options', () => {
    const distractors = buildPickFormulaNumericDistractors(
      'sin',
      { opposite: 10, hypotenuse: 11 },
      'angle',
    );
    expect(distractors.length).toBeGreaterThanOrEqual(3);
    expect(distractors.some((d) => d.includes('11 / 10'))).toBe(true);
    expect(distractors.every((d) => !hasUnknownPlaceholder(d))).toBe(true);
    expect(distractors.every((d) => !d.includes('opposite') && !d.includes('hypotenuse'))).toBe(
      true,
    );
  });

  it('uses only numeric side values for find-angle options', () => {
    const distractors = buildPickFormulaNumericDistractors(
      'cos',
      { adjacent: 8, hypotenuse: 13 },
      'angle',
    );
    expect(distractors.every((d) => !hasUnknownPlaceholder(d))).toBe(true);
    expect(distractors).toContain('sin θ = 8 / 13');
    expect(distractors).toContain('cos θ = 13 / 8');
    expect(distractors).not.toContain('cot θ = ? / 8');
    expect(distractors.length).toBeGreaterThanOrEqual(3);
  });

  it('excludes formula options with two unknown placeholders', () => {
    const distractors = buildPickFormulaNumericDistractors(
      'cos',
      { hypotenuse: 10 },
      'adjacent',
      58,
    );
    expect(distractors.every((d) => !hasDoubleUnknownPlaceholder(d))).toBe(true);
    expect(distractors).not.toContain('tan 58° = ? / ?');
    expect(distractors).not.toContain('cot 58° = ? / ?');
    expect(distractors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('trigonometryGenerator', () => {
  it('generates pick-formula questions with four MC options and labeled diagram', () => {
    const q = tryGenerateTrigonometryQuestion(trigConfig());
    expect(q).not.toBeNull();
    expect(q!.kind).toBe('trigonometry');
    expect(q!.requiresMultipleChoice).toBe(true);
    expect(q!.answerOptions).toHaveLength(4);
    expect(new Set(q!.answerOptions).size).toBe(4);
    expect(q!.answerOptions).toContain(q!.correctAnswer);
    if (q!.subtype === 'pick_formula') {
      expect(q!.questionText).toMatch(/^Find /);
      expect(q!.correctAnswer).toMatch(/(θ|\d+°) =/);
      expect(q!.correctAnswer).not.toMatch(/opposite|hypotenuse|adjacent/);
      expect(q!.answerOptions.every((o) => !hasDoubleUnknownPlaceholder(o))).toBe(true);
      if (q!.diagram.unknown === 'angle') {
        expect(q!.answerOptions.every((o) => !hasUnknownPlaceholder(o))).toBe(true);
      }
      expect(isValidRightTriangleSideValues(q!.diagram.knownValues ?? {})).toBe(true);
      expect(q!.diagram.knownValues || q!.diagram.unknown === 'angle').toBeTruthy();
      if (q!.diagram.unknown !== 'angle') {
        expect(q!.diagram.knownAngleDegrees).toBeGreaterThanOrEqual(25);
        expect(q!.diagram.knownAngleDegrees).toBeLessThanOrEqual(65);
        expect(q!.correctAnswer).toMatch(
          new RegExp(`^(sin|cos|tan|cot) ${q!.diagram.knownAngleDegrees}° =`),
        );
        expect(q!.answerOptions.every((o) => o.includes(`${q!.diagram.knownAngleDegrees}°`))).toBe(
          true,
        );
      } else {
        expect(q!.correctAnswer).toMatch(/θ =/);
      }
    }
  });

  it('generates name-side questions with four options including Right angle', () => {
    const config = trigConfig({
      questionKinds: { pickFormula: false, nameSide: true, findAngle: false },
    });
    for (let i = 0; i < 20; i++) {
      const q = tryGenerateTrigonometryQuestion(config);
      expect(q).not.toBeNull();
      if (q!.subtype === 'name_side') {
        expect(q!.answerOptions).toHaveLength(4);
        expect(q!.answerOptions).toContain('Right angle');
        return;
      }
    }
    throw new Error('expected name_side question');
  });

  it('scores correct formula choice', () => {
    const q = tryGenerateTrigonometryQuestion(trigConfig());
    expect(q).not.toBeNull();
    expect(submittedAnswerIsCorrect(q!, q!.correctAnswer)).toBe(true);
    const wrong = q!.answerOptions.find((o) => o !== q!.correctAnswer);
    expect(wrong).toBeTruthy();
    expect(submittedAnswerIsCorrect(q!, wrong!)).toBe(false);
  });

  it('returns null when disabled', () => {
    const config = trigConfig({ enabled: false });
    expect(tryGenerateTrigonometryQuestion(config)).toBeNull();
  });

  it('never generates impossible hypotenuse labels for find-angle questions', () => {
    const config = trigConfig({ questionKinds: { pickFormula: true, nameSide: false, findAngle: true } });
    for (let i = 0; i < 100; i++) {
      const q = tryGenerateTrigonometryQuestion(config);
      expect(q).not.toBeNull();
      if (q!.subtype !== 'pick_formula') continue;
      const values = q!.diagram.knownValues ?? {};
      expect(isValidRightTriangleSideValues(values)).toBe(true);
      if (values.opposite !== undefined && values.hypotenuse !== undefined) {
        expect(values.hypotenuse).toBeGreaterThan(values.opposite);
      }
      if (values.adjacent !== undefined && values.hypotenuse !== undefined) {
        expect(values.hypotenuse).toBeGreaterThan(values.adjacent);
      }
    }
  });

  it('does not mark sin as correct when only opposite and adjacent are known', () => {
    const config = trigConfig();
    for (let i = 0; i < 100; i++) {
      const q = tryGenerateTrigonometryQuestion(config);
      if (q?.subtype !== 'pick_formula' || q.diagram.unknown !== 'angle') continue;
      const values = q.diagram.knownValues ?? {};
      const legsOnly =
        values.opposite !== undefined &&
        values.adjacent !== undefined &&
        values.hypotenuse === undefined;
      expect(legsOnly).toBe(false);
      if (values.hypotenuse === undefined) {
        expect(q.correctAnswer).not.toMatch(/^sin θ = \d+ \/ \?$/);
        expect(q.correctAnswer).not.toMatch(/^cos θ = \d+ \/ \?$/);
      }
    }
  });

  it('uses tan for find-angle with opposite and adjacent when tan is enabled', () => {
    const config = trigConfig({
      ratios: { sin: true, cos: true, tan: true, cot: false },
      questionKinds: { pickFormula: true, nameSide: false, findAngle: true },
    });
    for (let i = 0; i < 80; i++) {
      const q = tryGenerateTrigonometryQuestion(config);
      if (q?.subtype !== 'pick_formula' || q.diagram.unknown !== 'angle') continue;
      const values = q.diagram.knownValues ?? {};
      if (
        values.opposite !== undefined &&
        values.adjacent !== undefined &&
        values.hypotenuse === undefined
      ) {
        expect(q.correctAnswer).toBe(`tan θ = ${values.opposite} / ${values.adjacent}`);
        return;
      }
    }
    throw new Error('expected tan find-angle question');
  });
});
