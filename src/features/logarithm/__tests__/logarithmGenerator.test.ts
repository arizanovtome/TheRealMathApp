import { tryGenerateLogarithmQuestion } from '@/features/logarithm/logarithmGenerator';
import { logAnswersEquivalentForMc } from '@/features/logarithm/logarithmFormat';
import { normalizeLogarithmConfig } from '@/features/logarithm/logarithmConfig.utils';
import { DEFAULT_LOGARITHM_CONFIG } from '@/features/logarithm/logarithm.types';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { submittedAnswerIsCorrect } from '@/features/questions/questionScoring';

function configWithLogarithm(
  overrides: Partial<MathLearningConfig['logarithm']> = {},
): MathLearningConfig {
  const base = getRecommendedLearningPlan(12);
  return {
    ...base,
    logarithm: { ...DEFAULT_LOGARITHM_CONFIG, enabled: true, ...overrides },
  };
}

describe('logarithmGenerator', () => {
  it('returns null when disabled', () => {
    const config = getRecommendedLearningPlan(12);
    expect(tryGenerateLogarithmQuestion(config)).toBeNull();
  });

  it('generates multiple-choice questions for enabled subtypes', () => {
    const config = configWithLogarithm();
    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const q = tryGenerateLogarithmQuestion(config);
      expect(q).not.toBeNull();
      expect(q!.kind).toBe('logarithm');
      expect(q!.operation).toBe('logarithm');
      expect(q!.answerOptions).toContain(q!.correctAnswer);
      expect(q!.answerOptions.length).toBe(config.answerOptionsCount);
      seen.add(q!.subtype);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('does not offer equivalent product-rule answers as distractors', () => {
    const config = configWithLogarithm({
      productRule: true,
      quotientRule: false,
      powerRule: false,
      numericLog: false,
      numericLn: false,
    });
    for (let i = 0; i < 50; i++) {
      const q = tryGenerateLogarithmQuestion(config);
      expect(q?.subtype).toBe('product_rule');
      for (const opt of q!.answerOptions) {
        if (opt === q!.correctAnswer) continue;
        expect(logAnswersEquivalentForMc(opt, q!.correctAnswer)).toBe(false);
      }
    }
  });

  it('accepts commutative product-rule answers when scoring', () => {
    const config = configWithLogarithm({
      productRule: true,
      quotientRule: false,
      powerRule: false,
      numericLog: false,
      numericLn: false,
    });
    const q = tryGenerateLogarithmQuestion(config);
    expect(q?.subtype).toBe('product_rule');
    const swapped = q!.correctAnswer.replace(
      /log (\d+) \+ log (\d+)/,
      'log $2 + log $1',
    );
    expect(submittedAnswerIsCorrect(q!, swapped)).toBe(true);
  });

  it('scores numeric ln answers', () => {
    const config = configWithLogarithm({
      productRule: false,
      quotientRule: false,
      powerRule: false,
      numericLog: false,
      numericLn: true,
    });
    let q = tryGenerateLogarithmQuestion(config);
    for (let i = 0; i < 20 && q?.subtype !== 'numeric_ln'; i++) {
      q = tryGenerateLogarithmQuestion(config);
    }
    expect(q?.subtype).toBe('numeric_ln');
    expect(submittedAnswerIsCorrect(q!, q!.correctAnswer)).toBe(true);
  });

  it('generates numeric log value questions with simple bases', () => {
    const config = configWithLogarithm({
      productRule: false,
      quotientRule: false,
      powerRule: false,
      numericLog: true,
      numericLn: false,
    });
    const bases = new Set<string>();
    for (let i = 0; i < 80; i++) {
      const q = tryGenerateLogarithmQuestion(config);
      expect(q?.subtype).toBe('numeric_log');
      expect(q!.questionText).toMatch(/log.+\= \?/);
      expect(submittedAnswerIsCorrect(q!, q!.correctAnswer)).toBe(true);
      expect(q!.answerOptions.every((opt) => /^-?\d+$/.test(opt))).toBe(true);
      if (q!.questionText.includes('log₂')) bases.add('2');
      if (q!.questionText.includes('log₃')) bases.add('3');
      if (q!.questionText.includes('log₅')) bases.add('5');
      if (q!.questionText.includes('log₁₀')) bases.add('10');
    }
    expect(bases.size).toBeGreaterThan(1);
  });
});

describe('normalizeLogarithmConfig', () => {
  it('migrates legacy numericLog10 and numericLog2 flags to numericLog', () => {
    expect(
      normalizeLogarithmConfig({
        enabled: true,
        numericLog10: true,
        numericLog2: false,
      }).numericLog,
    ).toBe(true);
    expect(
      normalizeLogarithmConfig({
        enabled: true,
        numericLog10: false,
        numericLog2: false,
      }).numericLog,
    ).toBe(false);
  });
});
