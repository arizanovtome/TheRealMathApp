import type {
  MathLearningConfig,
  MathOperation,
} from "@/features/learning-plan/learningPlan.types";
import { DEFAULT_LOGARITHM_CONFIG } from "@/features/learning-plan/learningPlan.types";
import {
  applyPracticeFocusOverride,
  clampTimerSeconds,
  ensureLearningConfigShape,
  getEquationUnknownOperatorPool,
  getEquationTwoUnknownOperatorPool,
  getFractionDenominatorModeForOperation,
  getQuestionStylesForOperation,
  validateLearningConfig,
} from "@/features/learning-plan/learningPlan.utils";
import { getRecommendedLearningPlan } from "@/features/learning-plan/recommendedLearningPlan";

const basePlan: MathLearningConfig = getRecommendedLearningPlan(8);

describe("fraction denominator modes", () => {
  it("uses mixed denominators for multiplication and division", () => {
    expect(getFractionDenominatorModeForOperation(basePlan, "multiplication")).toBe("mixed");
    expect(getFractionDenominatorModeForOperation(basePlan, "division")).toBe("mixed");
  });

  it("keeps the selected mode for addition and subtraction", () => {
    expect(getFractionDenominatorModeForOperation(basePlan, "addition")).toBe(
      basePlan.addition.fractionDenominatorMode,
    );
    expect(getFractionDenominatorModeForOperation(basePlan, "subtraction")).toBe(
      basePlan.subtraction.fractionDenominatorMode,
    );
  });
});

describe("applyPracticeFocusOverride", () => {
  it("enables only the focused operation when it is enabled in base config", () => {
    const focused = applyPracticeFocusOverride(basePlan, "multiplication");
    expect(focused.multiplication.enabled).toBe(true);
    expect(focused.addition.enabled).toBe(false);
    expect(focused.square.enabled).toBe(false);
    expect(focused.squareRoot.enabled).toBe(false);
    expect(focused.rounding.enabled).toBe(false);
    expect(focused.orderOfOperations.enabled).toBe(false);
    expect(focused.equationUnknown.enabled).toBe(false);
  });

  it("returns base config when focus is not enabled", () => {
    const narrow = {
      ...basePlan,
      addition: { ...basePlan.addition, enabled: false },
      subtraction: { ...basePlan.subtraction, enabled: false },
      multiplication: { ...basePlan.multiplication, enabled: false },
      division: { ...basePlan.division, enabled: true },
    };
    const same = applyPracticeFocusOverride(narrow, "multiplication");
    expect(same.multiplication.enabled).toBe(false);
    expect(same.division.enabled).toBe(true);
  });
});

describe("clampTimerSeconds", () => {
  it("snaps to steps and clamps to limits", () => {
    expect(clampTimerSeconds(47)).toBe(45);
    expect(clampTimerSeconds(8)).toBe(10);
    expect(clampTimerSeconds(200)).toBe(120);
  });
});

