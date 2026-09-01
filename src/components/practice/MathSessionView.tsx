import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyboardScreenShell } from "@/components/common/KeyboardScreenShell";

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
import { ROUTES } from "@/constants/routes";
import type { MathOperation } from "@/features/learning-plan/learningPlan.types";
import { ALL_MATH_OPERATIONS } from "@/features/learning-plan/learningPlan.types";
import {
  applyPracticeFocusOverride,
  validateLearningConfig,
} from "@/features/learning-plan/learningPlan.utils";
import {
  positiveFeedbackForCorrectCount,
} from "@/features/questions/answerOptionsGenerator";
import { normalizeEquationAnswerInput } from "@/features/questions/equationUnknown";
import { formatFraction } from "@/features/questions/fractions";
import type { MathQuestion } from "@/features/questions/question.types";
import { keyboardAnswerIsReady, requiresMultipleChoiceQuestion } from "@/features/questions/questionAnswerInput";
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
  usesCompactQuestionCard,
} from "@/features/questions/question.types";
import { FractionVisualModel } from "@/components/fractions/FractionModels";
import {
  createSessionQuestions,
} from "@/features/questions/questionGenerator";
import {
  answerOptionDisplayLabel,
  answerOptionsArePlainNumbers,
  shouldStackAnswerOptions,
  buildPracticeSessionResult,
  buildQuizSessionResult,
  correctAnswerFeedbackLabel,
  submittedAnswerIsCorrect,
} from "@/features/questions/questionScoring";
import { useAppStore } from "@/store/useAppStore";
import { selectActiveLearningConfig } from "@/store/profileSelectors";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { radii, spacing } from "@/theme/spacing";
import { useAppTranslation } from "@/i18n/useAppTranslation";
import { parseNumberAnswer } from "@/utils/parseIntegerAnswer";
import { parseFractionAnswer } from "@/utils/parseFractionAnswer";
import { useKeyboardInset, useScrollToFocusedInput } from "@/utils/keyboardScroll";

function parseFocusOperationParam(
  raw: string | string[] | undefined,
): MathOperation | null {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s || typeof s !== "string") return null;
  return ALL_MATH_OPERATIONS.includes(s as MathOperation) ? (s as MathOperation) : null;
}

function countPriorCorrectAnswers(
  questions: MathQuestion[],
  answers: (number | string | null)[],
  beforeIndex: number,
): number {
  let count = 0;
  for (let i = 0; i < beforeIndex; i++) {
    const answer = answers[i];
    const question = questions[i];
    if (answer !== null && question && submittedAnswerIsCorrect(question, answer)) {
      count++;
    }
  }
  return count;
}

type SessionMode = "practice" | "quiz";

type MathSessionViewProps = {
  mode: SessionMode;
};

