import type { MathLearningConfig } from "@/features/learning-plan/learningPlan.types";
import { DEFAULT_EQUATION_UNKNOWN_CONFIG, DEFAULT_GEOMETRY_CONFIG } from "@/features/learning-plan/learningPlan.types";
import { getRecommendedLearningPlan } from "@/features/learning-plan/recommendedLearningPlan";
import {
    createSessionQuestions,
    isAnswerWithinFinalResultCap,
} from "@/features/questions/questionGenerator";
import { submittedAnswerIsCorrect } from "@/features/questions/questionScoring";
import {
  additionRequiresRegrouping,
  subtractionRequiresRegrouping,
} from "@/features/questions/regrouping";

const NO_EQUATIONS: MathLearningConfig["equationUnknown"] = {
  mode: "off",
  enabled: false,
  operators: {
    addition: false,
    subtraction: false,
    multiplication: false,
    division: false,
  },
};

function withoutGeometry(config: MathLearningConfig): MathLearningConfig {
  return {
    ...config,
    geometry: { ...DEFAULT_GEOMETRY_CONFIG, enabled: false },
  };
}

describe("isAnswerWithinFinalResultCap", () => {
  const base = getRecommendedLearningPlan(8);

  it("allows addition answers within 0..answerMax by default", () => {
    const cfg = { ...base, addition: { ...base.addition, answerMax: 20 as const } };
    expect(
      isAnswerWithinFinalResultCap(0, cfg),
    ).toBe(true);
    expect(
      isAnswerWithinFinalResultCap(20, cfg),
    ).toBe(true);
    expect(
      isAnswerWithinFinalResultCap(21, cfg),
    ).toBe(false);
  });

  it("allows negative addition answers within the cap when negatives are enabled", () => {
    const cfg: MathLearningConfig = {
      ...base,
      addition: {
        ...base.addition,
        answerMax: 10,
        allowNegativeNumbers: true,
        enabled: true,
      },
    };
    expect(isAnswerWithinFinalResultCap(-10, cfg)).toBe(true);
    expect(isAnswerWithinFinalResultCap(-11, cfg)).toBe(false);
  });

  it("does not apply the addition answer cap to other operations", () => {
    expect(
      isAnswerWithinFinalResultCap(9_000_000, base, "multiplication"),
    ).toBe(true);
  });
});

