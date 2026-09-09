import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Pressable, StyleSheet, Switch, TextInput, View, type ScrollView } from "react-native";

import { AgeNumberInput } from "@/components/common/AgeNumberInput";
import { AppButton } from "@/components/common/AppButton";
import { AppText } from "@/components/common/AppText";
import { Card } from "@/components/common/Card";
import { SETTINGS_TOPIC_CATEGORIES } from "@/components/settings/settingsTopicCategories";
import { AnswerOptionsSelector } from "@/components/learning-plan/AnswerOptionsSelector";
import { FractionDenominatorModeExample, formatFractionModeExampleA11y } from "@/components/fractions/FractionNotation";
import { CompactSwitch } from "@/components/learning-plan/CompactSwitch";
import { FocusedOperationContext } from "@/components/learning-plan/FocusedOperationContext";
import { EquivalentExpressionsSettingsCard } from "@/components/learning-plan/EquivalentExpressionsSettingsCard";
import { DifferentiationSettingsCard } from "@/components/learning-plan/DifferentiationSettingsCard";
import { TrigonometrySettingsCard } from "@/components/learning-plan/TrigonometrySettingsCard";
import { LogarithmSettingsCard } from "@/components/learning-plan/LogarithmSettingsCard";
import { IntegrationSettingsCard } from "@/components/learning-plan/IntegrationSettingsCard";
import { AdvancedEquationsSettingsCard, LimitsSettingsCard } from "@/components/learning-plan/AdvancedTopicsSettingsCards";
import { ClockSettingsCard } from "@/components/learning-plan/ClockSettingsCard";
import { ComparisonSettingsCard } from "@/components/learning-plan/ComparisonSettingsCard";
import { EquationTwoUnknownsSettingsCard } from "@/components/learning-plan/EquationTwoUnknownsSettingsCard";
import { FractionVisualSettingsCard } from "@/components/learning-plan/FractionVisualSettingsCard";
import { ShapeRecognitionSettingsCard } from "@/components/learning-plan/ShapeRecognitionSettingsCard";
import { NumberSenseSettingsCard } from "@/components/learning-plan/NumberSenseSettingsCard";
import { GeometrySettingsCard } from "@/components/learning-plan/GeometrySettingsCard";
import { PatternsSettingsCard } from "@/components/learning-plan/PatternsSettingsCard";
import { DiscreteMaxSlider } from "@/components/learning-plan/DiscreteMaxSlider";
import { DiscreteMinuteSlider } from "@/components/learning-plan/DiscreteMinuteSlider";
import { OneToTenFactorPicker } from "@/components/learning-plan/OneToTenFactorPicker";
import { OperationConfigCard } from "@/components/learning-plan/OperationConfigCard";
import { RangeSelector } from "@/components/learning-plan/RangeSelector";
import { TimerSettings } from "@/components/learning-plan/TimerSettings";
import { TimeAdjustmentSlider } from "@/components/learning-plan/TimeAdjustmentSlider";
import {
  ADDITION_ANSWER_MAX_OPTIONS,
  DIVISION_ANSWER_RANGE_PRESETS,
} from "@/constants/ranges";
import {
  LEARNER_NAME_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
} from "@/constants/inputLimits";
import { getOperationLabel } from "@/constants/operationLabels";
import type {
  FractionDenominatorMode,
  MathLearningConfig,
  MathOperation,
  MultiplicationSecondFactorSource,
} from "@/features/learning-plan/learningPlan.types";
import { questionStyleLabel } from "@/i18n/labels";
import { useAppTranslation } from "@/i18n/useAppTranslation";
import {
  FRACTION_DENOMINATOR_MODE_OPTIONS,
  MULTIPLICATION_SECOND_FACTOR_OPTIONS,
  ORDER_OF_OPS_OPERAND_MAX_OPTIONS,
  QUESTION_COUNT_OPTIONS,
  SQUARE_OPERAND_MAX_OPTIONS,
  SQUARE_ROOT_ROOT_MAX_OPTIONS,
  TIMED_CORRECT_BONUS_SECONDS_MAX,
  TIMED_WRONG_PENALTY_SECONDS_MAX,
} from "@/features/learning-plan/learningPlan.types";
import {
  ensureLearningConfigShape,
  validateLearningConfig,
} from "@/features/learning-plan/learningPlan.utils";
import type {
  ChildProfile,
  ChildProfilePersonal,
} from "@/features/onboarding/onboarding.types";
import { colors } from "@/theme/colors";
import { radii, spacing } from "@/theme/spacing";
import { useScrollToFocusedInput } from "@/utils/keyboardScroll";

type LearningPlanEditorProps = {
  initialConfig: MathLearningConfig;
  profile: ChildProfile;
  onSave: (config: MathLearningConfig, personal: ChildProfilePersonal) => void;
  onDraftChange?: (
    config: MathLearningConfig,
    personal: ChildProfilePersonal,
    dirty: boolean,
  ) => void;
  focusedOperation?: MathOperation;
  scope?: "all" | "profile" | "session" | "topics";
  visibleOperations?: readonly string[];
  hideSaveButton?: boolean;
  scrollRef?: RefObject<ScrollView | null>;
};

const FRACTION_MODE_LABEL_KEYS: Record<FractionDenominatorMode, string> = {
  same_only: "settings:sameDenominator",
  different_only: "settings:differentDenominators",
  mixed: "settings:mixBoth",
};

const MULTIPLICATION_POOL_LABEL_KEYS: Record<
  MultiplicationSecondFactorSource,
  { labelKey: string; hintKey: string }
> = {
  selection_only: { labelKey: "settings:selectedOnly", hintKey: "settings:selectedOnlyHint" },
  one_to_ten: { labelKey: "settings:pool1to10", hintKey: "settings:pool1to10Hint" },
  one_to_twenty: { labelKey: "settings:pool1to20", hintKey: "settings:pool1to20Hint" },
};

const FRACTION_EXAMPLE_OPERATOR: Partial<Record<MathOperation, string>> = {
  addition: "+",
  subtraction: "−",
  multiplication: "×",
  division: "÷",
};

function fractionExampleOperator(operation: MathOperation): string {
  return FRACTION_EXAMPLE_OPERATOR[operation] ?? "+";
}

