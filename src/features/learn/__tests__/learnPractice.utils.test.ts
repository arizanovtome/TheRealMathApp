import {
  applyLearnPracticeFocus,
  mergeFocusedOperationIntoProfile,
  parseLearnPracticeTargetParam,
} from '@/features/learn/learnPractice.utils';
import { getEnabledOperations } from '@/features/learning-plan/learningPlan.utils';
import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';

describe('applyLearnPracticeFocus', () => {
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

  it('focuses equation unknown practice', () => {
    const saved = getRecommendedLearningPlan(10);
    const focused = applyLearnPracticeFocus(saved, { kind: 'equation_unknown' }, 10);
    expect(focused.equationUnknown.enabled).toBe(true);
    expect(focused.addition.enabled).toBe(true);
    expect(focused.subtraction.enabled).toBe(true);
    expect(focused.multiplication.enabled).toBe(false);
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