export function MathSessionView({ mode }: MathSessionViewProps) {
  const { t } = useAppTranslation(["common", "questions"]);
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const keyboardInset = useKeyboardInset();
  const learningConfig = useAppStore(selectActiveLearningConfig);
  const setLastSessionResult = useAppStore((s) => s.setLastSessionResult);
  const params = useLocalSearchParams<{ focus?: string | string[] }>();

  const focusOperation = useMemo(
    () => (mode === "practice" ? parseFocusOperationParam(params.focus) : null),
    [mode, params.focus],
  );

  const effectiveConfig = useMemo(() => {
    if (!learningConfig) return null;
    return applyPracticeFocusOverride(learningConfig, focusOperation);
  }, [learningConfig, focusOperation]);

  const questions = useMemo<MathQuestion[]>(() => {
    if (!effectiveConfig) return [];
    const validation = validateLearningConfig(effectiveConfig);
    if (!validation.valid) return [];
    try {
      return createSessionQuestions(
        effectiveConfig,
        effectiveConfig.questionsCount,
      );
    } catch {
      return [];
    }
  }, [effectiveConfig]);

  const useKeyboard = effectiveConfig?.answerEntryMode === "keyboard";

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [selected, setSelected] = useState<number | string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [positiveLine, setPositiveLine] = useState(() => t("correct"));
  const [timedOut, setTimedOut] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [answerInputText, setAnswerInputText] = useState("");
  const [inputError, setInputError] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrollToInput = useScrollToFocusedInput(scrollRef, keyboardInset);

  const clearQuestionTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSecondsLeft(null);
  }, []);

  useEffect(() => {
    setIndex(0);
    setAnswers(Array.from({ length: questions.length }, () => null));
    setSelected(null);
    setShowFeedback(false);
    setTimedOut(false);
    setAnswerInputText("");
    setInputError("");
  }, [questions]);

  const current = questions[index];
  const isLast = questions.length > 0 && index === questions.length - 1;
  const forcedMc =
    current !== undefined && requiresMultipleChoiceQuestion(current);
  const showKeyboardInput = useKeyboard && !forcedMc;
  const requireConfirmMc =
    Boolean(effectiveConfig?.confirmAnswerBeforeSubmit) && !showKeyboardInput;

  useEffect(() => {
    clearQuestionTimer();
    setTimedOut(false);

    if (!effectiveConfig?.timerEnabled || !current) {
      return;
    }

    const duration = effectiveConfig.timerSecondsPerQuestion;
    setSecondsLeft(duration);
    let remaining = duration;

    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setSecondsLeft(null);
        setSelected(null);
        setAnswerInputText("");
        setInputError("");
        Keyboard.dismiss();
        setTimedOut(true);
        if (mode === "practice") {
          setShowFeedback(true);
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    index,
    current,
    effectiveConfig?.timerEnabled,
    effectiveConfig?.timerSecondsPerQuestion,
    mode,
    clearQuestionTimer,
  ]);

  useEffect(() => {
    setAnswerInputText("");
    setInputError("");
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [index, current?.id]);

  const resetForQuestion = (nextIndex: number) => {
    setIndex(nextIndex);
    setSelected(null);
    setShowFeedback(false);
    setTimedOut(false);
    setAnswerInputText("");
    setInputError("");
  };

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

  const handleSelect = (value: number | string) => {
    if (!current) return;
    if (timedOut) return;
    if (mode === "practice" && showFeedback) return;
    setSelected(value);
    if (requireConfirmMc) return;
    clearQuestionTimer();
    if (mode === "practice") {
      setShowFeedback(true);
      if (submittedAnswerIsCorrect(current, value)) {
        setPositiveLine(
          positiveFeedbackForCorrectCount(
            countPriorCorrectAnswers(questions, answers, index) + 1,
            questions.length,
          ),
        );
      }
    }
  };

  const handleCheckPracticeKeyboard = () => {
    if (!current || !useKeyboard || mode !== "practice") return;
    if (current.kind === "equation_unknown") {
      const body = answerInputText.replace(/^\s*x\s*=\s*/i, "");
      if (normalizeEquationAnswerInput(body) === "") {
        setInputError(t("common:equationHint"));
        return;
      }
      setInputError("");
      Keyboard.dismiss();
      clearQuestionTimer();
      setSelected(body);
      setShowFeedback(true);
      if (submittedAnswerIsCorrect(current, body)) {
        setPositiveLine(
          positiveFeedbackForCorrectCount(
            countPriorCorrectAnswers(questions, answers, index) + 1,
            questions.length,
          ),
        );
      }
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
    clearQuestionTimer();
    setSelected(parsed);
    setShowFeedback(true);
    if (submittedAnswerIsCorrect(current, parsed)) {
      setPositiveLine(
        positiveFeedbackForCorrectCount(
          countPriorCorrectAnswers(questions, answers, index) + 1,
          questions.length,
        ),
      );
    }
  };

  const handlePrimaryAction = () => {
    if (mode === "practice" && !showFeedback && showKeyboardInput) {
      handleCheckPracticeKeyboard();
      return;
    }
    handleNext();
  };

  const handleNext = () => {
    clearQuestionTimer();
    if (!current || !effectiveConfig) return;

    if (
      requireConfirmMc &&
      mode === "practice" &&
      !showFeedback &&
      selected !== null
    ) {
      setShowFeedback(true);
      if (submittedAnswerIsCorrect(current, selected)) {
        setPositiveLine(
          positiveFeedbackForCorrectCount(
            countPriorCorrectAnswers(questions, answers, index) + 1,
            questions.length,
          ),
        );
      }
      return;
    }

    let answer: number | string | null = selected;

    if (timedOut) {
      answer = null;
    } else if (showKeyboardInput) {
      if (mode === "practice") {
        if (selected === null || !showFeedback) return;
        answer = selected;
      } else {
        if (selected !== null) {
          answer = selected;
        } else if (current.kind === "equation_unknown") {
          const body = answerInputText.replace(/^\s*x\s*=\s*/i, "");
          if (normalizeEquationAnswerInput(body) === "") {
            setInputError(t("common:equationHint"));
            return;
          }
          setInputError("");
          answer = normalizeEquationAnswerInput(body);
        } else {
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
          answer = parsed;
        }
      }
    } else {
      if (selected === null) return;
      if (mode === "practice" && !showFeedback) return;
      answer = selected;
    }

    Keyboard.dismiss();

    const nextAnswers = [...answers];
    nextAnswers[index] = answer;

    if (isLast) {
      if (mode === "quiz") {
        setLastSessionResult(buildQuizSessionResult(questions, nextAnswers));
      } else {
        setLastSessionResult(
          buildPracticeSessionResult(questions, nextAnswers),
        );
      }
      router.replace(ROUTES.result);
      return;
    }

    setAnswers(nextAnswers);
    resetForQuestion(index + 1);
  };

  const inputLocked =
    showKeyboardInput && (timedOut || (mode === "practice" && showFeedback));

  const scrollContentStyle = [
    styles.scrollInner,
    {
      paddingBottom: Math.max(spacing.xl, insets.bottom) + keyboardInset,
    },
  ];

  const answerPlaceholder =
    showKeyboardInput && !inputLocked
      ? isEquationUnknownQuestion(current)
        ? t("common:equationPlaceholder")
        : isArithmeticQuestion(current) && isFractionQuestion(current)
          ? t("common:fractionPlaceholder")
          : t("common:yourAnswer")
      : "";

  if (!effectiveConfig || questions.length === 0 || !current) {
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

  const progressLabel = t("common:questionOf", {
    index: index + 1,
    total: questions.length,
  });
  const correctLabel = correctAnswerFeedbackLabel(current);
  const incorrectLine = t("common:incorrectAnswer", { answer: correctLabel });

  const optionDisabled = timedOut || (mode === "practice" && showFeedback);

  const isCorrectSelection =
    selected !== null && submittedAnswerIsCorrect(current, selected);

  const feedbackMessage =
    mode === "practice" && showFeedback && (selected !== null || timedOut)
      ? timedOut
        ? t("common:timeUpAnswer", { answer: correctLabel })
        : isCorrectSelection
          ? positiveLine
          : incorrectLine
      : "";

  const keyboardInputReady = keyboardAnswerIsReady(current, answerInputText);
  const quizKeyboardReady = selected !== null || keyboardInputReady;
  const nextDisabled = timedOut
    ? false
    : showKeyboardInput
      ? mode === "practice"
        ? !showFeedback
          ? !keyboardInputReady
          : false
        : !quizKeyboardReady
      : requireConfirmMc && mode === "practice" && !showFeedback
        ? selected === null
        : selected === null || (mode === "practice" && !showFeedback);

  const awaitingCheck =
    mode === "practice" && !showFeedback && (showKeyboardInput || requireConfirmMc);

  const primaryActionLabel = awaitingCheck
    ? showKeyboardInput
      ? t("common:checkAnswer")
      : t("common:confirm")
    : isLast
      ? t("common:seeResults")
      : t("common:next");

  return (
    <KeyboardScreenShell
      style={styles.keyboardRoot}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        removeClippedSubviews={false}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (showFeedback) scrollRef.current?.scrollToEnd({ animated: true });
        }}
      >
        <QuestionCard
          progressLabel={progressLabel}
          questionText={current.questionText}
          compact={usesCompactQuestionCard(current)}
          timerProgress={
            effectiveConfig.timerEnabled
              ? timedOut
                ? 0
                : (secondsLeft ?? effectiveConfig.timerSecondsPerQuestion) /
                  effectiveConfig.timerSecondsPerQuestion
              : undefined
          }
          timerAccessibilityLabel={
            effectiveConfig.timerEnabled
              ? t("common:secondsLeft", {
                  seconds: timedOut
                    ? 0
                    : secondsLeft ?? effectiveConfig.timerSecondsPerQuestion,
                })
              : undefined
          }
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
                  accessibilityLabel={t("common:valueForX")}
                  editable={!inputLocked}
                  onFocus={scrollToInput}
                  onSubmitEditing={() => {
                    if (mode === "practice" && !showFeedback)
                      handlePrimaryAction();
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
                  if (mode === "practice" && !showFeedback)
                    handlePrimaryAction();
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
                disabled={optionDisabled}
                selected={selected === opt}
                onPress={handleSelect}
                stacked={shouldStackAnswerOptions(current)}
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
        ) : (
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
                label={`x=${opt}`}
                value={opt}
                disabled={optionDisabled}
                selected={selected === opt}
                onPress={handleSelect}
                stacked={shouldStackAnswerOptions(current)}
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
              : mode === "practice"
                ? t("questions:hintNextAfterFeedback")
                : t("questions:hintNext")
          }
        />

        {mode === "practice" && showFeedback && (selected !== null || timedOut) ? (
          <FeedbackMessage
            variant={isCorrectSelection ? "correct" : "incorrect"}
            message={feedbackMessage}
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
