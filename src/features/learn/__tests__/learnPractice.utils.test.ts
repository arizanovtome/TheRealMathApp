import {
  applyLearnPracticeFocus,
  mergeFocusedOperationIntoProfile,
  parseLearnPracticeTargetParam,
} from '@/features/learn/learnPractice.utils';
import { getEnabledOperations, getEquationTwoUnknownOperatorPool, validateLearningConfig } from '@/features/learning-plan/learningPlan.utils';
import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { createSessionQuestions } from '@/features/questions/questionGenerator';

describe('applyLearnPracticeFocus', () => {
  it.each([6, 10, 14, 18])('generates only systems in systems practice at age %s', (age) => {
    const defaults = getRecommendedLearningPlan(age);
    const saved = {
      ...defaults,
      addition: { ...defaults.addition, enabled: false },
      subtraction: { ...defaults.subtraction, enabled: false },
      multiplication: { ...defaults.multiplication, enabled: false },
      division: { ...defaults.division, enabled: false },
    };
    const focused = applyLearnPracticeFocus(
      saved,
      { kind: 'equation_two_unknowns' },
      age,
    );
    expect(validateLearningConfig(focused)).toEqual({ valid: true, errors: [] });
    expect(getEnabledOperations(focused)).toEqual([]);
    expect(getEquationTwoUnknownOperatorPool(focused)).toEqual([
      'addition', 'subtraction', 'multiplication', 'division',
    ]);
    for (const operation of getEquationTwoUnknownOperatorPool(focused)) {
      const onlyOperation = {
        ...focused,
        equationTwoUnknowns: {
          enabled: true,
          operators: {
            addition: operation === 'addition',
            subtraction: operation === 'subtraction',
            multiplication: operation === 'multiplication',
            division: operation === 'division',
          },
        },
      };
      expect(validateLearningConfig(onlyOperation).valid).toBe(true);
      expect(createSessionQuestions(onlyOperation, 1)[0]).toMatchObject({
        kind: 'equation_two_unknown', operation,
      });
    }
    const questions = createSessionQuestions(focused, 30);
    expect(questions).toHaveLength(30);
    for (const question of questions) {
      expect(question.kind).toBe('equation_two_unknown');
      expect(question.questionText.split('\n')).toHaveLength(3);
    }
  });

  it('forces a single operation even when disabled in saved settings', () => {
    const saved = {
      ...getRecommendedLearningPlan(8),
      addition: { ...getRecommendedLearningPlan(8).addition, enabled: false },
      subtraction: { ...getRecommendedLearningPlan(8).subtraction, enabled: true },
    };
    const focused = applyLearnPracticeFocus(
      saved,
      { kind: 'operation', operation: 'addition' },
      8,
    );
    expect(focused.addition.enabled).toBe(true);
    expect(focused.subtraction.enabled).toBe(false);
    expect(getEnabledOperations(focused)).toEqual(['addition']);
  });

  it('includes squares and roots in focused order-of-operations practice', () => {
    const focused = applyLearnPracticeFocus(
      getRecommendedLearningPlan(14),
      { kind: 'operation', operation: 'order_of_operations' },
      14,
    );
    expect(focused.orderOfOperations.enabled).toBe(true);
    expect(focused.orderOfOperations.includeSquaring).toBe(true);
    expect(focused.orderOfOperations.includeSquareRoots).toBe(true);
  });

  it('focuses equivalent-expression practice with every subtype available', () => {
    const focused = applyLearnPracticeFocus(
      getRecommendedLearningPlan(14),
      { kind: 'operation', operation: 'equivalent_expressions' },
      14,
    );
    expect(focused.equivalentExpressions.enabled).toBe(true);
    expect(focused.equivalentExpressions.squareOfSum).toBe(true);
    expect(focused.equivalentExpressions.factorization).toBe(true);
  });

  it('preserves the profile answer-choice count for focused advanced practice', () => {
    const saved = { ...getRecommendedLearningPlan(14), answerOptionsCount: 4 as const };
    const focused = applyLearnPracticeFocus(
      saved,
      { kind: 'operation', operation: 'advanced_equations' },
      14,
    );
    expect(focused.answerOptionsCount).toBe(4);
  });

  it('enables shape, color, and combined questions in shape Learn practice', () => {
    const focused = applyLearnPracticeFocus(
      getRecommendedLearningPlan(6),
      { kind: 'operation', operation: 'shape_recognition' },
      6,
    );
    expect(focused.shapeRecognition.shapeQuestions).toBe(true);
    expect(focused.shapeRecognition.colorQuestions).toBe(true);
    expect(focused.shapeRecognition.colorAndShapeQuestions).toBe(true);
  });
});

describe('parseLearnPracticeTargetParam', () => {
  it('parses operation targets', () => {
    expect(parseLearnPracticeTargetParam('operation', 'differentiation')).toEqual({
      kind: 'operation',
      operation: 'differentiation',
    });
  });

  it('parses special topic targets', () => {
    expect(parseLearnPracticeTargetParam('fractions', undefined)).toEqual({
      kind: 'fractions',
    });
  });
});

describe('mergeFocusedOperationIntoProfile', () => {
  it('saves only the practiced section and preserves unrelated profile settings', () => {
    const profile = getRecommendedLearningPlan(10);
    const focused = applyLearnPracticeFocus(
      profile,
      { kind: 'operation', operation: 'shape_recognition' },
      10,
    );
    focused.shapeRecognition.colorQuestions = true;
    const merged = mergeFocusedOperationIntoProfile(profile, focused, 'shape_recognition');
    expect(merged.shapeRecognition.colorQuestions).toBe(true);
    expect(merged.addition).toEqual(profile.addition);
    expect(merged.patterns).toEqual(profile.patterns);
  });
});