describe("special arithmetic question modes", () => {
  it("uses only missing-number questions when standard calculation questions are off and missing number is on", () => {
    const cases: [MathOperation, MathLearningConfig][] = [
      [
        "addition",
        {
          ...basePlan,
          addition: {
            ...basePlan.addition,
            standardCalculation: false,
            missingNumber: true,
          },
        },
      ],
      [
        "subtraction",
        {
          ...basePlan,
          subtraction: {
            ...basePlan.subtraction,
            standardCalculation: false,
            missingNumber: true,
          },
        },
      ],
      [
        "multiplication",
        {
          ...basePlan,
          multiplication: {
            ...basePlan.multiplication,
            standardCalculation: false,
            missingNumber: true,
          },
        },
      ],
      [
        "division",
        {
          ...basePlan,
          division: {
            ...basePlan.division,
            standardCalculation: false,
            missingNumber: true,
          },
        },
      ],
    ];

    for (const [operation, cfg] of cases) {
      expect(getQuestionStylesForOperation(cfg, operation)).toEqual([
        "missing_number",
      ]);
    }
  });

  it("keeps regular operation questions independent from equations with x switches", () => {
    const cfg: MathLearningConfig = {
      ...basePlan,
      equationUnknown: {
        ...basePlan.equationUnknown,
        enabled: true,
        operators: {
          addition: true,
          subtraction: true,
          multiplication: true,
          division: true,
        },
      },
    };
    expect(getQuestionStylesForOperation(cfg, "addition")).toContain(
      "standard",
    );
    expect(getQuestionStylesForOperation(cfg, "subtraction")).toContain(
      "standard",
    );
    expect(getQuestionStylesForOperation(cfg, "multiplication")).toContain(
      "standard",
    );
    expect(getQuestionStylesForOperation(cfg, "division")).toContain(
      "standard",
    );
    expect(getEquationUnknownOperatorPool(cfg)).toEqual([
      "addition",
      "subtraction",
      "multiplication",
    ]);
  });

  it("excludes equations with x when the parent operation main switch is off", () => {
    const cfg: MathLearningConfig = {
      ...basePlan,
      addition: { ...basePlan.addition, enabled: false },
      equationUnknown: {
        ...basePlan.equationUnknown,
        enabled: true,
        operators: {
          addition: true,
          subtraction: false,
          multiplication: false,
          division: false,
        },
      },
      equationTwoUnknowns: {
        ...basePlan.equationTwoUnknowns,
        enabled: true,
        operators: {
          addition: true,
          subtraction: false,
          multiplication: false,
          division: false,
        },
      },
    };
    expect(getEquationUnknownOperatorPool(cfg)).toEqual([]);
    expect(getEquationTwoUnknownOperatorPool(cfg)).toEqual([]);
  });

  it("keeps missing-number and x-equation sources without regular arithmetic when regular is off", () => {
    const cfg: MathLearningConfig = {
      ...basePlan,
      addition: {
        ...basePlan.addition,
        standardCalculation: false,
        missingNumber: true,
      },
      subtraction: {
        ...basePlan.subtraction,
        standardCalculation: false,
        missingNumber: true,
      },
      multiplication: {
        ...basePlan.multiplication,
        standardCalculation: false,
        missingNumber: true,
      },
      division: {
        ...basePlan.division,
        standardCalculation: false,
        missingNumber: true,
      },
      equationUnknown: {
        ...basePlan.equationUnknown,
        enabled: true,
        operators: {
          addition: true,
          subtraction: true,
          multiplication: true,
          division: true,
        },
      },
    };
    expect(getQuestionStylesForOperation(cfg, "addition")).toEqual([
      "missing_number",
    ]);
    expect(getQuestionStylesForOperation(cfg, "subtraction")).toEqual([
      "missing_number",
    ]);
    expect(getQuestionStylesForOperation(cfg, "multiplication")).toEqual([
      "missing_number",
    ]);
    expect(getQuestionStylesForOperation(cfg, "division")).toEqual([
      "missing_number",
    ]);
    expect(getEquationUnknownOperatorPool(cfg)).toEqual([
      "addition",
      "subtraction",
      "multiplication",
    ]);
  });
});