function isOperationsTopicScreen(visibleOperations?: readonly string[]): boolean {
  const operations = SETTINGS_TOPIC_CATEGORIES.find((category) => category.id === 'operations')
    ?.operations;
  if (!operations || !visibleOperations || visibleOperations.length !== operations.length) {
    return false;
  }
  return operations.every((operation) => visibleOperations.includes(operation));
}

export function LearningPlanEditor({
  initialConfig,
  profile,
  onSave,
  onDraftChange,
  focusedOperation,
  scope = "all",
  visibleOperations,
  hideSaveButton = false,
  scrollRef,
}: LearningPlanEditorProps) {
  const { t } = useAppTranslation(["settings", "common", "questions"]);
  const fallbackScrollRef = useRef<ScrollView>(null);
  const scrollToInput = useScrollToFocusedInput(scrollRef ?? fallbackScrollRef);
  const [config, setConfig] = useState<MathLearningConfig>(() =>
    ensureLearningConfigShape(initialConfig),
  );
  const [profileName, setProfileName] = useState(profile.profileName);
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState<number | null>(profile.age);
  const validation = useMemo(
    () => validateLearningConfig(config, { requireQuestionSource: false }),
    [config],
  );
  const profileValid = name.trim().length > 0 && profileName.trim().length > 0;
  const personal = useMemo<ChildProfilePersonal>(
    () => ({
      id: profile.id,
      profileName: profileName.trim(),
      name: name.trim(),
      age,
      mathKnowledgeLevel: profile.mathKnowledgeLevel,
    }),
    [age, name, profile.id, profile.mathKnowledgeLevel, profileName],
  );
  const dirty = useMemo(
    () =>
      JSON.stringify(config) !== JSON.stringify(ensureLearningConfigShape(initialConfig)) ||
      profileName !== profile.profileName ||
      name !== profile.name ||
      age !== profile.age,
    [age, config, initialConfig, name, profile, profileName],
  );
  const operationVisibility = useMemo(
    () =>
      visibleOperations
        ? new Set<string>(visibleOperations)
        : focusedOperation ?? null,
    [focusedOperation, visibleOperations],
  );
  const showPersonal = scope === "all";
  const showTopics = scope === "all" || scope === "topics" || Boolean(focusedOperation);
  const showSession = (scope === "all" || scope === "session") && !focusedOperation;
  const showOperationsSliderHelp = isOperationsTopicScreen(visibleOperations);

  useEffect(() => {
    onDraftChange?.(config, personal, dirty);
  }, [config, dirty, onDraftChange, personal]);

  const setQuestionCount = (n: number) =>
    setConfig((c) => ({ ...c, questionsCount: n }));

  const renderQuestionSwitch = (
    label: string,
    operation: MathOperation,
    enabled: boolean,
    selected: boolean,
    onToggle: () => void,
  ) => (
    <View style={styles.rowBetween}>
      <AppText variant="label" style={styles.toggleRowLabel}>
        {label}
      </AppText>
      <View style={styles.settingsSwitchWrap}>
        <CompactSwitch
          accessibilityLabel={`${getOperationLabel(operation, t)} ${label}`}
          value={selected}
          onValueChange={onToggle}
          disabled={!enabled}
        />
      </View>
    </View>
  );

  const renderFractionSettings = (
    operation: MathOperation,
    operationEnabled: boolean,
    fractions: boolean,
    fractionDenominatorMode: FractionDenominatorMode,
    onToggleFractions: () => void,
    onModeChange: (mode: FractionDenominatorMode) => void,
  ) => {
    const fractionLabel = questionStyleLabel("fraction", t);
    return (
      <View style={styles.fractionSection}>
        {renderQuestionSwitch(
          fractionLabel,
          operation,
          operationEnabled,
          fractions,
          onToggleFractions,
        )}
        {fractions ? (
          <View style={styles.fractionOptions}>
            {FRACTION_DENOMINATOR_MODE_OPTIONS.map((opt) => {
              const selected = fractionDenominatorMode === opt.value;
              const keys = FRACTION_MODE_LABEL_KEYS[opt.value];
              const label = t(keys);
              const operator = fractionExampleOperator(operation);
              const a11yExample = formatFractionModeExampleA11y(opt.value, operator);
              return (
                <Pressable
                  key={opt.value}
                  accessibilityRole="button"
                  accessibilityLabel={`${label}. ${t("settings:fractionExamplePrefix")} ${a11yExample}`}
                  accessibilityState={{ selected }}
                  disabled={!operationEnabled}
                  onPress={() => onModeChange(opt.value)}
                  style={[
                    styles.fractionModeOption,
                    selected && styles.fractionModeOptionSelected,
                    !operationEnabled && styles.modeChipDisabled,
                  ]}
                >
                  <AppText
                    variant="body"
                    style={selected ? styles.modeTextSelected : styles.modeText}
                  >
                    {label}
                  </AppText>
                  <FractionDenominatorModeExample
                    mode={opt.value}
                    operator={operator}
                    examplePrefix={t("settings:fractionExamplePrefix")}
                    exampleOr={t("settings:fractionExampleOr")}
                    muted={!selected}
                    selected={selected}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <FocusedOperationContext.Provider value={operationVisibility}>
    <View style={styles.gap}>
      {showPersonal ? <View style={styles.sectionBlock}>
        <AppText variant="subtitle">{t("common:personalInfo")}</AppText>
        <Card>
          <AppText variant="label">{t("onboarding:profileName")}</AppText>
          <TextInput
            accessibilityLabel={t("onboarding:profileName")}
            placeholder={t("onboarding:profileNamePlaceholder")}
            placeholderTextColor={colors.textMuted}
            value={profileName}
            onChangeText={setProfileName}
            onFocus={scrollRef ? scrollToInput : undefined}
            autoCapitalize="words"
            maxLength={PROFILE_NAME_MAX_LENGTH}
            style={styles.nameInput}
          />
          <AppText variant="label">{t("onboarding:nameOrNickname")}</AppText>
          <TextInput
            accessibilityLabel={t("onboarding:nameOrNickname")}
            placeholder={t("onboarding:namePlaceholder")}
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            onFocus={scrollRef ? scrollToInput : undefined}
            autoCapitalize="words"
            maxLength={LEARNER_NAME_MAX_LENGTH}
            style={styles.nameInput}
          />
          <AppText variant="label">{t("settings:ageOptional")}</AppText>
          <AgeNumberInput
            value={age}
            onChange={setAge}
            accessibilityLabel={t("settings:ageOptional")}
            placeholder={t("settings:ageOptionalPlaceholder")}
          />
        </Card>
      </View> : null}

      {showTopics || showSession ? <View style={styles.sectionBlock}>
        {showSession ? (
          <AppText variant="subtitle">{t("settings:generalSettings")}</AppText>
        ) : null}
        {showTopics ? <>
        <AppText variant="subtitle">{t("common:learningPlan")}</AppText>
        <AppText variant="body" muted>
          {t("settings:learningPlanHelp")}
        </AppText>
        {showOperationsSliderHelp ? (
          <AppText variant="body" muted>
            {t("settings:learningPlanAdditionSubtractionHelp")}
          </AppText>
        ) : null}
        <ShapeRecognitionSettingsCard
          shapeRecognition={config.shapeRecognition}
          onChange={(shapeRecognition) => setConfig((c) => ({ ...c, shapeRecognition }))}
          patterns={config.patterns}
          onPatternsChange={(patterns) => setConfig((c) => ({ ...c, patterns }))}
          numberSense={config.numberSense}
          onNumberSenseChange={(numberSense) => setConfig((c) => ({ ...c, numberSense }))}
        />
        <NumberSenseSettingsCard value={config.numberSense} onChange={(numberSense) => setConfig((c) => ({ ...c, numberSense }))} />

        <PatternsSettingsCard
          patterns={config.patterns}
          onChange={(patterns) => setConfig((c) => ({ ...c, patterns }))}
        />

        <ClockSettingsCard
          clock={config.clock}
          onChange={(clock) => setConfig((c) => ({ ...c, clock }))}
        />

        <FractionVisualSettingsCard
          fractionVisual={config.fractionVisual}
          onChange={(fractionVisual) => setConfig((c) => ({ ...c, fractionVisual }))}
        />

        <OperationConfigCard
          operation="addition"
          enabled={config.addition.enabled}
          onToggle={(enabled) =>
            setConfig((c) => ({ ...c, addition: { ...c.addition, enabled } }))
          }
        >
          <DiscreteMaxSlider
            accessibilityLabel={t("questions:a11yAdditionFirstMax")}
            disabled={!config.addition.enabled}
            lineLabel={t("common:firstNumber")}
            valueMax={config.addition.leftMax}
            onChange={(max) =>
              setConfig((c) => ({
                ...c,
                addition: {
                  ...c.addition,
                  leftMin: 1,
                  leftMax: max,
                },
              }))
            }
          />
          <DiscreteMaxSlider
            accessibilityLabel={t("questions:a11yAdditionSecondMax")}
            disabled={!config.addition.enabled}
            lineLabel={t("common:secondNumber")}
            valueMax={config.addition.rightMax}
            onChange={(max) =>
              setConfig((c) => ({
                ...c,
                addition: {
                  ...c.addition,
                  rightMin: 1,
                  rightMax: max,
                },
              }))
            }
          />
          <DiscreteMaxSlider
            accessibilityLabel={t("questions:a11yAdditionAnswerMax")}
            disabled={!config.addition.enabled}
            lineLabel={t("common:answer")}
            options={ADDITION_ANSWER_MAX_OPTIONS}
            allowUnlimited
            valueMax={config.addition.answerMax}
            onChange={(max) =>
              setConfig((c) => ({
                ...c,
                addition: {
                  ...c.addition,
                  answerMax: max,
                },
              }))
            }
          />
          {renderQuestionSwitch(
            questionStyleLabel("standard", t),
            "addition",
            config.addition.enabled,
            config.addition.standardCalculation,
            () =>
              setConfig((c) => ({
                ...c,
                addition: {
                  ...c.addition,
                  standardCalculation: !c.addition.standardCalculation,
                },
              })),
          )}
          {renderQuestionSwitch(
            t("settings:regrouping"),
            "addition",
            config.addition.enabled,
            config.addition.regrouping,
            () =>
              setConfig((c) => ({
                ...c,
                addition: {
                  ...c.addition,
                  regrouping: !c.addition.regrouping,
                },
              })),
          )}
          {renderQuestionSwitch(
            t("settings:negativeNumbers"),
            "addition",
            config.addition.enabled,
            config.addition.allowNegativeNumbers,
            () =>
              setConfig((c) => ({
                ...c,
                addition: {
                  ...c.addition,
                  allowNegativeNumbers: !c.addition.allowNegativeNumbers,
                },
              })),
          )}
          {renderQuestionSwitch(
            t("settings:decimals"),
            "addition",
            config.addition.enabled,
            config.addition.allowDecimals,
            () =>
              setConfig((c) => ({
                ...c,
                addition: {
                  ...c.addition,
                  allowDecimals: !c.addition.allowDecimals,
                },
              })),
          )}
          {renderQuestionSwitch(
            questionStyleLabel("missing_number", t),
            "addition",
            config.addition.enabled,
            config.addition.missingNumber,
            () =>
              setConfig((c) => ({
                ...c,
                addition: {
                  ...c.addition,
                  missingNumber: !c.addition.missingNumber,
                },
              })),
          )}
          {renderQuestionSwitch(
            t("settings:equationsX"),
            "addition",
            config.addition.enabled,
            config.equationUnknown.operators.addition,
            () =>
              setConfig((c) => {
                const operators = {
                  ...c.equationUnknown.operators,
                  addition: !c.equationUnknown.operators.addition,
                };
                return {
                  ...c,
                  equationUnknown: {
                    ...c.equationUnknown,
                    enabled: Object.values(operators).some(Boolean),
                    operators,
                  },
                };
              }),
          )}
          {renderQuestionSwitch(
            questionStyleLabel("word_problem", t),
            "addition",
            config.addition.enabled,
            config.addition.wordProblems,
            () =>
              setConfig((c) => ({
                ...c,
                addition: {
                  ...c.addition,
                  wordProblems: !c.addition.wordProblems,
                },
              })),
          )}
          {renderFractionSettings(
            "addition",
            config.addition.enabled,
            config.addition.fractions,
            config.addition.fractionDenominatorMode,
            () =>
              setConfig((c) => ({
                ...c,
                addition: {
                  ...c.addition,
                  fractions: !c.addition.fractions,
                },
              })),
            (mode) =>
              setConfig((c) => ({
                ...c,
                addition: {
                  ...c.addition,
                  fractionDenominatorMode: mode,
                },
              })),
          )}
        </OperationConfigCard>

        <OperationConfigCard
          operation="subtraction"
          enabled={config.subtraction.enabled}
          onToggle={(enabled) =>
            setConfig((c) => ({
              ...c,
              subtraction: { ...c.subtraction, enabled },
            }))
          }
        >
          <DiscreteMaxSlider
            accessibilityLabel={t("questions:a11ySubtractionFirstMax")}
            disabled={!config.subtraction.enabled}
            lineLabel={t("common:firstNumber")}
            valueMax={config.subtraction.firstMax}
            onChange={(max) =>
              setConfig((c) => ({
                ...c,
                subtraction: {
                  ...c.subtraction,
                  firstMin: 1,
                  firstMax: max,
                },
              }))
            }
          />
          <DiscreteMaxSlider
            accessibilityLabel={t("questions:a11ySubtractionSecondMax")}
            disabled={!config.subtraction.enabled}
            lineLabel={t("common:secondNumber")}
            valueMax={config.subtraction.secondMax}
            onChange={(max) =>
              setConfig((c) => ({
                ...c,
                subtraction: {
                  ...c.subtraction,
                  secondMin: 1,
                  secondMax: max,
                },
              }))
            }
          />
          {renderQuestionSwitch(
            questionStyleLabel("standard", t),
            "subtraction",
            config.subtraction.enabled,
            config.subtraction.standardCalculation,
            () =>
              setConfig((c) => ({
                ...c,
                subtraction: {
                  ...c.subtraction,
                  standardCalculation: !c.subtraction.standardCalculation,
                },
              })),
          )}
          {renderQuestionSwitch(
            t("settings:regrouping"),
            "subtraction",
            config.subtraction.enabled,
            config.subtraction.regrouping,
            () =>
              setConfig((c) => ({
                ...c,
                subtraction: {
                  ...c.subtraction,
                  regrouping: !c.subtraction.regrouping,
                },
              })),
          )}
          {renderQuestionSwitch(
            t("settings:negativeNumbers"),
            "subtraction",
            config.subtraction.enabled,
            config.subtraction.allowNegativeNumbers,
            () =>
              setConfig((c) => {
                const allowNegativeNumbers =
                  !c.subtraction.allowNegativeNumbers;
                return {
                  ...c,
                  subtraction: {
                    ...c.subtraction,
                    allowNegativeNumbers,
                    allowNegativeAnswers: allowNegativeNumbers,
                  },
                };
              }),
          )}
          {renderQuestionSwitch(
            t("settings:decimals"),
            "subtraction",
            config.subtraction.enabled,
            config.subtraction.allowDecimals,
            () =>
              setConfig((c) => ({
                ...c,
                subtraction: {
                  ...c.subtraction,
                  allowDecimals: !c.subtraction.allowDecimals,
                },
              })),
          )}
          {renderQuestionSwitch(
            questionStyleLabel("missing_number", t),
            "subtraction",
            config.subtraction.enabled,
            config.subtraction.missingNumber,
            () =>
              setConfig((c) => ({
                ...c,
                subtraction: {
                  ...c.subtraction,
                  missingNumber: !c.subtraction.missingNumber,
                },
              })),
          )}
          {renderQuestionSwitch(
            t("settings:equationsX"),
            "subtraction",
            config.subtraction.enabled,
            config.equationUnknown.operators.subtraction,
            () =>
              setConfig((c) => {
                const operators = {
                  ...c.equationUnknown.operators,
                  subtraction: !c.equationUnknown.operators.subtraction,
                };
                return {
                  ...c,
                  equationUnknown: {
                    ...c.equationUnknown,
                    enabled: Object.values(operators).some(Boolean),
                    operators,
                  },
                };
              }),
          )}
          {renderQuestionSwitch(
            questionStyleLabel("word_problem", t),
            "subtraction",
            config.subtraction.enabled,
            config.subtraction.wordProblems,
            () =>
              setConfig((c) => ({
                ...c,
                subtraction: {
                  ...c.subtraction,
                  wordProblems: !c.subtraction.wordProblems,
                },
              })),
          )}
          {renderFractionSettings(
            "subtraction",
            config.subtraction.enabled,
            config.subtraction.fractions,
            config.subtraction.fractionDenominatorMode,
            () =>
              setConfig((c) => ({
                ...c,
                subtraction: {
                  ...c.subtraction,
                  fractions: !c.subtraction.fractions,
                },
              })),
            (mode) =>
              setConfig((c) => ({
                ...c,
                subtraction: {
                  ...c.subtraction,
                  fractionDenominatorMode: mode,
                },
              })),
          )}
        </OperationConfigCard>

        <OperationConfigCard
          operation="multiplication"
          enabled={config.multiplication.enabled}
          onToggle={(enabled) =>
            setConfig((c) => ({
              ...c,
              multiplication: { ...c.multiplication, enabled },
            }))
          }
        >
          <OneToTenFactorPicker
            label={t("settings:firstNumberFromSelection")}
            hint={t("settings:multiplicationPoolHint")}
            selected={config.multiplication.factors}
            disabled={!config.multiplication.enabled}
            onChange={(factors) =>
              setConfig((c) => ({
                ...c,
                multiplication: { ...c.multiplication, factors },
              }))
            }
          />
          <View style={styles.section}>
            <AppText variant="label">{t("common:secondNumber")}</AppText>
            <View style={styles.modeRow}>
              {MULTIPLICATION_SECOND_FACTOR_OPTIONS.map((opt) => {
                const selected =
                  config.multiplication.secondFactorSource === opt.value;
                const keys = MULTIPLICATION_POOL_LABEL_KEYS[opt.value];
                const optionLabel = t(keys.labelKey);
                return (
                  <Pressable
                    key={opt.value}
                    accessibilityRole="button"
                    accessibilityLabel={optionLabel}
                    accessibilityState={{ selected }}
                    disabled={!config.multiplication.enabled}
                    onPress={() =>
                      setConfig((c) => ({
                        ...c,
                        multiplication: {
                          ...c.multiplication,
                          secondFactorSource: opt.value,
                        },
                      }))
                    }
                    style={[
                      styles.modeChip,
                      selected && styles.modeChipSelected,
                    ]}
                  >
                    <AppText
                      variant="subtitle"
                      style={
                        selected ? styles.modeTextSelected : styles.modeText
                      }
                    >
                      {optionLabel}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            <AppText variant="body" muted>
              {t(
                MULTIPLICATION_POOL_LABEL_KEYS[config.multiplication.secondFactorSource]
                  .hintKey,
              )}
            </AppText>
          </View>
          <View style={styles.rowBetween}>
            <AppText variant="label" style={styles.toggleRowLabel}>
              {t("settings:randomizeOrder")}
            </AppText>
            <View style={styles.settingsSwitchWrap}>
              <CompactSwitch
                accessibilityLabel={t("settings:randomizeOrder")}
                value={config.multiplication.randomizeFactorOrder}
                onValueChange={(randomizeFactorOrder) =>
                  setConfig((c) => ({
                    ...c,
                    multiplication: {
                      ...c.multiplication,
                      randomizeFactorOrder,
                    },
                  }))
                }
                disabled={!config.multiplication.enabled}
              />
            </View>
          </View>
          <AppText variant="body" muted>
            {t("settings:randomizeOrderHint")}
          </AppText>
          {renderQuestionSwitch(
            questionStyleLabel("standard", t),
            "multiplication",
            config.multiplication.enabled,
            config.multiplication.standardCalculation,
            () =>
              setConfig((c) => ({
                ...c,
                multiplication: {
                  ...c.multiplication,
                  standardCalculation: !c.multiplication.standardCalculation,
                },
              })),
          )}
          {renderQuestionSwitch(
            t("settings:negativeNumbers"),
            "multiplication",
            config.multiplication.enabled,
            config.multiplication.allowNegativeNumbers,
            () =>
              setConfig((c) => ({
                ...c,
                multiplication: {
                  ...c.multiplication,
                  allowNegativeNumbers: !c.multiplication.allowNegativeNumbers,
                },
              })),
          )}
          {renderQuestionSwitch(
            t("settings:decimals"),
            "multiplication",
            config.multiplication.enabled,
            config.multiplication.allowDecimals,
            () =>
              setConfig((c) => ({
                ...c,
                multiplication: {
                  ...c.multiplication,
                  allowDecimals: !c.multiplication.allowDecimals,
                },
              })),
          )}
          {renderQuestionSwitch(
            questionStyleLabel("missing_number", t),
            "multiplication",
            config.multiplication.enabled,
            config.multiplication.missingNumber,
            () =>
              setConfig((c) => ({
                ...c,
                multiplication: {
                  ...c.multiplication,
                  missingNumber: !c.multiplication.missingNumber,
                },
              })),
          )}
          {renderQuestionSwitch(
            t("settings:equationsX"),
            "multiplication",
            config.multiplication.enabled,
            config.equationUnknown.operators.multiplication,
            () =>
              setConfig((c) => {
                const operators = {
                  ...c.equationUnknown.operators,
                  multiplication: !c.equationUnknown.operators.multiplication,
                };
                return {
                  ...c,
                  equationUnknown: {
                    ...c.equationUnknown,
                    enabled: Object.values(operators).some(Boolean),
                    operators,
                  },
                };
              }),
          )}
          {renderQuestionSwitch(
            questionStyleLabel("word_problem", t),
            "multiplication",
            config.multiplication.enabled,
            config.multiplication.wordProblems,
            () =>
              setConfig((c) => ({
                ...c,
                multiplication: {
                  ...c.multiplication,
                  wordProblems: !c.multiplication.wordProblems,
                },
              })),
          )}
          {renderQuestionSwitch(
            questionStyleLabel("fraction", t),
            "multiplication",
            config.multiplication.enabled,
            config.multiplication.fractions,
            () =>
              setConfig((c) => ({
                ...c,
                multiplication: {
                  ...c.multiplication,
                  fractions: !c.multiplication.fractions,
                },
              })),
          )}
        </OperationConfigCard>

        <OperationConfigCard
          operation="division"
          enabled={config.division.enabled}
          onToggle={(enabled) =>
            setConfig((c) => ({ ...c, division: { ...c.division, enabled } }))
          }
        >
          <RangeSelector
            label={t("settings:answerQuotient")}
            presets={DIVISION_ANSWER_RANGE_PRESETS}
            value={{
              min: config.division.answerMin,
              max: config.division.answerMax,
            }}
            disabled={!config.division.enabled}
            onChange={(min, max) =>
              setConfig((c) => ({
                ...c,
                division: { ...c.division, answerMin: min, answerMax: max },
              }))
            }
          />
          <OneToTenFactorPicker
            label={t("settings:divideBy")}
            hint={t("settings:divisorsHint")}
            selected={config.division.divisors}
            disabled={!config.division.enabled}
            onChange={(divisors) =>
              setConfig((c) => ({
                ...c,
                division: { ...c.division, divisors },
              }))
            }
          />
          {renderQuestionSwitch(
            questionStyleLabel("standard", t),
            "division",
            config.division.enabled,
            config.division.standardCalculation,
            () =>
              setConfig((c) => ({
                ...c,
                division: {
                  ...c.division,
                  standardCalculation: !c.division.standardCalculation,
                },
              })),
          )}
          {renderQuestionSwitch(
            t("settings:negativeNumbers"),
            "division",
            config.division.enabled,
            config.division.allowNegativeNumbers,
            () =>
              setConfig((c) => ({
                ...c,
                division: {
                  ...c.division,
                  allowNegativeNumbers: !c.division.allowNegativeNumbers,
                },
              })),
          )}
          {renderQuestionSwitch(
            t("settings:decimals"),
            "division",
            config.division.enabled,
            config.division.allowDecimals,
            () =>
              setConfig((c) => ({
                ...c,
                division: {
                  ...c.division,
                  allowDecimals: !c.division.allowDecimals,
                },
              })),
          )}
          {renderQuestionSwitch(
            questionStyleLabel("missing_number", t),
            "division",
            config.division.enabled,
            config.division.missingNumber,
            () =>
              setConfig((c) => ({
                ...c,
                division: {
                  ...c.division,
                  missingNumber: !c.division.missingNumber,
                },
              })),
          )}
          {renderQuestionSwitch(
            t("settings:equationsX"),
            "division",
            config.division.enabled,
            config.equationUnknown.operators.division,
            () =>
              setConfig((c) => {
                const operators = {
                  ...c.equationUnknown.operators,
                  division: !c.equationUnknown.operators.division,
                };
                return {
                  ...c,
                  equationUnknown: {
                    ...c.equationUnknown,
                    enabled: Object.values(operators).some(Boolean),
                    operators,
                  },
                };
              }),
          )}
          {renderQuestionSwitch(
            questionStyleLabel("word_problem", t),
            "division",
            config.division.enabled,
            config.division.wordProblems,
            () =>
              setConfig((c) => ({
                ...c,
                division: {
                  ...c.division,
                  wordProblems: !c.division.wordProblems,
                },
              })),
          )}
          {renderQuestionSwitch(
            questionStyleLabel("fraction", t),
            "division",
            config.division.enabled,
            config.division.fractions,
            () =>
              setConfig((c) => ({
                ...c,
                division: {
                  ...c.division,
                  fractions: !c.division.fractions,
                },
              })),
          )}
          <View style={styles.rowBetween}>
            <AppText variant="label" style={styles.toggleRowLabel}>
              {t("settings:allowRemainders")}
            </AppText>
            <View style={styles.settingsSwitchWrap}>
              <CompactSwitch
                accessibilityLabel={t("settings:allowRemainders")}
                value={config.division.allowRemainders}
                onValueChange={(allowRemainders) =>
                  setConfig((c) => ({
                    ...c,
                    division: {
                      ...c.division,
                      allowRemainders,
                    },
                  }))
                }
                disabled={!config.division.enabled}
              />
            </View>
          </View>
          <AppText variant="body" muted>
            {t("settings:remaindersHint")}
          </AppText>
        </OperationConfigCard>

        <ComparisonSettingsCard
          comparison={config.comparison}
          onChange={(comparison) => setConfig((c) => ({ ...c, comparison }))}
        />

        <OperationConfigCard
          operation="square"
          enabled={config.square.enabled}
          onToggle={(enabled) =>
            setConfig((c) => ({ ...c, square: { ...c.square, enabled } }))
          }
        >
          <AppText variant="body" muted>
            {config.square.fractions
              ? t("settings:squareHelpFractions")
              : t("settings:squareHelpIntegers")}
          </AppText>
          <View style={styles.section}>
            <AppText variant="label">{t("settings:baseUpTo")}</AppText>
            <View style={styles.modeRow}>
              {SQUARE_OPERAND_MAX_OPTIONS.map((n) => (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityLabel={`${t("settings:baseUpTo")} ${n}`}
                  accessibilityState={{
                    selected: config.square.operandMax === n,
                  }}
                  disabled={!config.square.enabled}
                  onPress={() =>
                    setConfig((c) => ({
                      ...c,
                      square: { ...c.square, operandMax: n },
                    }))
                  }
                  style={[
                    styles.modeChip,
                    config.square.operandMax === n && styles.modeChipSelected,
                  ]}
                >
                  <AppText
                    variant="subtitle"
                    style={
                      config.square.operandMax === n
                        ? styles.modeTextSelected
                        : styles.modeText
                    }
                  >
                    {n}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>
          {renderQuestionSwitch(
            questionStyleLabel("standard", t),
            "square",
            config.square.enabled,
            config.square.standardCalculation,
            () =>
              setConfig((c) => ({
                ...c,
                square: {
                  ...c.square,
                  standardCalculation: !c.square.standardCalculation,
                },
              })),
          )}
          <View style={styles.fractionSectionNoDivider}>
            {renderQuestionSwitch(
              questionStyleLabel("fraction", t),
              "square",
              config.square.enabled,
              config.square.fractions,
              () =>
                setConfig((c) => ({
                  ...c,
                  square: {
                    ...c.square,
                    fractions: !c.square.fractions,
                  },
                })),
            )}
          </View>
        </OperationConfigCard>

        <OperationConfigCard
          operation="square_root"
          enabled={config.squareRoot.enabled}
          onToggle={(enabled) =>
            setConfig((c) => ({
              ...c,
              squareRoot: { ...c.squareRoot, enabled },
            }))
          }
        >
          <AppText variant="body" muted>
            {config.squareRoot.fractions
              ? t("settings:squareRootHelpFractions")
              : t("settings:squareRootHelpIntegers")}
          </AppText>
          <View style={styles.section}>
            <AppText variant="label">{t("settings:rootUpTo")}</AppText>
            <View style={styles.modeRow}>
              {SQUARE_ROOT_ROOT_MAX_OPTIONS.map((n) => (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityLabel={`${t("settings:rootUpTo")} ${n}`}
                  accessibilityState={{
                    selected: config.squareRoot.rootMax === n,
                  }}
                  disabled={!config.squareRoot.enabled}
                  onPress={() =>
                    setConfig((c) => ({
                      ...c,
                      squareRoot: { ...c.squareRoot, rootMax: n },
                    }))
                  }
                  style={[
                    styles.modeChip,
                    config.squareRoot.rootMax === n && styles.modeChipSelected,
                  ]}
                >
                  <AppText
                    variant="subtitle"
                    style={
                      config.squareRoot.rootMax === n
                        ? styles.modeTextSelected
                        : styles.modeText
                    }
                  >
                    {n}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>
          {renderQuestionSwitch(
            questionStyleLabel("standard", t),
            "square_root",
            config.squareRoot.enabled,
            config.squareRoot.standardCalculation,
            () =>
              setConfig((c) => ({
                ...c,
                squareRoot: {
                  ...c.squareRoot,
                  standardCalculation: !c.squareRoot.standardCalculation,
                },
              })),
          )}
          <View style={styles.fractionSectionNoDivider}>
            {renderQuestionSwitch(
              questionStyleLabel("fraction", t),
              "square_root",
              config.squareRoot.enabled,
              config.squareRoot.fractions,
              () =>
                setConfig((c) => ({
                  ...c,
                  squareRoot: {
                    ...c.squareRoot,
                    fractions: !c.squareRoot.fractions,
                  },
                })),
            )}
          </View>
        </OperationConfigCard>

        <OperationConfigCard
          operation="rounding"
          enabled={config.rounding.enabled}
          onToggle={(enabled) =>
            setConfig((c) => ({ ...c, rounding: { ...c.rounding, enabled } }))
          }
        >
          <AppText variant="body" muted>
            Round numbers to tens, hundreds, whole numbers, or decimal places.
          </AppText>
          <View style={styles.section}>
            <AppText variant="label">{t("settings:nearest")}</AppText>
            <View style={styles.modeRow}>
              {(
                [
                  ["nearest10", "settings:nearest10"],
                  ["nearest100", "settings:nearest100"],
                  ["nearestWhole", "settings:nearestWhole"],
                  ["nearestTenth", "settings:oneDecimal"],
                  ["nearestHundredth", "settings:twoDecimals"],
                ] as const
              ).map(([key, labelKey]) => {
                const selected = config.rounding[key];
                const label = t(labelKey);
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    accessibilityState={{ selected }}
                    disabled={!config.rounding.enabled}
                    onPress={() =>
                      setConfig((c) => ({
                        ...c,
                        rounding: {
                          ...c.rounding,
                          [key]: !c.rounding[key],
                        },
                      }))
                    }
                    style={[
                      styles.modeChip,
                      selected && styles.modeChipSelected,
                      !config.rounding.enabled && styles.modeChipDisabled,
                    ]}
                  >
                    <AppText
                      variant="subtitle"
                      style={selected ? styles.modeTextSelected : styles.modeText}
                    >
                      {label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </OperationConfigCard>

        <OperationConfigCard
          operation="order_of_operations"
          enabled={config.orderOfOperations.enabled}
          onToggle={(enabled) =>
            setConfig((c) => ({
              ...c,
              orderOfOperations: { ...c.orderOfOperations, enabled },
            }))
          }
        >
          <AppText variant="body" muted>
            {t("settings:orderOfOpsHelp")}
          </AppText>
          <View style={styles.section}>
            <AppText variant="label">{t("settings:eachNumberUpTo")}</AppText>
            <View style={styles.modeRow}>
              {ORDER_OF_OPS_OPERAND_MAX_OPTIONS.map((n) => (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityLabel={t("settings:operandFrom1To", { n })}
                  accessibilityState={{
                    selected: config.orderOfOperations.operandMax === n,
                  }}
                  disabled={!config.orderOfOperations.enabled}
                  onPress={() =>
                    setConfig((c) => ({
                      ...c,
                      orderOfOperations: {
                        ...c.orderOfOperations,
                        operandMax: n,
                      },
                    }))
                  }
                  style={[
                    styles.modeChip,
                    config.orderOfOperations.operandMax === n &&
                      styles.modeChipSelected,
                    !config.orderOfOperations.enabled &&
                      styles.modeChipDisabled,
                  ]}
                >
                  <AppText
                    variant="subtitle"
                    style={
                      config.orderOfOperations.operandMax === n
                        ? styles.modeTextSelected
                        : styles.modeText
                    }
                  >
                    {n}
                  </AppText>
                </Pressable>
              ))}
            </View>
            <View style={styles.orderOfOpsSwitches}>
              {renderQuestionSwitch(
                t("settings:includeSquaring"),
                "order_of_operations",
                config.orderOfOperations.enabled,
                config.orderOfOperations.includeSquaring,
                () =>
                  setConfig((c) => ({
                    ...c,
                    orderOfOperations: {
                      ...c.orderOfOperations,
                      includeSquaring: !c.orderOfOperations.includeSquaring,
                    },
                  })),
              )}
              {renderQuestionSwitch(
                t("settings:includeSquareRoots"),
                "order_of_operations",
                config.orderOfOperations.enabled,
                config.orderOfOperations.includeSquareRoots,
                () =>
                  setConfig((c) => ({
                    ...c,
                    orderOfOperations: {
                      ...c.orderOfOperations,
                      includeSquareRoots: !c.orderOfOperations.includeSquareRoots,
                    },
                  })),
              )}
            </View>
          </View>
        </OperationConfigCard>

        <EquivalentExpressionsSettingsCard
          config={config.equivalentExpressions}
          onChange={(equivalentExpressions) =>
            setConfig((c) => ({ ...c, equivalentExpressions }))
          }
        />

        <GeometrySettingsCard
          geometry={config.geometry}
          onChange={(geometry) => setConfig((c) => ({ ...c, geometry }))}
        />

        <EquationTwoUnknownsSettingsCard
          config={config.equationTwoUnknowns}
          onChange={(equationTwoUnknowns) =>
            setConfig((c) => ({ ...c, equationTwoUnknowns }))
          }
        />

        <AdvancedEquationsSettingsCard
          config={config.advancedEquations}
          onChange={(advancedEquations) => setConfig((c) => ({ ...c, advancedEquations }))}
        />

        <TrigonometrySettingsCard
          trigonometry={config.trigonometry}
          onChange={(trigonometry) => setConfig((c) => ({ ...c, trigonometry }))}
        />

        <LogarithmSettingsCard
          logarithm={config.logarithm}
          onChange={(logarithm) => setConfig((c) => ({ ...c, logarithm }))}
        />

        <LimitsSettingsCard
          config={config.limits}
          onChange={(limits) => setConfig((c) => ({ ...c, limits }))}
        />

        <DifferentiationSettingsCard
          differentiation={config.differentiation}
          onChange={(differentiation) => setConfig((c) => ({ ...c, differentiation }))}
        />

        <IntegrationSettingsCard
          integration={config.integration}
          onChange={(integration) => setConfig((c) => ({ ...c, integration }))}
        />
        </> : null}

        {showSession ? <>
        <View style={styles.section}>
            <AppText variant="label">{t("common:questions")}</AppText>
            <View style={styles.modeRow}>
              {QUESTION_COUNT_OPTIONS.map((n) => (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityLabel={`${n} questions`}
                  accessibilityState={{ selected: config.questionsCount === n }}
                  onPress={() => setQuestionCount(n)}
                  style={[
                    styles.modeChip,
                    config.questionsCount === n && styles.modeChipSelected,
                  ]}
                >
                  <AppText
                    variant="subtitle"
                    style={
                      config.questionsCount === n
                        ? styles.modeTextSelected
                        : styles.modeText
                    }
                  >
                    {n}
                  </AppText>
                </Pressable>
              ))}
            </View>
        </View>

        <AnswerOptionsSelector
          optionCount={config.answerOptionsCount}
          keyboardEnabled={config.answerEntryMode === "keyboard"}
          onPickCount={(answerOptionsCount) =>
            setConfig((c) => ({ ...c, answerOptionsCount }))
          }
          onKeyboardChange={(enabled) =>
            setConfig((c) => ({
              ...c,
              answerEntryMode: enabled ? "keyboard" : "multiple_choice",
            }))
          }
        />

        {config.answerEntryMode === "multiple_choice" ? <Card>
          <View style={styles.settingsSwitchRow}>
            <View style={styles.confirmAnswerCopy}>
              <AppText variant="subtitle">{t("settings:confirmAnswer")}</AppText>
              <AppText variant="body" muted>
                {t("settings:confirmAnswerHint")}
              </AppText>
            </View>
            <View style={styles.settingsSwitchWrap}>
              <Switch
                accessibilityLabel={t("settings:confirmAnswer")}
                value={config.confirmAnswerBeforeSubmit}
                onValueChange={(confirmAnswerBeforeSubmit) =>
                  setConfig((c) => ({ ...c, confirmAnswerBeforeSubmit }))
                }
                thumbColor="#ffffff"
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>
        </Card> : (
          <AppText variant="body" muted>
            {t("settings:keyboardConfirmBuiltIn")}
          </AppText>
        )}

        <TimerSettings
          enabled={config.timerEnabled}
          secondsPerQuestion={config.timerSecondsPerQuestion}
          onEnabledChange={(timerEnabled) =>
            setConfig((c) => ({ ...c, timerEnabled }))
          }
          onSecondsChange={(timerSecondsPerQuestion) =>
            setConfig((c) => ({ ...c, timerSecondsPerQuestion }))
          }
        />

        <View style={styles.sectionDivider} />
        <View style={styles.section}>
          <AppText variant="subtitle">{t("settings:timedRunSettings")}</AppText>
          <AppText variant="body" muted>
            {t("settings:timedRunSettingsHint")}
          </AppText>
          <DiscreteMinuteSlider
            valueMinutes={config.timedDurationMinutes}
            onChange={(timedDurationMinutes) =>
              setConfig((c) => ({ ...c, timedDurationMinutes }))
            }
            accessibilityLabel={t("questions:a11yTimedTotalMinutes")}
          />
          <TimeAdjustmentSlider
            accessibilityLabel={t("settings:wrongAnswerPenalty")}
            label={t("settings:wrongAnswerPenalty")}
            value={config.timedWrongPenaltySeconds}
            maximumValue={TIMED_WRONG_PENALTY_SECONDS_MAX}
            onChange={(timedWrongPenaltySeconds) =>
              setConfig((c) => ({
                ...c,
                timedWrongPenaltySeconds,
                timedSubtractSecondsOnWrong: timedWrongPenaltySeconds > 0,
              }))
            }
          />
          <TimeAdjustmentSlider
            accessibilityLabel={t("settings:correctAnswerBonus")}
            label={t("settings:correctAnswerBonus")}
            value={config.timedCorrectBonusSeconds}
            maximumValue={TIMED_CORRECT_BONUS_SECONDS_MAX}
            onChange={(timedCorrectBonusSeconds) =>
              setConfig((c) => ({ ...c, timedCorrectBonusSeconds }))
            }
          />
        </View>
        </> : null}
      </View> : null}

      {!profileValid ? (
        <AppText variant="body" style={styles.errorText}>
          {t("settings:addNameHint")}
        </AppText>
      ) : null}

      {!validation.valid ? (
        <View style={styles.errors}>
          {validation.errors.map((err) => (
            <AppText key={err} variant="body" style={styles.errorText}>
              {err}
            </AppText>
          ))}
        </View>
      ) : null}

      {!hideSaveButton ? <AppButton
        label={t("common:saveSettings")}
        onPress={() =>
          onSave(config, {
            id: profile.id,
            profileName: profileName.trim(),
            name: name.trim(),
            age,
            mathKnowledgeLevel: profile.mathKnowledgeLevel,
          })
        }
        disabled={!validation.valid || !profileValid}
        accessibilityHint={t("settings:saveHint")}
      /> : null}
    </View>
    </FocusedOperationContext.Provider>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: spacing.md,
  },
  sectionBlock: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.xs,
  },
  sectionDivider: {
    height: 1,
    marginVertical: spacing.md,
    backgroundColor: colors.border,
  },
  orderOfOpsSwitches: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  modeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  modeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chip,
  },
  modeChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
  modeChipDisabled: {
    opacity: 0.45,
  },
  modeText: {
    color: colors.text,
  },
  modeTextSelected: {
    color: colors.primary,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  confirmAnswerCopy: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  settingsSwitchRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  settingsSwitchWrap: {
    flexShrink: 0,
    marginTop: 2,
  },
  toggleRowLabel: {
    flex: 1,
    flexShrink: 1,
    paddingRight: spacing.sm,
  },
  fractionSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  fractionSectionNoDivider: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  fractionOptions: {
    gap: spacing.xs,
  },
  fractionModeOption: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chip,
  },
  fractionModeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
  errors: {
    gap: spacing.xs,
  },
  errorText: {
    color: colors.error,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 18,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 48,
    marginBottom: spacing.sm,
  },
});