describe("createSessionQuestions", () => {
  it("generates addition questions whose correct answers respect answerMax", () => {
    const cfg: MathLearningConfig = {
      ...getRecommendedLearningPlan(8),
      addition: {
        ...getRecommendedLearningPlan(8).addition,
        answerMax: 20,
      },
      subtraction: { ...getRecommendedLearningPlan(8).subtraction, enabled: false },
      multiplication: { ...getRecommendedLearningPlan(8).multiplication, enabled: false },
      division: { ...getRecommendedLearningPlan(8).division, enabled: false },
      equationUnknown: NO_EQUATIONS,
    };
    const questions = createSessionQuestions(cfg, 12);
    for (const q of questions) {
      expect(q.operation).toBe("addition");
      expect(isAnswerWithinFinalResultCap(q.correctAnswer, cfg)).toBe(true);
    }
  });

  it("keeps addition sums within answerMax when each operand can be up to the cap", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: {
        enabled: true,
        leftMin: 1,
        leftMax: 100,
        rightMin: 1,
        rightMax: 100,
        answerMax: 100,
        standardCalculation: true,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: "same_only",
        regrouping: false,
        allowNegativeNumbers: false,
        allowDecimals: false,
        wordProblems: false,
      },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      equationUnknown: NO_EQUATIONS,
      equationTwoUnknowns: { ...template.equationTwoUnknowns, enabled: false },
    };

    for (let run = 0; run < 30; run++) {
      const questions = createSessionQuestions(cfg, 20);
      for (const q of questions) {
        expect(q.kind).toBe("arithmetic");
        expect(q.operation).toBe("addition");
        expect(q.questionStyle).toBe("standard");
        expect(isAnswerWithinFinalResultCap(q.correctAnswer, cfg)).toBe(true);
        expect(q.correctAnswer).toBeLessThanOrEqual(100);
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("keeps missing-number addition results within answerMax", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: {
        enabled: true,
        leftMin: 1,
        leftMax: 100,
        rightMin: 1,
        rightMax: 100,
        answerMax: 100,
        standardCalculation: false,
        missingNumber: true,
        fractions: false,
        fractionDenominatorMode: "same_only",
        regrouping: false,
        allowNegativeNumbers: false,
        allowDecimals: false,
        wordProblems: false,
      },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      equationUnknown: NO_EQUATIONS,
      equationTwoUnknowns: { ...template.equationTwoUnknowns, enabled: false },
    };

    for (let run = 0; run < 30; run++) {
      const questions = createSessionQuestions(cfg, 20);
      for (const q of questions) {
        expect(q.kind).toBe("arithmetic");
        expect(q.operation).toBe("addition");
        expect(q.questionStyle).toBe("missing_number");
        const resultMatch = /= (\d+)\s*$/.exec(q.questionText);
        expect(resultMatch).not.toBeNull();
        const result = Number(resultMatch![1]);
        expect(result).toBeLessThanOrEqual(100);
        expect(result).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("uses empty answer options when entry mode is keyboard", () => {
    const cfg: MathLearningConfig = {
      ...getRecommendedLearningPlan(8),
      answerEntryMode: "keyboard",
      equationUnknown: NO_EQUATIONS,
    };
    const questions = createSessionQuestions(cfg, 8);
    for (const q of questions) {
      expect(q.answerOptions).toEqual([]);
    }
  });

  it("generates a full session quickly when only one question source is enabled", () => {
    const template = getRecommendedLearningPlan(10);
    const cfg: MathLearningConfig = {
      ...template,
      addition: { ...template.addition, enabled: false },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: { ...template.rounding, enabled: false },
      orderOfOperations: { ...template.orderOfOperations, enabled: false },
      equationUnknown: NO_EQUATIONS,
      equationTwoUnknowns: { ...template.equationTwoUnknowns, enabled: false },
      geometry: { ...template.geometry, enabled: false },
      comparison: { ...template.comparison, enabled: false },
      fractionVisual: { ...template.fractionVisual, enabled: false },
      shapeRecognition: { ...template.shapeRecognition, enabled: false },
      clock: { ...template.clock, enabled: false },
      patterns: { ...template.patterns, enabled: false },
      integration: { ...template.integration, enabled: false },
      differentiation: { ...template.differentiation, enabled: true },
    };
    const started = Date.now();
    const questions = createSessionQuestions(cfg, 10);
    expect(questions).toHaveLength(10);
    expect(Date.now() - started).toBeLessThan(2_000);
  });

  it("does not repeat question text when enough combinations exist", () => {
    const template = getRecommendedLearningPlan(8);
    const cfg: MathLearningConfig = {
      ...template,
      addition: {
        enabled: true,
        leftMin: 1,
        leftMax: 2,
        rightMin: 1,
        rightMax: 2,
        answerMax: 20,
        standardCalculation: true,
        allowNegativeNumbers: false,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      maxFinalResult: 20,
      equationUnknown: NO_EQUATIONS,
    };
    const questions = createSessionQuestions(cfg, 4);
    expect(new Set(questions.map((q) => q.questionText)).size).toBe(4);
  });

  it("keeps selection-first factor order when randomizeFactorOrder is off", () => {
    const template = getRecommendedLearningPlan(8);
    const cfg: MathLearningConfig = {
      ...template,
      addition: { ...template.addition, enabled: false },
      subtraction: { ...template.subtraction, enabled: false },
      division: { ...template.division, enabled: false },
      multiplication: {
        enabled: true,
        factors: [5],
        secondFactorSource: "one_to_ten",
        randomizeFactorOrder: false,
        standardCalculation: true,
        allowNegativeNumbers: false,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      maxFinalResult: 100,
      equationUnknown: NO_EQUATIONS,
    };
    const questions = createSessionQuestions(cfg, 24);
    expect(questions.every((q) => q.questionText.startsWith("5 ×"))).toBe(true);
  });

  it("can show second-pool factor first when randomizeFactorOrder is on", () => {
    const template = getRecommendedLearningPlan(8);
    const cfg: MathLearningConfig = {
      ...template,
      addition: { ...template.addition, enabled: false },
      subtraction: { ...template.subtraction, enabled: false },
      division: { ...template.division, enabled: false },
      multiplication: {
        enabled: true,
        factors: [5],
        secondFactorSource: "one_to_ten",
        randomizeFactorOrder: true,
        standardCalculation: true,
        allowNegativeNumbers: false,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      maxFinalResult: 100,
      equationUnknown: NO_EQUATIONS,
    };
    const questions = createSessionQuestions(cfg, 160);
    const reversed = questions.some((q) => {
      const m = q.questionText.match(/^(\d+) × (\d+) = \?$/);
      return m !== null && m[1] !== "5" && m[2] === "5";
    });
    expect(reversed).toBe(true);
  });

  it("still fills the session when unique combinations are fewer than question count", () => {
    const template = getRecommendedLearningPlan(8);
    const cfg: MathLearningConfig = {
      ...template,
      addition: {
        enabled: true,
        leftMin: 1,
        leftMax: 1,
        rightMin: 1,
        rightMax: 1,
        answerMax: 20,
        standardCalculation: true,
        allowNegativeNumbers: false,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      maxFinalResult: 20,
      equationUnknown: NO_EQUATIONS,
    };
    const questions = createSessionQuestions(cfg, 8);
    expect(questions).toHaveLength(8);
    expect(new Set(questions.map((q) => q.questionText)).size).toBe(1);
  });

  it("generates squaring and square root questions when those operations are enabled", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: { ...template.addition, enabled: false },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      equationUnknown: { ...DEFAULT_EQUATION_UNKNOWN_CONFIG, enabled: false },
      maxFinalResult: "unlimited",
      square: { enabled: true, operandMax: 10, standardCalculation: true, fractions: false },
      squareRoot: { enabled: true, rootMax: 10, standardCalculation: true, fractions: false },
    };
    const questions = createSessionQuestions(cfg, 40);
    expect(
      questions.some(
        (q) =>
          q.kind === "arithmetic" &&
          q.operation === "square" &&
          q.questionText.includes("²"),
      ),
    ).toBe(true);
    expect(
      questions.some(
        (q) =>
          q.kind === "arithmetic" &&
          q.operation === "square_root" &&
          q.questionText.includes("√"),
      ),
    ).toBe(true);
  });

  it("generates rounding questions when rounding is the only enabled operation", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: { ...template.addition, enabled: false },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      equationUnknown: { ...DEFAULT_EQUATION_UNKNOWN_CONFIG, enabled: false },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: {
        enabled: true,
        nearest10: true,
        nearest100: false,
        nearestWhole: false,
        nearestTenth: false,
        nearestHundredth: false,
      },
      maxFinalResult: 100,
    };
    const questions = createSessionQuestions(cfg, 12);
    expect(questions.length).toBe(12);
    expect(
      questions.every(
        (q) =>
          q.kind === "arithmetic" &&
          q.operation === "rounding" &&
          q.questionText.includes("nearest 10"),
      ),
    ).toBe(true);
    for (const q of questions) {
      if (q.kind === "arithmetic" && q.operation === "rounding") {
        expect(q.correctAnswer % 10).toBe(0);
      }
    }
  });

  it("generates decimal-place rounding questions with decimal answer choices", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: { ...template.addition, enabled: false },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      equationUnknown: { ...DEFAULT_EQUATION_UNKNOWN_CONFIG, enabled: false },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: {
        enabled: true,
        nearest10: false,
        nearest100: false,
        nearestWhole: false,
        nearestTenth: true,
        nearestHundredth: true,
      },
      maxFinalResult: 100,
    };
    const questions = createSessionQuestions(cfg, 20);
    expect(questions.length).toBe(20);
    expect(
      questions.every(
        (q) =>
          q.kind === "arithmetic" &&
          q.operation === "rounding" &&
          (q.questionText.includes("1 decimal place") ||
            q.questionText.includes("2 decimal places")),
      ),
    ).toBe(true);
    expect(
      questions.some(
        (q) =>
          q.kind === "arithmetic" &&
          q.operation === "rounding" &&
          q.answerOptions.some(
            (option) => typeof option === "number" && !Number.isInteger(option),
          ),
      ),
    ).toBe(true);
  });

  it("does not generate equations with x when the parent operation main switch is off", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: { ...template.addition, enabled: false },
      subtraction: { ...template.subtraction, enabled: false },
      division: { ...template.division, enabled: false },
      multiplication: { ...template.multiplication, enabled: true },
      equationUnknown: {
        mode: "mixed",
        enabled: true,
        operators: {
          addition: true,
          subtraction: false,
          multiplication: false,
          division: false,
        },
      },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: { ...template.rounding, enabled: false },
      orderOfOperations: { ...template.orderOfOperations, enabled: false },
    };
    const questions = createSessionQuestions(cfg, 30);
    expect(
      questions.every(
        (q) => !(q.kind === "equation_unknown" && q.operation === "addition"),
      ),
    ).toBe(true);
    expect(questions.some((q) => q.kind === "arithmetic")).toBe(true);
  });

  it("generates missing-number arithmetic and x-equations without regular arithmetic when both modes are only", () => {
    const template = getRecommendedLearningPlan(8);
    const cfg: MathLearningConfig = {
      ...template,
      addition: {
        ...template.addition,
        enabled: true,
        standardCalculation: false,
        allowNegativeNumbers: false,
        missingNumber: true,
      },
      subtraction: {
        ...template.subtraction,
        enabled: true,
        standardCalculation: false,
        allowNegativeNumbers: false,
        missingNumber: true,
      },
      multiplication: {
        ...template.multiplication,
        enabled: true,
        standardCalculation: false,
        allowNegativeNumbers: false,
        missingNumber: true,
      },
      division: {
        ...template.division,
        enabled: true,
        allowRemainders: false,
        standardCalculation: false,
        allowNegativeNumbers: false,
        missingNumber: true,
      },
      equationUnknown: {
        mode: "only",
        enabled: true,
        operators: {
          addition: true,
          subtraction: true,
          multiplication: true,
          division: true,
        },
      },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: { ...template.rounding, enabled: false },
      orderOfOperations: { ...template.orderOfOperations, enabled: false },
      maxFinalResult: 1000,
    };
    const questions = createSessionQuestions(cfg, 30);
    expect(questions.some((q) => q.kind === "equation_unknown")).toBe(true);
    expect(
      questions.some(
        (q) => q.kind === "arithmetic" && q.questionStyle === "missing_number",
      ),
    ).toBe(true);
    expect(
      questions.some(
        (q) => q.kind === "arithmetic" && q.questionStyle === "standard",
      ),
    ).toBe(false);
  });

  it("uses whole-number division for missing-number division even when remainders are enabled", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: { ...template.addition, enabled: false },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: {
        enabled: true,
        answerMin: 2,
        answerMax: 5,
        divisors: [3, 5],
        allowRemainders: true,
        standardCalculation: false,
        allowNegativeNumbers: false,
        missingNumber: true,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      equationUnknown: { ...DEFAULT_EQUATION_UNKNOWN_CONFIG, enabled: false },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: { ...template.rounding, enabled: false },
      orderOfOperations: { ...template.orderOfOperations, enabled: false },
      maxFinalResult: 100,
    };
    const questions = createSessionQuestions(cfg, 8);
    expect(
      questions.every(
        (q) =>
          q.kind === "arithmetic" &&
          q.operation === "division" &&
          q.questionStyle === "missing_number" &&
          q.answerKind === "number" &&
          !q.questionText.includes("remainder"),
      ),
    ).toBe(true);
  });

  it("generates negative-number questions for the four basic operations", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: {
        ...template.addition,
        enabled: true,
        allowNegativeNumbers: true,
      },
      subtraction: {
        ...template.subtraction,
        enabled: true,
        allowNegativeNumbers: true,
        allowNegativeAnswers: true,
      },
      multiplication: {
        ...template.multiplication,
        enabled: true,
        allowNegativeNumbers: true,
      },
      division: {
        ...template.division,
        enabled: true,
        allowNegativeNumbers: true,
        allowRemainders: false,
      },
      equationUnknown: { ...DEFAULT_EQUATION_UNKNOWN_CONFIG, enabled: false },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: { ...template.rounding, enabled: false },
      orderOfOperations: { ...template.orderOfOperations, enabled: false },
      maxFinalResult: 1000,
    };
    const questions = createSessionQuestions(cfg, 120);
    const hasNegativeByOperation = (operation: string) =>
      questions.some(
        (q) =>
          q.kind === "arithmetic" &&
          q.operation === operation &&
          (q.questionText.includes("-") || q.correctAnswer < 0),
      );
    expect(hasNegativeByOperation("addition")).toBe(true);
    expect(hasNegativeByOperation("subtraction")).toBe(true);
    expect(hasNegativeByOperation("multiplication")).toBe(true);
    expect(hasNegativeByOperation("division")).toBe(true);
  });

  it("keeps negative addition answer choices near the correct answer", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: {
        enabled: true,
        leftMin: 1,
        leftMax: 1,
        rightMin: 12,
        rightMax: 12,
        answerMax: 100,
        standardCalculation: true,
        allowNegativeNumbers: true,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      equationUnknown: { ...DEFAULT_EQUATION_UNKNOWN_CONFIG, enabled: false },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: { ...template.rounding, enabled: false },
      orderOfOperations: { ...template.orderOfOperations, enabled: false },
      maxFinalResult: "unlimited",
      answerOptionsCount: 4,
    };
    const questions = createSessionQuestions(cfg, 20);
    for (const q of questions) {
      expect(q.kind).toBe("arithmetic");
      expect(q.operation).toBe("addition");
      expect(q.answerOptions).toContain(q.correctAnswer);
      for (const option of q.answerOptions) {
        expect(typeof option).toBe("number");
        expect(Math.abs((option as number) - q.correctAnswer)).toBeLessThanOrEqual(10);
      }
    }
  });

  it("formats signed questions and x-equation answers without double signs", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: {
        enabled: true,
        leftMin: 1,
        leftMax: 1,
        rightMin: 20,
        rightMax: 20,
        answerMax: 100,
        standardCalculation: true,
        allowNegativeNumbers: true,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      equationUnknown: {
        mode: "mixed",
        enabled: true,
        operators: {
          addition: true,
          subtraction: false,
          multiplication: false,
          division: false,
        },
      },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: { ...template.rounding, enabled: false },
      orderOfOperations: { ...template.orderOfOperations, enabled: false },
      maxFinalResult: "unlimited",
      answerOptionsCount: 4,
    };
    const questions = createSessionQuestions(cfg, 40);
    const visibleText = questions
      .flatMap((q) => [q.questionText, ...q.answerOptions.map(String)])
      .join(" ");
    expect(visibleText).not.toContain("+ -");
    expect(visibleText).not.toContain("--");
    expect(visibleText).not.toContain("+-");
    expect(visibleText).not.toContain("-+");
  });

  it("generates division remainder questions when allowRemainders is on", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: { ...template.addition, enabled: false },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: {
        enabled: true,
        answerMin: 2,
        answerMax: 5,
        divisors: [3, 5],
        allowRemainders: true,
        standardCalculation: true,
        allowNegativeNumbers: false,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      equationUnknown: { ...DEFAULT_EQUATION_UNKNOWN_CONFIG, enabled: false },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: { ...template.rounding, enabled: false },
      orderOfOperations: { ...template.orderOfOperations, enabled: false },
      maxFinalResult: 100,
    };
    const questions = createSessionQuestions(cfg, 8);
    expect(questions.length).toBe(8);
    expect(
      questions.every(
        (q) =>
          q.kind === "arithmetic" &&
          q.operation === "division" &&
          q.answerKind === "quotient_remainder" &&
          q.questionText.includes("remainder"),
      ),
    ).toBe(true);
  });

  it("generates valid negative quotient remainder questions when allowNegativeNumbers is on", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: { ...template.addition, enabled: false },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: {
        enabled: true,
        answerMin: -10,
        answerMax: 10,
        divisors: [3, 5, 8],
        allowRemainders: true,
        standardCalculation: true,
        allowNegativeNumbers: true,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      equationUnknown: { ...DEFAULT_EQUATION_UNKNOWN_CONFIG, enabled: false },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: { ...template.rounding, enabled: false },
      orderOfOperations: { ...template.orderOfOperations, enabled: false },
      maxFinalResult: 100,
    };
    const questions = createSessionQuestions(cfg, 30);
    const remainderQs = questions.filter(
      (q) =>
        q.kind === "arithmetic" &&
        q.operation === "division" &&
        q.answerKind === "quotient_remainder" &&
        q.quotientRemainder,
    );
    expect(remainderQs.length).toBeGreaterThan(0);

    for (const q of remainderQs) {
      const { quotient, remainder } = q.quotientRemainder!;
      expect(remainder).toBeGreaterThan(0);
      expect(submittedAnswerIsCorrect(q, `${quotient} R ${remainder}`)).toBe(true);

      const divMatch = /^(-?\d+|\u2212\d+) ÷ (-?\d+|\u2212\d+) = \? remainder \?$/.exec(
        q.questionText,
      );
      expect(divMatch).not.toBeNull();
      const parseNum = (s: string) =>
        Number(s.replace(/\u2212/g, '-'));
      const dividend = parseNum(divMatch![1]!);
      const divisor = parseNum(divMatch![2]!);
      expect(dividend).toBe(quotient * divisor + remainder);
      expect(q.answerOptions).toContain(`${quotient} R ${remainder}`);
    }
  });

  it("generates a + b × c with PEMDAS when order of operations is the only enabled operation", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: { ...template.addition, enabled: false },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      equationUnknown: { ...DEFAULT_EQUATION_UNKNOWN_CONFIG, enabled: false },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: { ...template.rounding, enabled: false },
      orderOfOperations: {
        enabled: true,
        operandMax: 5,
        includeSquaring: false,
        includeSquareRoots: false,
      },
      maxFinalResult: 100,
    };
    const questions = createSessionQuestions(cfg, 20);
    expect(questions.length).toBe(20);
    for (const q of questions) {
      expect(q.kind).toBe("arithmetic");
      expect(q.operation).toBe("order_of_operations");
      const m = /^(\d+) \+ (\d+) × (\d+) = \?$/.exec(q.questionText);
      expect(m).not.toBeNull();
      const a = Number(m![1]);
      const b = Number(m![2]);
      const c = Number(m![3]);
      expect(q.correctAnswer).toBe(a + b * c);
      const leftToRight = (a + b) * c;
      expect(q.answerOptions).toContain(q.correctAnswer);
      if (leftToRight !== q.correctAnswer) {
        expect(q.answerOptions).toContain(leftToRight);
      }
    }
  });

  it("includes squares and square roots in order-of-operations questions when selected", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: { ...template.addition, enabled: false },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      equationUnknown: { ...DEFAULT_EQUATION_UNKNOWN_CONFIG, enabled: false },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: { ...template.rounding, enabled: false },
      orderOfOperations: {
        enabled: true,
        operandMax: 5,
        includeSquaring: true,
        includeSquareRoots: true,
      },
      maxFinalResult: "unlimited",
    };
    const questions = createSessionQuestions(cfg, 100);
    expect(questions.some((q) => /\d²/.test(q.questionText))).toBe(true);
    expect(questions.some((q) => /√\d+/.test(q.questionText))).toBe(true);
  });

  it("generates fraction questions when fractions is the only enabled mode", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: {
        ...template.addition,
        enabled: true,
        standardCalculation: false,
        missingNumber: false,
        fractions: true,
        fractionDenominatorMode: "same_only",
      },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      equationUnknown: { ...DEFAULT_EQUATION_UNKNOWN_CONFIG, enabled: false },
      square: { ...template.square, enabled: false },
      squareRoot: { ...template.squareRoot, enabled: false },
      rounding: { ...template.rounding, enabled: false },
      orderOfOperations: { ...template.orderOfOperations, enabled: false },
    };
    const questions = createSessionQuestions(cfg, 12);
    expect(questions.length).toBe(12);
    expect(
      questions.every(
        (q) =>
          q.kind === "arithmetic" &&
          q.answerKind === "fraction" &&
          q.questionStyle === "fraction" &&
          q.questionText.includes("/"),
      ),
    ).toBe(true);
  });

  it("generates fraction square and square root questions when enabled", () => {
    const template = withoutGeometry(getRecommendedLearningPlan(10));
    const cfg: MathLearningConfig = {
      ...template,
      addition: { ...template.addition, enabled: false },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      equationUnknown: { ...DEFAULT_EQUATION_UNKNOWN_CONFIG, enabled: false },
      rounding: { ...template.rounding, enabled: false },
      orderOfOperations: { ...template.orderOfOperations, enabled: false },
      square: {
        enabled: true,
        operandMax: 10,
        standardCalculation: false,
        fractions: true,
      },
      squareRoot: {
        enabled: true,
        rootMax: 10,
        standardCalculation: false,
        fractions: true,
      },
    };
    const questions = createSessionQuestions(cfg, 20);
    expect(questions.some((q) => q.operation === "square" && q.questionText.includes(")²"))).toBe(
      true,
    );
    expect(
      questions.some((q) => q.operation === "square_root" && q.questionText.startsWith("√(")),
    ).toBe(true);
  });

  it("mixes regrouping and non-regrouping when regrouping is on", () => {
    const template = getRecommendedLearningPlan(8);
    const cfg: MathLearningConfig = {
      ...template,
      addition: {
        ...template.addition,
        enabled: true,
        leftMin: 10,
        leftMax: 99,
        rightMin: 10,
        rightMax: 99,
        regrouping: true,
      },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      equationUnknown: NO_EQUATIONS,
    };
    const questions = createSessionQuestions(cfg, 40);
    const addQuestions = questions.filter((q) => q.operation === "addition");
    expect(addQuestions.length).toBeGreaterThan(0);

    let withRegrouping = false;
    let withoutRegrouping = false;
    for (const q of addQuestions) {
      const match = q.questionText.match(/^(-?\d+)\s*\+\s*(-?\d+)\s*=\s*\?$/);
      if (!match) continue;
      if (additionRequiresRegrouping(Number(match[1]), Number(match[2]))) {
        withRegrouping = true;
      } else {
        withoutRegrouping = true;
      }
    }
    expect(withRegrouping).toBe(true);
    expect(withoutRegrouping).toBe(true);
  });

  it("excludes regrouping when regrouping is off", () => {
    const template = getRecommendedLearningPlan(8);
    const cfg: MathLearningConfig = {
      ...template,
      addition: {
        ...template.addition,
        enabled: true,
        leftMin: 10,
        leftMax: 99,
        rightMin: 10,
        rightMax: 99,
        regrouping: false,
      },
      subtraction: { ...template.subtraction, enabled: false },
      multiplication: { ...template.multiplication, enabled: false },
      division: { ...template.division, enabled: false },
      equationUnknown: NO_EQUATIONS,
    };
    const questions = createSessionQuestions(cfg, 30);
    for (const q of questions) {
      const match = q.questionText.match(/^(-?\d+)\s*\+\s*(-?\d+)\s*=\s*\?$/);
      if (!match) continue;
      expect(additionRequiresRegrouping(Number(match[1]), Number(match[2]))).toBe(
        false,
      );
    }
  });
});