describe("validateLearningConfig", () => {
  it("rejects when all question styles are off", () => {
    const invalid: MathLearningConfig = {
      ...basePlan,
      addition: {
        ...basePlan.addition,
        standardCalculation: false,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      subtraction: {
        ...basePlan.subtraction,
        standardCalculation: false,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      multiplication: {
        ...basePlan.multiplication,
        standardCalculation: false,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      division: {
        ...basePlan.division,
        standardCalculation: false,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
        wordProblems: false,
      },
    };
    const result = validateLearningConfig(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Addition") || e.includes("Собирање"))).toBe(true);
    expect(result.errors.some((e) => e.includes("topic"))).toBe(false);
  });

  it("rejects division remainders without a divisor of at least 2", () => {
    const invalid: MathLearningConfig = {
      ...basePlan,
      division: {
        ...basePlan.division,
        enabled: true,
        allowRemainders: true,
        divisors: [1],
      },
    };
    const result = validateLearningConfig(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("remainder"))).toBe(true);
  });

  it("allows keyboard mode with questions that fall back to answer choices", () => {
    const config: MathLearningConfig = {
      ...basePlan,
      answerEntryMode: "keyboard",
      division: {
        ...basePlan.division,
        enabled: true,
        allowRemainders: true,
        divisors: [3],
      },
    };

    expect(validateLearningConfig(config).valid).toBe(true);
  });

  it("rejects configs with every operation disabled", () => {
    const invalid: MathLearningConfig = {
      ...basePlan,
      addition: { ...basePlan.addition, enabled: false },
      subtraction: { ...basePlan.subtraction, enabled: false },
      multiplication: { ...basePlan.multiplication, enabled: false },
      division: { ...basePlan.division, enabled: false },
      equationUnknown: {
        ...basePlan.equationUnknown,
        enabled: false,
        operators: {
          addition: false,
          subtraction: false,
          multiplication: false,
          division: false,
        },
      },
    };
    const result = validateLearningConfig(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("topic"))).toBe(true);
  });

  it("does not require equation styles when parent operations are off", () => {
    const staleEquationToggles: MathLearningConfig = {
      ...basePlan,
      addition: { ...basePlan.addition, enabled: false },
      subtraction: { ...basePlan.subtraction, enabled: false },
      multiplication: { ...basePlan.multiplication, enabled: false },
      division: { ...basePlan.division, enabled: false },
      equationUnknown: {
        ...basePlan.equationUnknown,
        enabled: true,
        mode: "mixed",
        operators: {
          addition: true,
          subtraction: true,
          multiplication: true,
          division: true,
        },
      },
      fractionVisual: { enabled: true },
    };
    const result = validateLearningConfig(staleEquationToggles);
    expect(result.errors).not.toContain(
      "Equations with x: pick at least one operator style.",
    );
    expect(result.valid).toBe(true);
  });

  it("accepts fraction recognition as the only question source", () => {
    const fractionOnly: MathLearningConfig = {
      ...basePlan,
      addition: { ...basePlan.addition, enabled: false },
      subtraction: { ...basePlan.subtraction, enabled: false },
      multiplication: { ...basePlan.multiplication, enabled: false },
      division: { ...basePlan.division, enabled: false },
      square: { ...basePlan.square, enabled: false },
      squareRoot: { ...basePlan.squareRoot, enabled: false },
      rounding: { ...basePlan.rounding, enabled: false },
      orderOfOperations: { ...basePlan.orderOfOperations, enabled: false },
      equationUnknown: {
        ...basePlan.equationUnknown,
        enabled: false,
        mode: "off",
        operators: {
          addition: false,
          subtraction: false,
          multiplication: false,
          division: false,
        },
      },
      equationTwoUnknowns: {
        ...basePlan.equationTwoUnknowns,
        enabled: false,
        operators: {
          addition: false,
          subtraction: false,
          multiplication: false,
          division: false,
        },
      },
      geometry: { ...basePlan.geometry, enabled: false },
      comparison: { ...basePlan.comparison, enabled: false },
      fractionVisual: { enabled: true },
    };
    const result = validateLearningConfig(fractionOnly);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("accepts the recommended defaults", () => {
    expect(validateLearningConfig(basePlan).valid).toBe(true);
  });

  it("accepts logarithms as the only enabled question source", () => {
    const logOnly: MathLearningConfig = {
      ...basePlan,
      addition: { ...basePlan.addition, enabled: false },
      subtraction: { ...basePlan.subtraction, enabled: false },
      multiplication: { ...basePlan.multiplication, enabled: false },
      division: { ...basePlan.division, enabled: false },
      square: { ...basePlan.square, enabled: false },
      squareRoot: { ...basePlan.squareRoot, enabled: false },
      rounding: { ...basePlan.rounding, enabled: false },
      orderOfOperations: { ...basePlan.orderOfOperations, enabled: false },
      equivalentExpressions: { ...basePlan.equivalentExpressions, enabled: false },
      geometry: { ...basePlan.geometry, enabled: false },
      comparison: { ...basePlan.comparison, enabled: false },
      fractionVisual: { ...basePlan.fractionVisual, enabled: false },
      shapeRecognition: { ...basePlan.shapeRecognition, enabled: false },
      numberSense: { ...basePlan.numberSense, enabled: false },
      clock: { ...basePlan.clock, enabled: false },
      patterns: { ...basePlan.patterns, enabled: false },
      differentiation: { ...basePlan.differentiation, enabled: false },
      integration: { ...basePlan.integration, enabled: false },
      trigonometry: { ...basePlan.trigonometry, enabled: false },
      logarithm: { ...DEFAULT_LOGARITHM_CONFIG, enabled: true },
    };
    const result = validateLearningConfig(logOnly);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects multiplication when no factors are selected", () => {
    const invalid: MathLearningConfig = {
      ...basePlan,
      multiplication: {
        enabled: true,
        factors: [],
        secondFactorSource: "selection_only",
        randomizeFactorOrder: false,
        standardCalculation: true,
        allowNegativeNumbers: false,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
    };
    expect(validateLearningConfig(invalid).valid).toBe(false);
  });

  it("allows addition when some sums fit within the addition answer cap", () => {
    const valid: MathLearningConfig = {
      ...basePlan,
      addition: {
        enabled: true,
        leftMin: 1,
        leftMax: 100,
        rightMin: 1,
        rightMax: 100,
        answerMax: 20,
        standardCalculation: true,
        allowNegativeNumbers: false,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      subtraction: { ...basePlan.subtraction, enabled: false },
      multiplication: { ...basePlan.multiplication, enabled: false },
      division: { ...basePlan.division, enabled: false },
    };
    expect(validateLearningConfig(valid).valid).toBe(true);
  });

  it("rejects addition ranges when the smallest sum exceeds the addition answer cap", () => {
    const invalid: MathLearningConfig = {
      ...basePlan,
      addition: {
        enabled: true,
        leftMin: 50,
        leftMax: 60,
        rightMin: 50,
        rightMax: 60,
        answerMax: 10,
        standardCalculation: true,
        allowNegativeNumbers: false,
        missingNumber: false,
        fractions: false,
        fractionDenominatorMode: 'same_only',
      },
      subtraction: { ...basePlan.subtraction, enabled: false },
      multiplication: { ...basePlan.multiplication, enabled: false },
      division: { ...basePlan.division, enabled: false },
    };
    const result = validateLearningConfig(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Addition"))).toBe(true);
  });

  it("rejects addition when all question modes are off", () => {
    const invalid: MathLearningConfig = {
      ...basePlan,
      addition: {
        ...basePlan.addition,
        enabled: true,
        standardCalculation: false,
        missingNumber: false,
        fractions: false,
      },
    };
    const result = validateLearningConfig(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Addition"))).toBe(true);
  });

  it("rejects rounding when enabled but no nearest option is on", () => {
    const invalid: MathLearningConfig = {
      ...basePlan,
      rounding: {
        ...basePlan.rounding,
        enabled: true,
        nearest10: false,
        nearest100: false,
        nearestWhole: false,
        nearestTenth: false,
        nearestHundredth: false,
      },
    };
    expect(validateLearningConfig(invalid).valid).toBe(false);
  });

  it("migrates legacy comparison config with relational and ordering on", () => {
    const shaped = ensureLearningConfigShape({
      ...basePlan,
      comparison: { enabled: true },
    } as MathLearningConfig);
    expect(shaped.comparison.relational).toBe(true);
    expect(shaped.comparison.ordering).toBe(true);
    expect(shaped.comparison.expressionCompare).toBe(true);
    expect(shaped.comparison.fractionVsDecimal).toBe(false);
  });

  it("defaults new order-of-operations options off for saved plans", () => {
    const shaped = ensureLearningConfigShape({
      ...basePlan,
      orderOfOperations: { enabled: true, operandMax: 10 },
    } as MathLearningConfig);
    expect(shaped.orderOfOperations.includeSquaring).toBe(false);
    expect(shaped.orderOfOperations.includeSquareRoots).toBe(false);
  });

  it("adds disabled equivalent-expression defaults to existing saved plans", () => {
    const { equivalentExpressions: _drop, ...savedPlan } = basePlan;
    const shaped = ensureLearningConfigShape(savedPlan as MathLearningConfig);
    expect(shaped.equivalentExpressions.enabled).toBe(false);
    expect(shaped.equivalentExpressions.squareOfSum).toBe(true);
    expect(shaped.equivalentExpressions.factorization).toBe(true);
  });

  it("migrates color question options safely", () => {
    const shaped = ensureLearningConfigShape({
      ...basePlan,
      shapeRecognition: {
        enabled: true,
        shapes: basePlan.shapeRecognition.shapes,
      },
      patterns: {
        enabled: true,
        arithmeticSequence: false,
        geometricSequence: false,
        numberPattern: false,
        shapePattern: true,
      },
    } as MathLearningConfig);
    expect(shaped.shapeRecognition.shapeQuestions).toBe(true);
    expect(shaped.shapeRecognition.colorQuestions).toBe(false);
    expect(shaped.shapeRecognition.colorAndShapeQuestions).toBe(false);
    expect(shaped.patterns.coloredShapePattern).toBe(false);
  });

  it("rejects equivalent expressions when no subtype is selected", () => {
    const invalid: MathLearningConfig = {
      ...basePlan,
      equivalentExpressions: {
        enabled: true,
        squareOfSum: false,
        squareOfDifference: false,
        parenthesesAfterAddition: false,
        parenthesesAfterSubtraction: false,
        distributiveProperty: false,
        differenceOfSquares: false,
        factorization: false,
      },
    };
    expect(validateLearningConfig(invalid).valid).toBe(false);
  });

  it("defaults confirmAnswerBeforeSubmit to false when missing", () => {
    const { confirmAnswerBeforeSubmit: _drop, ...withoutConfirm } = basePlan;
    const shaped = ensureLearningConfigShape(withoutConfirm as MathLearningConfig);
    expect(shaped.confirmAnswerBeforeSubmit).toBe(false);
  });

  it("migrates the legacy timed penalty switch to seconds", () => {
    const {
      timedWrongPenaltySeconds: _wrong,
      timedCorrectBonusSeconds: _bonus,
      ...legacy
    } = basePlan;
    const enabled = ensureLearningConfigShape({
      ...legacy,
      timedSubtractSecondsOnWrong: true,
    } as MathLearningConfig);
    const disabled = ensureLearningConfigShape({
      ...legacy,
      timedSubtractSecondsOnWrong: false,
    } as MathLearningConfig);

    expect(enabled.timedWrongPenaltySeconds).toBe(15);
    expect(enabled.timedCorrectBonusSeconds).toBe(0);
    expect(disabled.timedWrongPenaltySeconds).toBe(0);
  });

  it("supports timed-run duration presets", () => {
    expect(
      ensureLearningConfigShape({ ...basePlan, timedDurationMinutes: 0.25 })
        .timedDurationMinutes,
    ).toBe(0.25);
    expect(
      ensureLearningConfigShape({ ...basePlan, timedDurationMinutes: 0.5 })
        .timedDurationMinutes,
    ).toBe(0.5);
    expect(
      ensureLearningConfigShape({ ...basePlan, timedDurationMinutes: 10 })
        .timedDurationMinutes,
    ).toBe(10);
  });
});
