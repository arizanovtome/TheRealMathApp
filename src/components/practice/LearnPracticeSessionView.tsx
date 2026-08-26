import { useHeaderHeight } from "@react-navigation/elements";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnalogClockFace } from "@/components/clock/AnalogClockFace";
import { BasicShapeDiagram } from "@/components/shapes/BasicShapeDiagram";
import { ColoredShapeSequence } from "@/components/patterns/ColoredShapeSequence";
import { ShapeCountingVisual, ShapeQuantityComparisonVisual } from "@/components/number-sense/ShapeQuantityVisual";
import { ShapePatternFigure, ShapePatternSequence } from "@/components/patterns/ShapePatternFigure";
import { SHAPE_COLOR_HEX } from "@/features/shapes/shapeColors";
import { TrigonometryShapeDiagram } from "@/components/learn/TrigonometryShapeDiagram";
import { AppButton } from "@/components/common/AppButton";
import { AppText } from "@/components/common/AppText";
import { AnswerOptionButton } from "@/components/practice/AnswerOptionButton";
import { FeedbackMessage } from "@/components/practice/FeedbackMessage";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { LimitQuestionDisplay } from "@/components/limits/LimitQuestionDisplay";
import {
  SessionAnswerTextInput,
  SessionEquationAnswerInput,
} from "@/components/practice/SessionAnswerTextInput";
import {
  applyLearnPracticeFocus,
  type LearnPracticeTarget,
} from "@/features/learn/learnPractice.utils";
import { validateLearningConfig } from "@/features/learning-plan/learningPlan.utils";
import type { MathLearningConfig } from "@/features/learning-plan/learningPlan.types";
import { positiveFeedbackForCorrectCount } from "@/features/questions/answerOptionsGenerator";
import { normalizeEquationAnswerInput } from "@/features/questions/equationUnknown";
import { formatFraction } from "@/features/questions/fractions";
import type { MathQuestion } from "@/features/questions/question.types";
import {
  isArithmeticQuestion,
  isEquationUnknownQuestion,
  isFractionQuestion,
  isGeometryQuestion,
  isFractionVisualQuestion,
  isShapeRecognitionQuestion,
  isComparisonQuestion,
  isEquivalentExpressionQuestion,
  isClockQuestion,
  isPatternQuestion,
  isCalculusQuestion,
  isTrigonometryQuestion,
  isLogarithmQuestion,
  isEquationTwoUnknownQuestion,
  requiresMultipleChoiceQuestion,
  usesCompactQuestionCard,
} from "@/features/questions/question.types";
import { FractionVisualModel } from "@/components/fractions/FractionModels";
import { createSessionQuestions } from "@/features/questions/questionGenerator";
import {
  answerOptionDisplayLabel,
  answerOptionsArePlainNumbers,
  correctAnswerDisplayLabel,
  submittedAnswerIsCorrect,
} from "@/features/questions/questionScoring";
import { useAppStore } from "@/store/useAppStore";
import {
  selectActiveLearningConfig,
  selectActiveProfile,
} from "@/store/profileSelectors";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { radii, spacing } from "@/theme/spacing";
import { useAppTranslation } from "@/i18n/useAppTranslation";
import { parseNumberAnswer } from "@/utils/parseIntegerAnswer";
import { isCompleteFractionAnswer, parseFractionAnswer } from "@/utils/parseFractionAnswer";

type LearnPracticeSessionViewProps = {
  target: LearnPracticeTarget;
  configOverride?: MathLearningConfig;
};

