import { useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    AccessibilityInfo,
    Keyboard,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyboardScreenShell } from "@/components/common/KeyboardScreenShell";

import { AnalogClockFace } from "@/components/clock/AnalogClockFace";
import { AppButton } from "@/components/common/AppButton";
import { AppText } from "@/components/common/AppText";
import { FractionVisualModel } from "@/components/fractions/FractionModels";
import { TrigonometryShapeDiagram } from "@/components/learn/TrigonometryShapeDiagram";
import { LimitQuestionDisplay } from "@/components/limits/LimitQuestionDisplay";
import {
    ShapeCountingVisual,
    ShapeQuantityComparisonVisual,
} from "@/components/number-sense/ShapeQuantityVisual";
import { ColoredShapeSequence } from "@/components/patterns/ColoredShapeSequence";
import {
    ShapePatternFigure,
    ShapePatternSequence,
} from "@/components/patterns/ShapePatternFigure";
import { AnswerOptionButton } from "@/components/practice/AnswerOptionButton";
import { FeedbackMessage } from "@/components/practice/FeedbackMessage";
import { QuestionCard } from "@/components/practice/QuestionCard";
import {
    SessionAnswerTextInput,
    SessionEquationAnswerInput,
} from "@/components/practice/SessionAnswerTextInput";
import { BasicShapeDiagram } from "@/components/shapes/BasicShapeDiagram";
import { ROUTES } from "@/constants/routes";
import {
    ALL_MATH_OPERATIONS,
    type MathOperation,
} from "@/features/learning-plan/learningPlan.types";
import {
    applyPracticeFocusOverride,
    hasAnyQuestionSource,
    validateLearningConfig,
} from "@/features/learning-plan/learningPlan.utils";
import { adjustedTimedRemainingSeconds } from "@/features/learning-plan/timedRun.utils";
import { positiveFeedbackForCorrectCount } from "@/features/questions/answerOptionsGenerator";
import { normalizeEquationAnswerInput } from "@/features/questions/equationUnknown";
import { formatFraction } from "@/features/questions/fractions";
import type { MathQuestion } from "@/features/questions/question.types";
import {
    isArithmeticQuestion,
    isClockQuestion,
    isEquationTwoUnknownQuestion,
    isEquationUnknownQuestion,
    isFractionQuestion,
    isFractionVisualQuestion,
    isGeometryQuestion,
    isPatternQuestion,
    isShapeRecognitionQuestion,
    isTrigonometryQuestion,
    usesCompactQuestionCard,
} from "@/features/questions/question.types";
import { requiresMultipleChoiceQuestion } from "@/features/questions/questionAnswerInput";
import { createSessionQuestions } from "@/features/questions/questionGenerator";
import {
    answerOptionDisplayLabel,
    answerOptionsArePlainNumbers,
    buildTimedSessionResult,
    shouldStackAnswerOptions,
    submittedAnswerIsCorrect,
} from "@/features/questions/questionScoring";
import { SHAPE_COLOR_HEX } from "@/features/shapes/shapeColors";
import { useAppTranslation } from "@/i18n/useAppTranslation";
import { selectActiveLearningConfig } from "@/store/profileSelectors";
import { useAppStore } from "@/store/useAppStore";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { radii, spacing } from "@/theme/spacing";
import {
    useKeyboardInset,
    useScrollToFocusedInput,
} from "@/utils/keyboardScroll";
import {
    isCompleteFractionAnswer,
    parseFractionAnswer,
} from "@/utils/parseFractionAnswer";
import { parseNumberAnswer } from "@/utils/parseIntegerAnswer";

const FEEDBACK_MS = 600;

function parseFocusOperationParam(
  raw: string | string[] | undefined,
): MathOperation | null {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s || typeof s !== "string") return null;
  return ALL_MATH_OPERATIONS.includes(s as MathOperation)
    ? (s as MathOperation)
    : null;
}

function formatSessionClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function formatTimeDelta(delta: number): string {
  return delta > 0 ? `+${delta}s` : `−${Math.abs(delta)}s`;
}

export function TimedMathSessionView() {
  const { t } = useAppTranslation(["common", "questions"]);
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const keyboardInset = useKeyboardInset();
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

  const scrollRef = useRef<ScrollView>(null);
  const scrollToInput = useScrollToFocusedInput(scrollRef, keyboardInset);

  const [remaining, setRemaining] = useState(-1);
  const [current, setCurrent] = useState<MathQuestion | null>(null);
  const [records, setRecords] = useState<
    { q: MathQuestion; a: number | string | null }[]
  >([]);
  const [selected, setSelected] = useState<number | string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [positiveLine, setPositiveLine] = useState(() => t("correct"));
  const [answerInputText, setAnswerInputText] = useState("");
  const [inputError, setInputError] = useState("");
  const [feedbackTimeDelta, setFeedbackTimeDelta] = useState<number | null>(
    null,
  );

  const finishingRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenQuestionTextRef = useRef(new Set<string>());
  const survivedSecondsRef = useRef(0);

  useEffect(() => {
    if (!effectiveConfig || !validation?.valid) {
      setRemaining(-1);
      setCurrent(null);
      setRecords([]);
      setSelected(null);
      setShowFeedback(false);
      setAnswerInputText("");
      setInputError("");
      finishingRef.current = false;
      survivedSecondsRef.current = 0;
      return;
    }
    setRemaining(Math.round(effectiveConfig.timedDurationMinutes * 60));
    setFeedbackTimeDelta(null);
    survivedSecondsRef.current = 0;
    seenQuestionTextRef.current.clear();
    try {
      const qs = createSessionQuestions(effectiveConfig, 1, {
        seenQuestionText: seenQuestionTextRef.current,
      });
      setCurrent(qs[0] ?? null);
    } catch {
      setCurrent(null);
    }
    setRecords([]);
    setSelected(null);
    setShowFeedback(false);
    setAnswerInputText("");
    setInputError("");
    finishingRef.current = false;
  }, [effectiveConfig, validation?.valid]);

  useEffect(() => {
    if (finishingRef.current || !effectiveConfig || !validation?.valid) {
      return;
    }
    const t = setInterval(() => {
      if (finishingRef.current) return;
      survivedSecondsRef.current += 1;
      setRemaining((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [effectiveConfig, validation?.valid]);

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
    setLastSessionResult(
      buildTimedSessionResult(
        records.map((r) => r.q),
        records.map((r) => r.a),
        {
          survivedSeconds: survivedSecondsRef.current,
          initialSeconds: Math.round(effectiveConfig.timedDurationMinutes * 60),
          bonusSeconds: effectiveConfig.timedCorrectBonusSeconds,
          penaltySeconds: effectiveConfig.timedWrongPenaltySeconds,
        },
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
    scrollRef.current?.scrollTo({ y: 0, animated: false });
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
      const qs = createSessionQuestions(effectiveConfig, 1, {
        seenQuestionText: seenQuestionTextRef.current,
      });
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
      setSelected(answer);
      setShowFeedback(true);
      const ok = submittedAnswerIsCorrect(qSnapshot, answer);
      const configuredDelta = ok
        ? effectiveConfig.timedCorrectBonusSeconds
        : -effectiveConfig.timedWrongPenaltySeconds;
      setFeedbackTimeDelta(configuredDelta !== 0 ? configuredDelta : null);
      if (configuredDelta !== 0) {
        setRemaining((currentRemaining) =>
          adjustedTimedRemainingSeconds(currentRemaining, configuredDelta),
        );
        const seconds = Math.abs(configuredDelta);
        void AccessibilityInfo.announceForAccessibility(
          t(
            configuredDelta > 0
              ? "common:timeAddedA11y"
              : "common:timeRemovedA11y",
            {
              n: seconds,
            },
          ),
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
        setFeedbackTimeDelta(null);
        loadNextQuestion();
      }, FEEDBACK_MS);
    },
    [current, effectiveConfig, clearAdvanceTimer, loadNextQuestion, records, t],
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
    if (!current || showFeedback || finishingRef.current || selected === null)
      return;
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
    if (
      (isArithmeticQuestion(current) && isFractionQuestion(current)) ||
      isFractionVisualQuestion(current)
    ) {
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

  const forcedMc = current !== null && requiresMultipleChoiceQuestion(current);
  const showKeyboardInput = useKeyboard && !forcedMc;
  const requireConfirmMc =
    Boolean(effectiveConfig?.confirmAnswerBeforeSubmit) && !showKeyboardInput;

  const scrollContentStyle = [
    styles.scrollInner,
    {
      paddingBottom: Math.max(spacing.xl, insets.bottom) + keyboardInset,
    },
  ];

  if (!effectiveConfig || !validation?.valid || !current) {
    return (
      <View style={styles.center}>
        <AppText variant="subtitle">
          {effectiveConfig && !hasAnyQuestionSource(effectiveConfig)
            ? t("common:noActiveTopics")
            : t("common:needValidSetup")}
        </AppText>
        <AppButton
          label={t("common:openSettings")}
          icon="settings-outline"
          onPress={() => router.replace(ROUTES.learningPlan)}
        />
      </View>
    );
  }

  const initialSeconds = Math.round(effectiveConfig.timedDurationMinutes * 60);
  const sessionSeconds = Math.max(0, remaining);
  const sessionTimerProgress =
    initialSeconds > 0 ? Math.min(1, sessionSeconds / initialSeconds) : 0;

  const progressLabel = t("common:questionTimeLeft", {
    n: records.length + 1,
    clock: formatSessionClock(sessionSeconds),
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

  const adjustmentNote =
    effectiveConfig.timedWrongPenaltySeconds > 0 &&
    effectiveConfig.timedCorrectBonusSeconds > 0
      ? t("common:timedAdjustmentsSummary", {
          bonus: effectiveConfig.timedCorrectBonusSeconds,
          penalty: effectiveConfig.timedWrongPenaltySeconds,
        })
      : effectiveConfig.timedWrongPenaltySeconds > 0
        ? t("common:wrongAnswersSubtract", {
            n: effectiveConfig.timedWrongPenaltySeconds,
          })
        : effectiveConfig.timedCorrectBonusSeconds > 0
          ? t("common:correctAnswersAdd", {
              n: effectiveConfig.timedCorrectBonusSeconds,
            })
          : null;

  const feedbackDetail =
    feedbackTimeDelta !== null ? formatTimeDelta(feedbackTimeDelta) : undefined;

  const answerPlaceholder =
    showKeyboardInput && !(showFeedback && showKeyboardInput)
      ? isEquationUnknownQuestion(current)
        ? t("common:equationPlaceholder")
        : (isArithmeticQuestion(current) && isFractionQuestion(current)) ||
            isFractionVisualQuestion(current)
          ? t("common:fractionPlaceholder")
          : t("common:yourAnswer")
      : "";

  const parsedKeyboard =
    (isArithmeticQuestion(current) && isFractionQuestion(current)) ||
    isFractionVisualQuestion(current)
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

  const showSubmitAction =
    !showFeedback && (showKeyboardInput || requireConfirmMc);
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
    <KeyboardScreenShell
      style={styles.keyboardRoot}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        removeClippedSubviews={false}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (showFeedback) scrollRef.current?.scrollToEnd({ animated: true });
        }}
      >
        {adjustmentNote ? (
          <AppText variant="body" muted>
            {adjustmentNote}
          </AppText>
        ) : null}

        <QuestionCard
          progressLabel={progressLabel}
          questionText={current.questionText}
          compact={usesCompactQuestionCard(current)}
          timerProgress={sessionTimerProgress}
          timerAccessibilityLabel={t("common:secondsLeft", {
            seconds: sessionSeconds,
          })}
          questionContent={
            current.kind === "limit" ? (
              <LimitQuestionDisplay
                approach={current.approach}
                expression={current.expression}
                fraction={current.expressionFraction}
              />
            ) : undefined
          }
        >
          {current.kind === "number_sense" && current.countTarget ? (
            <BasicShapeDiagram
              shape={current.countTarget.shape}
              fill={SHAPE_COLOR_HEX[current.countTarget.color]}
              size={58}
            />
          ) : null}
        </QuestionCard>
        {current.kind === "number_sense" && current.countingShapes ? (
          <ShapeCountingVisual items={current.countingShapes} />
        ) : null}
        {current.kind === "number_sense" && current.quantityShapeGroups ? (
          <ShapeQuantityComparisonVisual {...current.quantityShapeGroups} />
        ) : null}

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
            <BasicShapeDiagram
              shape={current.shape}
              fill={SHAPE_COLOR_HEX[current.color]}
            />
          </View>
        ) : null}

        {isTrigonometryQuestion(current) ? (
          <View style={styles.shapeVisual}>
            <TrigonometryShapeDiagram diagram={current.diagram} />
          </View>
        ) : null}

        {isClockQuestion(current) &&
        current.subtype === "read_analog" &&
        current.displayTime ? (
          <View style={styles.clockVisual}>
            <AnalogClockFace time={current.displayTime} />
          </View>
        ) : null}

        {isPatternQuestion(current) && current.sequenceColoredShapes ? (
          <View style={styles.patternVisual}>
            <ColoredShapeSequence items={current.sequenceColoredShapes} />
          </View>
        ) : isPatternQuestion(current) &&
          current.subtype === "shape_pattern" &&
          current.sequenceShapes ? (
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
                  accessibilityLabel={t("common:valueForX")}
                  editable={!inputLocked}
                  onFocus={scrollToInput}
                  onSubmitEditing={() => {
                    if (!showFeedback && showKeyboardInput)
                      handleSubmitAction();
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
                accessibilityLabel={t("common:yourAnswer")}
                editable={!inputLocked}
                onFocus={scrollToInput}
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
        ) : answerOptionsArePlainNumbers(current) ? (
          <View
            style={
              shouldStackAnswerOptions(current)
                ? styles.optionsStacked
                : styles.options
            }
          >
            {current.answerOptions.map((opt) => (
              <AnswerOptionButton
                key={String(opt)}
                label={answerOptionDisplayLabel(current, opt)}
                value={opt}
                disabled={showFeedback}
                selected={selected === opt}
                onPress={handleSelect}
                stacked={shouldStackAnswerOptions(current)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.optionsStacked}>
            {current.answerOptions.map((opt, index) => (
              <AnswerOptionButton
                key={`${String(opt)}-${index}`}
                label={
                  isEquationUnknownQuestion(current)
                    ? `x=${opt}`
                    : answerOptionDisplayLabel(current, opt)
                }
                value={opt}
                disabled={showFeedback}
                selected={selected === opt}
                onPress={handleSelect}
                stacked
              >
                {isPatternQuestion(current) &&
                current.subtype === "colored_shape_pattern"
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
                  : isPatternQuestion(current) &&
                      current.subtype === "shape_pattern"
                    ? (() => {
                        const visual = current.shapePatternAnswerOptions?.find(
                          (item) => item.label === String(opt),
                        );
                        return visual ? (
                          <BasicShapeDiagram
                            shape={visual.shape}
                            fill="transparent"
                            stroke={colors.text}
                            size={58}
                          />
                        ) : (
                          <ShapePatternFigure icon={String(opt)} />
                        );
                      })()
                    : undefined}
              </AnswerOptionButton>
            ))}
          </View>
        )}

        {showSubmitAction ? (
          <AppButton
            label={submitActionLabel}
            icon="checkmark"
            textPosition="center"
            iconPosition="right"
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
            detail={feedbackDetail}
          />
        ) : null}
      </ScrollView>
    </KeyboardScreenShell>
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
