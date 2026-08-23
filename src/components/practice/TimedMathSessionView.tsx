import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
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

import { BasicShapeDiagram } from "@/components/shapes/BasicShapeDiagram";
import { ColoredShapeSequence } from "@/components/patterns/ColoredShapeSequence";
import { ShapeCountingVisual, ShapeQuantityComparisonVisual } from "@/components/number-sense/ShapeQuantityVisual";
import { ShapePatternFigure, ShapePatternSequence } from "@/components/patterns/ShapePatternFigure";
import { SHAPE_COLOR_HEX } from "@/features/shapes/shapeColors";
import { TrigonometryShapeDiagram } from "@/components/learn/TrigonometryShapeDiagram";
import { AnalogClockFace } from "@/components/clock/AnalogClockFace";
import { AppButton } from "@/components/common/AppButton";
import { AppText } from "@/components/common/AppText";
import { AnswerOptionButton } from "@/components/practice/AnswerOptionButton";
import { FeedbackMessage } from "@/components/practice/FeedbackMessage";
import { QuestionCard } from "@/components/practice/QuestionCard";
import {
  SessionAnswerTextInput,
  SessionEquationAnswerInput,
} from "@/components/practice/SessionAnswerTextInput";
import { ROUTES } from "@/constants/routes";
import type { MathOperation } from "@/features/learning-plan/learningPlan.types";
import { ALL_MATH_OPERATIONS } from "@/features/learning-plan/learningPlan.types";
import { TIMED_WRONG_ANSWER_PENALTY_SECONDS } from "@/features/learning-plan/learningPlan.types";
import {
    applyPracticeFocusOverride,
    validateLearningConfig,
} from "@/features/learning-plan/learningPlan.utils";
import { positiveFeedbackForCorrectCount } from "@/features/questions/answerOptionsGenerator";
import { normalizeEquationAnswerInput } from "@/features/questions/equationUnknown";
import { formatFraction } from "@/features/questions/fractions";
import type { MathQuestion } from "@/features/questions/question.types";
import {
  isArithmeticQuestion,
  isEquationUnknownQuestion,
  isEquationTwoUnknownQuestion,
  isFractionQuestion,
  isFractionVisualQuestion,
  isShapeRecognitionQuestion,
  isComparisonQuestion,
  isEquivalentExpressionQuestion,
  isClockQuestion,
  isPatternQuestion,
  isCalculusQuestion,
  isTrigonometryQuestion,
  isLogarithmQuestion,
  isGeometryQuestion,
  requiresMultipleChoiceQuestion,
  usesCompactQuestionCard,
} from "@/features/questions/question.types";
import { FractionBarModel } from "@/components/fractions/FractionModels";
import { createSessionQuestions } from "@/features/questions/questionGenerator";
import {
    answerOptionDisplayLabel,
    buildTimedSessionResult,
    submittedAnswerIsCorrect,
} from "@/features/questions/questionScoring";
import { useAppStore } from "@/store/useAppStore";
import { selectActiveLearningConfig } from "@/store/profileSelectors";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { radii, spacing } from "@/theme/spacing";
import { useAppTranslation } from "@/i18n/useAppTranslation";
import { parseNumberAnswer } from "@/utils/parseIntegerAnswer";
import { isCompleteFractionAnswer, parseFractionAnswer } from "@/utils/parseFractionAnswer";

const FEEDBACK_MS = 600;

function parseFocusOperationParam(
  raw: string | string[] | undefined,
): MathOperation | null {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s || typeof s !== "string") return null;
  return ALL_MATH_OPERATIONS.includes(s as MathOperation) ? (s as MathOperation) : null;
}

function formatSessionClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function TimedMathSessionView() {
  const { t } = useAppTranslation(["common", "questions"]);
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const learningConfig = useAppStore(selectActiveLearningConfig);
  const setLastSessionResult = useAppStore((s) => s.setLastSessionResult);
  const params = useLocalSearchParams<{ focus?: string | string[] }>();

  const focusOperation = useMemo(
    () => parseFocusOperationParam(params.focus),
    [params.focus],
  );

  const effectiveConfig = useMemo(() => {
    if (!learningConfig) return null;
    return applyPracticeFocusOverride(learningConfig, focusOperation);
  }, [learningConfig, focusOperation]);

  const validation = useMemo(
    () => (effectiveConfig ? validateLearningConfig(effectiveConfig) : null),
    [effectiveConfig],
  );

  const useKeyboard = effectiveConfig?.answerEntryMode === "keyboard";

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!useKeyboard) {
      setKeyboardOpen(false);
      return;
    }

    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const subShow = Keyboard.addListener(showEvt, () => {
      setKeyboardOpen(true);
    });
    const subHide = Keyboard.addListener(hideEvt, () => {
      setKeyboardOpen(false);
    });

    return () => {
      subShow.remove();
      subHide.remove();
      setKeyboardOpen(false);
    };
  }, [useKeyboard]);

  const [remaining, setRemaining] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [current, setCurrent] = useState<MathQuestion | null>(null);
  const [records, setRecords] = useState<
    { q: MathQuestion; a: number | string | null }[]
  >([]);
  const [selected, setSelected] = useState<number | string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [positiveLine, setPositiveLine] = useState(() => t("correct"));
  const [answerInputText, setAnswerInputText] = useState("");
  const [inputError, setInputError] = useState("");

  const finishingRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!effectiveConfig || !validation?.valid) {
      setRemaining(-1);
      setCurrent(null);
      setRecords([]);
      setSelected(null);
      setShowFeedback(false);
      setAnswerInputText("");
      setInputError("");
      setPaused(false);
      finishingRef.current = false;
      return;
    }
    setRemaining(effectiveConfig.timedDurationMinutes * 60);
    try {
      const qs = createSessionQuestions(effectiveConfig, 1);
      setCurrent(qs[0] ?? null);
    } catch {
      setCurrent(null);
    }
    setRecords([]);
    setSelected(null);
    setShowFeedback(false);
    setAnswerInputText("");
    setInputError("");
    setPaused(false);
    finishingRef.current = false;
  }, [effectiveConfig, validation?.valid]);

  useEffect(() => {
    if (
      finishingRef.current ||
      paused ||
      remaining <= 0 ||
      !effectiveConfig ||
      !validation?.valid
    ) {
      return;
    }
    const t = setInterval(() => {
      setRemaining((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [paused, remaining, effectiveConfig, validation?.valid]);

  useEffect(() => {
    if (
      remaining !== 0 ||
      finishingRef.current ||
      !effectiveConfig ||
      !validation?.valid
    )
      return;
    finishingRef.current = true;
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setPaused(true);
    setLastSessionResult(
      buildTimedSessionResult(
        records.map((r) => r.q),
        records.map((r) => r.a),
      ),
    );
    router.replace(ROUTES.result);
  }, [
    remaining,
    effectiveConfig,
    validation?.valid,
    records,
    setLastSessionResult,
    router,
  ]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setAnswerInputText("");
    setInputError("");
  }, [current?.id]);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const loadNextQuestion = useCallback(() => {
    if (!effectiveConfig) return;
    try {
      const qs = createSessionQuestions(effectiveConfig, 1);
      setCurrent(qs[0] ?? null);
    } catch {
      setCurrent(null);
    }
  }, [effectiveConfig]);

  const finalizeAnswer = useCallback(
    (answer: number | string | null) => {
      if (!current || !effectiveConfig || finishingRef.current) return;
      const qSnapshot = current;
      clearAdvanceTimer();
      setPaused(true);
      setSelected(answer);
      setShowFeedback(true);
      const ok = submittedAnswerIsCorrect(qSnapshot, answer);
      if (!ok && effectiveConfig.timedSubtractSecondsOnWrong) {
        setRemaining((r) =>
          Math.max(0, r - TIMED_WRONG_ANSWER_PENALTY_SECONDS),
        );
      }
      setRecords((prev) => [...prev, { q: qSnapshot, a: answer }]);
      if (ok) {
        const priorCorrect = records.filter(
          (r) => r.a !== null && submittedAnswerIsCorrect(r.q, r.a),
        ).length;
        const answered = records.length + 1;
        setPositiveLine(
          positiveFeedbackForCorrectCount(priorCorrect + 1, answered),
        );
      }

      advanceTimerRef.current = setTimeout(() => {
        advanceTimerRef.current = null;
        if (finishingRef.current) return;
        setShowFeedback(false);
        setSelected(null);
        loadNextQuestion();
        setPaused(false);
      }, FEEDBACK_MS);
    },
    [current, effectiveConfig, clearAdvanceTimer, loadNextQuestion],
  );

  const handleSelect = (value: number | string) => {
    if (!current || showFeedback || finishingRef.current) return;
    if (requireConfirmMc) {
      setSelected(value);
      return;
    }
    finalizeAnswer(value);
  };

  const handleConfirmMc = () => {
    if (!current || showFeedback || finishingRef.current || selected === null) return;
    finalizeAnswer(selected);
  };

  const handleCheckKeyboard = () => {
    const showKeyboardInput =
      useKeyboard && !requiresMultipleChoiceQuestion(current!);
    if (!current || !showKeyboardInput || showFeedback || finishingRef.current)
      return;
    if (current.kind === "equation_unknown") {
      const body = answerInputText.replace(/^\s*x\s*=\s*/i, "");
      if (normalizeEquationAnswerInput(body) === "") {
        setInputError(t("common:equationHint"));
        return;
      }
      setInputError("");
      Keyboard.dismiss();
      finalizeAnswer(normalizeEquationAnswerInput(body));
      return;
    }
    if (isArithmeticQuestion(current) && isFractionQuestion(current)) {
      const parsed = parseFractionAnswer(answerInputText);
      if (!parsed) {
        setInputError(t("common:fractionHint"));
        return;
      }
      setInputError("");
      Keyboard.dismiss();
      finalizeAnswer(formatFraction(parsed));
      return;
    }
    const n = parseNumberAnswer(answerInputText);
    if (n === null) {
      setInputError(t("common:numberHint"));
      return;
    }
    setInputError("");
    Keyboard.dismiss();
    finalizeAnswer(n);
  };

  const forcedMc =
    current !== null && requiresMultipleChoiceQuestion(current);
  const showKeyboardInput = useKeyboard && !forcedMc;
  const requireConfirmMc =
    Boolean(effectiveConfig?.confirmAnswerBeforeSubmit) && !showKeyboardInput;

  const scrollContentStyle = [
    styles.scrollInner,
    showKeyboardInput && keyboardOpen ? { paddingTop: insets.top } : null,
    keyboardOpen ? { paddingBottom: spacing.xl * 3 } : null,
  ];

  if (!effectiveConfig || !validation?.valid || !current) {
    return (
      <View style={styles.center}>
        <AppText variant="subtitle">{t("common:needValidSetup")}</AppText>
        <AppButton
          label={t("common:openSettings")}
          onPress={() => router.replace(ROUTES.learningPlan)}
        />
      </View>
    );
  }

  const progressLabel = t("common:questionTimeLeft", {
    n: records.length + 1,
    clock: formatSessionClock(remaining),
  });
  /** Timed run: keep wrong feedback short—no correct answer (clock is running). */
  const wrongLine = t("common:notQuiteNext");
  const isCorrectSelection =
    selected !== null && submittedAnswerIsCorrect(current, selected);
  const feedbackMessage =
    showFeedback && selected !== null
      ? isCorrectSelection
        ? positiveLine
        : wrongLine
      : "";

  const penaltyNote = effectiveConfig.timedSubtractSecondsOnWrong
    ? t("common:wrongAnswersSubtract", { n: TIMED_WRONG_ANSWER_PENALTY_SECONDS })
    : null;

  const answerPlaceholder =
    showKeyboardInput && !keyboardOpen && !(showFeedback && showKeyboardInput)
      ? isEquationUnknownQuestion(current)
        ? t("common:equationPlaceholder")
        : isArithmeticQuestion(current) && isFractionQuestion(current)
          ? t("common:fractionPlaceholder")
          : t("common:yourAnswer")
      : "";

  const parsedKeyboard =
    isArithmeticQuestion(current) && isFractionQuestion(current)
      ? isCompleteFractionAnswer(answerInputText)
      : parseNumberAnswer(answerInputText) !== null;
  const equationBodyNorm = normalizeEquationAnswerInput(
    answerInputText.replace(/^\s*x\s*=\s*/i, ""),
  );
  const equationInputReady =
    isEquationUnknownQuestion(current) && equationBodyNorm !== "";
  const geometryInputReady =
    isGeometryQuestion(current) &&
    current.answerKind === "number" &&
    parseNumberAnswer(answerInputText) !== null;
  const twoUnknownInputReady =
    isEquationTwoUnknownQuestion(current) &&
    parseNumberAnswer(answerInputText) !== null;
  const keyboardReady = isEquationUnknownQuestion(current)
    ? equationInputReady
    : isGeometryQuestion(current)
      ? geometryInputReady
      : isEquationTwoUnknownQuestion(current)
        ? twoUnknownInputReady
        : parsedKeyboard !== null;
  const inputLocked = showFeedback && showKeyboardInput;

  const showSubmitAction = !showFeedback && (showKeyboardInput || requireConfirmMc);
  const submitActionLabel = showKeyboardInput
    ? t("common:checkAnswer")
    : t("common:confirm");
  const submitActionDisabled = showKeyboardInput
    ? !keyboardReady
    : selected === null;

  const handleSubmitAction = () => {
    if (showKeyboardInput) {
      handleCheckKeyboard();
    } else {
      handleConfirmMc();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        {penaltyNote ? (
          <AppText variant="body" muted>
            {penaltyNote}
          </AppText>
        ) : null}

        <QuestionCard
          progressLabel={progressLabel}
          questionText={current.questionText}
          compact={usesCompactQuestionCard(current)}
        >
          {current.kind === "number_sense" && current.countTarget ? <BasicShapeDiagram shape={current.countTarget.shape} fill={SHAPE_COLOR_HEX[current.countTarget.color]} size={58} /> : null}
        </QuestionCard>
        {current.kind === "number_sense" && current.countingShapes ? <ShapeCountingVisual items={current.countingShapes} /> : null}
        {current.kind === "number_sense" && current.quantityShapeGroups ? <ShapeQuantityComparisonVisual {...current.quantityShapeGroups} /> : null}

        {isFractionVisualQuestion(current) ? (
          <View style={styles.fractionVisual}>
            <FractionBarModel
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
                    if (!showFeedback && showKeyboardInput) handleSubmitAction();
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
                  if (!showFeedback && showKeyboardInput) handleSubmitAction();
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
        ) : isArithmeticQuestion(current) ? (
          <View style={styles.options}>
            {current.answerOptions.map((opt) => (
              <AnswerOptionButton
                key={String(opt)}
                label={answerOptionDisplayLabel(current, opt)}
                value={opt}
                disabled={showFeedback}
                selected={selected === opt}
                onPress={handleSelect}
              />
            ))}
          </View>
        ) : isGeometryQuestion(current) ||
          isFractionVisualQuestion(current) ||
          isShapeRecognitionQuestion(current) ||
          isComparisonQuestion(current) ||
          isEquivalentExpressionQuestion(current) ||
          isClockQuestion(current) ||
          isPatternQuestion(current) ||
          isCalculusQuestion(current) ||
          isTrigonometryQuestion(current) ||
          isLogarithmQuestion(current) ||
          current.kind === "number_sense" ||
          isEquationTwoUnknownQuestion(current) ? (
          <View style={styles.optionsStacked}>
            {current.answerOptions.map((opt, index) => (
              <AnswerOptionButton
                key={`${String(opt)}-${index}`}
                label={answerOptionDisplayLabel(current, opt)}
                value={opt}
                disabled={showFeedback}
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
                disabled={showFeedback}
                selected={selected === opt}
                onPress={handleSelect}
              />
            ))}
          </View>
        )}

        {showSubmitAction ? (
          <AppButton
            label={submitActionLabel}
            onPress={handleSubmitAction}
            disabled={submitActionDisabled}
            accessibilityHint={
              showKeyboardInput
                ? t("questions:hintCheckTyped")
                : t("questions:hintSubmitSelected")
            }
          />
        ) : null}

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
  scrollInner: {
    flexGrow: 1,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  fractionVisual: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  shapeVisual: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  clockVisual: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  patternVisual: {
    alignItems: 'center',
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