export function LearnPracticeSessionView({
  target,
  configOverride,
}: LearnPracticeSessionViewProps) {
  const { t } = useAppTranslation(["common", "questions"]);
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const learningConfig = useAppStore(selectActiveLearningConfig);
  const activeProfile = useAppStore(selectActiveProfile);

  const effectiveConfig = useMemo(() => {
    if (configOverride) return configOverride;
    if (!learningConfig) return null;
    const age = activeProfile?.age ?? 8;
    return applyLearnPracticeFocus(learningConfig, target, age);
  }, [configOverride, learningConfig, target, activeProfile?.age]);

  const validation = useMemo(
    () =>
      effectiveConfig
        ? validateLearningConfig(effectiveConfig)
        : { valid: false as const, errors: [] as string[] },
    [effectiveConfig],
  );

  const useKeyboard = effectiveConfig?.answerEntryMode === "keyboard";

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [current, setCurrent] = useState<MathQuestion | null>(null);
  const [selected, setSelected] = useState<number | string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [positiveLine, setPositiveLine] = useState(() => t("correct"));
  const [answerInputText, setAnswerInputText] = useState("");
  const [inputError, setInputError] = useState("");

  const loadQuestion = useCallback(() => {
    if (!effectiveConfig || !validation.valid) {
      setCurrent(null);
      return;
    }
    try {
      const qs = createSessionQuestions(effectiveConfig, 1);
      setCurrent(qs[0] ?? null);
    } catch {
      setCurrent(null);
    }
  }, [effectiveConfig, validation.valid]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [current?.id]);

  useEffect(() => {
    if (!useKeyboard) {
      setKeyboardOpen(false);
      return;
    }

    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const subShow = Keyboard.addListener(showEvt, () => setKeyboardOpen(true));
    const subHide = Keyboard.addListener(hideEvt, () => setKeyboardOpen(false));

    return () => {
      subShow.remove();
      subHide.remove();
      setKeyboardOpen(false);
    };
  }, [useKeyboard]);

  useEffect(() => {
    setAnswerInputText("");
    setInputError("");
  }, [current?.id]);

  const resetForNextQuestion = () => {
    setSelected(null);
    setShowFeedback(false);
    setAnswerInputText("");
    setInputError("");
  };

  const forcedMc = current !== null && requiresMultipleChoiceQuestion(current);
  const showKeyboardInput = useKeyboard && !forcedMc;
  const requireConfirmMc =
    Boolean(effectiveConfig?.confirmAnswerBeforeSubmit) && !showKeyboardInput;

  function parseKeyboardAnswer(): number | string | null {
    if (!current) return null;
    if (isEquationUnknownQuestion(current)) {
      const body = answerInputText.replace(/^\s*x\s*=\s*/i, "");
      const norm = normalizeEquationAnswerInput(body);
      return norm === "" ? null : norm;
    }
    if (isGeometryQuestion(current)) {
      return parseNumberAnswer(answerInputText);
    }
    if (isArithmeticQuestion(current) && isFractionQuestion(current)) {
      const parsed = parseFractionAnswer(answerInputText);
      return parsed ? formatFraction(parsed) : null;
    }
    return parseNumberAnswer(answerInputText);
  }

  const revealFeedback = (answer: number | string) => {
    if (!current) return;
    setSelected(answer);
    setShowFeedback(true);
    if (submittedAnswerIsCorrect(current, answer)) {
      setCorrectCount((c) => {
        const next = c + 1;
        setPositiveLine(positiveFeedbackForCorrectCount(next, questionNumber));
        return next;
      });
    }
  };

  const handleSelect = (value: number | string) => {
    if (!current || showFeedback) return;
    setSelected(value);
    if (requireConfirmMc) return;
    revealFeedback(value);
  };

  const handleCheckKeyboard = () => {
    if (!current || !showKeyboardInput || showFeedback) return;
    if (isEquationUnknownQuestion(current)) {
      const body = answerInputText.replace(/^\s*x\s*=\s*/i, "");
      if (normalizeEquationAnswerInput(body) === "") {
        setInputError(t("common:equationHint"));
        return;
      }
      setInputError("");
      Keyboard.dismiss();
      revealFeedback(normalizeEquationAnswerInput(body));
      return;
    }
    const parsed = parseKeyboardAnswer();
    if (parsed === null) {
      setInputError(
        isArithmeticQuestion(current) && isFractionQuestion(current)
          ? t("common:fractionHint")
          : t("common:numberHint"),
      );
      return;
    }
    setInputError("");
    Keyboard.dismiss();
    revealFeedback(parsed);
  };

  const handlePrimaryAction = () => {
    if (!showFeedback && showKeyboardInput) {
      handleCheckKeyboard();
      return;
    }
    handleNext();
  };

  const handleNext = () => {
    if (!current || !effectiveConfig) return;

    if (requireConfirmMc && !showFeedback && selected !== null) {
      revealFeedback(selected);
      return;
    }

    if (showKeyboardInput && !showFeedback) return;
    if (!showKeyboardInput && !showFeedback) return;

    Keyboard.dismiss();
    setQuestionNumber((n) => n + 1);
    resetForNextQuestion();
    loadQuestion();
  };

  const scrollContentStyle = [
    styles.scrollInner,
    { paddingBottom: Math.max(spacing.xl, insets.bottom + spacing.md) },
    showKeyboardInput && keyboardOpen ? { paddingTop: insets.top } : null,
    keyboardOpen ? { paddingBottom: spacing.xl * 3 } : null,
  ];

  if (!effectiveConfig || !validation.valid || !current) {
    return (
      <View style={styles.center}>
        <AppText variant="subtitle">{t("common:couldNotLoadPractice")}</AppText>
        {!validation.valid ? (
          <AppText variant="body" muted>
            {validation.errors[0] ?? t("common:checkSettingsTryAgain")}
          </AppText>
        ) : null}
      </View>
    );
  }

  const progressLabel = t("common:questionN", { n: questionNumber });
  const correctLabel = correctAnswerDisplayLabel(current);
  const incorrectLine = t("common:incorrectAnswer", { answer: correctLabel });
  const optionDisabled = showFeedback;
  const isCorrectSelection =
    selected !== null && submittedAnswerIsCorrect(current, selected);
  const feedbackMessage = showFeedback && selected !== null
    ? isCorrectSelection
      ? positiveLine
      : incorrectLine
    : "";

  const inputLocked = showFeedback && showKeyboardInput;
  const answerPlaceholder =
    showKeyboardInput && !keyboardOpen && !inputLocked
      ? isEquationUnknownQuestion(current)
        ? t("common:equationPlaceholder")
        : isArithmeticQuestion(current) && isFractionQuestion(current)
          ? t("common:fractionPlaceholder")
          : t("common:yourAnswer")
      : "";

  const equationBodyNorm = normalizeEquationAnswerInput(
    answerInputText.replace(/^\s*x\s*=\s*/i, ""),
  );
  const equationInputReady =
    isEquationUnknownQuestion(current) && equationBodyNorm !== "";
  const fractionInputReady =
    isArithmeticQuestion(current) &&
    isFractionQuestion(current) &&
    isCompleteFractionAnswer(answerInputText);
  const numericInputReady =
    (isArithmeticQuestion(current) &&
      !isFractionQuestion(current) &&
      parseNumberAnswer(answerInputText) !== null) ||
    (isGeometryQuestion(current) &&
      current.answerKind === "number" &&
      parseNumberAnswer(answerInputText) !== null) ||
    (isEquationTwoUnknownQuestion(current) &&
      parseNumberAnswer(answerInputText) !== null);
  const keyboardInputReady =
    equationInputReady || fractionInputReady || numericInputReady;

  const nextDisabled = showKeyboardInput
    ? !showFeedback
      ? !keyboardInputReady
      : false
    : requireConfirmMc && !showFeedback
      ? selected === null
      : !showFeedback;

  const awaitingCheck = !showFeedback && (showKeyboardInput || requireConfirmMc);

  const primaryActionLabel = awaitingCheck
    ? showKeyboardInput
      ? t("common:checkAnswer")
      : t("common:confirm")
    : t("common:nextQuestion");

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        <QuestionCard
          progressLabel={progressLabel}
          questionText={current.questionText}
          compact={usesCompactQuestionCard(current)}
          questionContent={current.kind === "limit" ? (
            <LimitQuestionDisplay approach={current.approach} expression={current.expression} fraction={current.expressionFraction} />
          ) : undefined}
        >
          {current.kind === "number_sense" && current.countTarget ? <BasicShapeDiagram shape={current.countTarget.shape} fill={SHAPE_COLOR_HEX[current.countTarget.color]} size={58} /> : null}
        </QuestionCard>
        {current.kind === "number_sense" && current.countingShapes ? <ShapeCountingVisual items={current.countingShapes} /> : null}
        {current.kind === "number_sense" && current.quantityShapeGroups ? <ShapeQuantityComparisonVisual {...current.quantityShapeGroups} /> : null}

        {isFractionVisualQuestion(current) ? (
          <View style={styles.fractionVisual}>
            <FractionVisualModel
              model={current.model}
              numerator={current.shaded.numerator}
              denominator={current.shaded.denominator}
            />
          </View>
        ) : null}

        {isShapeRecognitionQuestion(current) ? (
          <View style={styles.shapeVisual}>
            <BasicShapeDiagram shape={current.shape} fill={SHAPE_COLOR_HEX[current.color]} />
          </View>
        ) : null}

        {isTrigonometryQuestion(current) ? (
          <View style={styles.shapeVisual}>
            <TrigonometryShapeDiagram diagram={current.diagram} />
          </View>
        ) : null}

        {isClockQuestion(current) && current.subtype === "read_analog" && current.displayTime ? (
          <View style={styles.clockVisual}>
            <AnalogClockFace time={current.displayTime} />
          </View>
        ) : null}

        {isPatternQuestion(current) && current.sequenceColoredShapes ? (
          <View style={styles.patternVisual}>
            <ColoredShapeSequence items={current.sequenceColoredShapes} />
          </View>
        ) : isPatternQuestion(current) && current.subtype === "shape_pattern" && current.sequenceShapes ? (
          <View style={styles.patternVisual}>
            <ShapePatternSequence icons={current.sequenceShapes} />
          </View>
        ) : isPatternQuestion(current) && current.sequenceDisplay ? (
          <View style={styles.patternVisual}>
            <AppText variant="title" style={styles.patternSequence}>
              {current.sequenceDisplay}
            </AppText>
          </View>
        ) : null}

        {showKeyboardInput ? (
          <View style={styles.keyboardAnswerBlock}>
            <AppText variant="label" style={styles.inputLabel}>
              {t("common:yourAnswer")}
            </AppText>
            {isEquationUnknownQuestion(current) ? (
              <View style={styles.equationKeyboardRow}>
                <AppText
                  variant="subtitle"
                  style={styles.xPrefix}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  x=
                </AppText>
                <SessionEquationAnswerInput
                  scrollRef={scrollRef}
                  accessibilityLabel={t("common:valueForX")}
                  editable={!inputLocked}
                  onSubmitEditing={() => {
                    if (!showFeedback) handlePrimaryAction();
                  }}
                  placeholder={answerPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  value={answerInputText}
                  onChangeText={(text) => {
                    setAnswerInputText(text);
                    if (inputError) setInputError("");
                  }}
                  style={styles.answerInputEquation}
                  lockedStyle={styles.answerInputLocked}
                />
              </View>
            ) : (
              <SessionAnswerTextInput
                question={current}
                scrollRef={scrollRef}
                accessibilityLabel={t("common:yourAnswer")}
                editable={!inputLocked}
                onSubmitEditing={() => {
                  if (!showFeedback) handlePrimaryAction();
                }}
                placeholder={answerPlaceholder}
                placeholderTextColor={colors.textMuted}
                value={answerInputText}
                onChangeText={(text) => {
                  setAnswerInputText(text);
                  if (inputError) setInputError("");
                }}
                style={styles.answerInput}
                lockedStyle={styles.answerInputLocked}
              />
            )}
            {inputError ? (
              <AppText variant="body" style={styles.inputError}>
                {inputError}
              </AppText>
            ) : null}
          </View>
        ) : answerOptionsArePlainNumbers(current) ? (
          <View style={styles.options}>
            {current.answerOptions.map((opt) => (
              <AnswerOptionButton
                key={String(opt)}
                label={answerOptionDisplayLabel(current, opt)}
                value={opt}
                disabled={optionDisabled}
                selected={selected === opt}
                onPress={handleSelect}
              />
            ))}
          </View>
        ) : isArithmeticQuestion(current) ||
          isEquationUnknownQuestion(current) ||
          isGeometryQuestion(current) ||
          isFractionVisualQuestion(current) ||
          isShapeRecognitionQuestion(current) ||
          isComparisonQuestion(current) ||
          isEquivalentExpressionQuestion(current) ||
          isClockQuestion(current) ||
          isPatternQuestion(current) ||
          isCalculusQuestion(current) ||
          isTrigonometryQuestion(current) ||
          isLogarithmQuestion(current) ||
          current.kind === "advanced_equation" ||
          current.kind === "limit" ||
          current.kind === "number_sense" ||
          isEquationTwoUnknownQuestion(current) ? (
          <View style={styles.optionsStacked}>
            {current.answerOptions.map((opt, index) => (
              <AnswerOptionButton
                key={`${String(opt)}-${index}`}
                label={isEquationUnknownQuestion(current) ? `x=${opt}` : answerOptionDisplayLabel(current, opt)}
                value={opt}
                disabled={optionDisabled}
                selected={selected === opt}
                onPress={handleSelect}
                stacked
              >
                {isPatternQuestion(current) && current.subtype === "colored_shape_pattern"
                  ? (() => {
                      const visual = current.coloredShapeAnswerOptions?.find(
                        (item) => item.label === String(opt),
                      );
                      return visual ? (
                        <BasicShapeDiagram
                          shape={visual.shape}
                          fill={SHAPE_COLOR_HEX[visual.color]}
                          size={58}
                        />
                      ) : null;
                    })()
                  : isPatternQuestion(current) && current.subtype === "shape_pattern"
                    ? <ShapePatternFigure icon={String(opt)} />
                    : undefined}
              </AnswerOptionButton>
            ))}
          </View>
        ) : (
          <View style={styles.options}>
            {current.answerOptions.map((opt) => (
              <AnswerOptionButton
                key={String(opt)}
                label={`x=${opt}`}
                value={opt}
                disabled={optionDisabled}
                selected={selected === opt}
                onPress={handleSelect}
              />
            ))}
          </View>
        )}

        <AppButton
          label={primaryActionLabel}
          onPress={handlePrimaryAction}
          disabled={nextDisabled}
          accessibilityHint={
            awaitingCheck
              ? showKeyboardInput
                ? t("questions:hintCheckTyped")
                : t("questions:hintCheckSelected")
              : t("questions:hintNextQuestion")
          }
        />

        {showFeedback && selected !== null ? (
          <FeedbackMessage
            variant={isCorrectSelection ? "correct" : "incorrect"}
            message={feedbackMessage}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollInner: {
    flexGrow: 1,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  fractionVisual: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  shapeVisual: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  clockVisual: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  patternVisual: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  patternSequence: {
    fontSize: 28,
    letterSpacing: 2,
  },
  keyboardAnswerBlock: {
    gap: spacing.sm,
  },
  inputLabel: {
    color: colors.textMuted,
  },
  equationKeyboardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  xPrefix: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    ...(fonts.math ? { fontFamily: fonts.math } : {}),
  },
  answerInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 28,
    fontWeight: "600",
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 52,
    ...(fonts.math ? { fontFamily: fonts.math } : {}),
  },
  answerInputEquation: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 28,
    fontWeight: "600",
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 52,
    ...(fonts.math ? { fontFamily: fonts.math } : {}),
  },
  answerInputLocked: {
    opacity: 0.65,
  },
  inputError: {
    color: colors.error,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "stretch",
  },
  optionsStacked: {
    flexDirection: "column",
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
  },
});
