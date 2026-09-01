import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import { generateArithmeticDraft } from '@/features/questions/questionGenerator';
import { multiplyDecimalOperands, roundDecimal } from '@/features/questions/decimalArithmetic';

describe('decimal arithmetic', () => {
  it('generates decimal addition when allowDecimals is on', () => {
    const config = getRecommendedLearningPlan(10);
    config.addition.allowDecimals = true;
    const draft = generateArithmeticDraft(config, 'addition', true);
    expect(draft.correctAnswer).toBe(
      roundDecimal(
        (draft.operandSnapshot as { left: number; right: number }).left +
          (draft.operandSnapshot as { left: number; right: number }).right,
      ),
    );
  });

  it('uses whole numbers when allowDecimals is off', () => {
    const config = getRecommendedLearningPlan(10);
    config.addition.allowDecimals = false;
    const draft = generateArithmeticDraft(config, 'addition', true);
    expect(Number.isInteger(draft.correctAnswer)).toBe(true);
  });

  it('keeps the exact hundredths result when multiplying decimal operands', () => {
    expect(multiplyDecimalOperands(-2.6, 9.3)).toBe(-24.18);
  });
});
