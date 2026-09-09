# Business Requirements Document: The Real Math

**Last updated:** 9 September 2026

**Current implementation baseline:** Expo SDK 57

**Review basis:** Mobile source code checked on 9 September 2026. “Shipped” below means implemented in this repository, not independently verified in an installed store build. Existing future curriculum proposals remain proposals; this review does not promote them to committed scope. See §63 for review findings and source references.

## 1. Document Purpose

This document defines the business and functional requirements for a React Native Expo mobile application that helps people learn and practice math. The focus of this document is the application behavior, learning flow, configuration model, and question-generation logic.

The app is designed for **learners of all ages** — from early number sense through upper elementary and beyond — while still offering optional age-based recommended plans for quick setup.

This document does not cover monetization, store release requirements, or legal requirements. An **in-app privacy policy** screen is shipped (see Home → Privacy policy); store listing URLs and compliance questionnaires remain the publisher’s responsibility.

### 1.1 Website content alignment

The companion website should describe the shipped app, using these content requirements:

- Use **23 topics** consistently in page copy and search/social metadata. Describe a practice and reference library, not a complete course covering every advanced subject.
- Describe timed starts of **15 seconds to 10 minutes**, adjustable wrong-answer penalties **0–15 seconds**, and correct-answer bonuses **0–5 seconds**.
- Describe practice feedback as correctness feedback plus the correct answer after a miss; do not imply worked remediation or instructional hints in the session feedback.
- Answer-option presets are **2, 3, 4 or 6**, with fixed natural sets for certain questions. Keyboard entry is supported only for appropriate question types (§15).
- Visual questions still use written instructions. Do not imply guaranteed independent use by children who cannot read or built-in question narration.
- Word-problem examples and illustrations should use actual template scenarios (§7.5). Website illustrations do not imply that the app's text-based word problems themselves contain those illustrations.
- Describe plan sharing accurately, including the exported profile label (§62). Factual descriptions of stored data should include optional age/confidence, language preference, local progress and user-initiated settings sharing; keep corresponding app and website descriptions synchronized.
- Keep platform availability copy and store badges consistent with publisher-confirmed release status. A supported platform must not be presented as publicly downloadable before it is available.

These are content requirements, not a claim that the deployed website has been verified or updated.

---

## 2. Product Overview

The app is a mobile math learning application for **everyone** — children, teens, adults, parents, and teachers. Optional **recommended learning plans** use age brackets (especially **4–12**) as a starting point, but the app accepts ages **1–150** for profile entry and does not restrict content to a single age band. Users can fully customize what to practice.

The app supports **multiple profiles** on one device (e.g. one profile for subtraction practice, another for advanced operations). Each profile has its own profile label, learner name, age, learning plan, and session history.

The app should be simple to start, easy to use, and flexible enough to customize what type of math practice is included.

The main learning operations are:

- Addition
- Subtraction
- Multiplication
- Division
- Squaring (e.g. `7² = ?`)
- Square roots (e.g. `√49 = ?`)
- Rounding (nearest 10, 100, whole, tenth, hundredth)
- Order of operations (e.g. `3 + 4 × 5 = ?`, multiply before add)
- **Equivalent expressions** (identities, distribution, factorization — see §22)
- Equations with one unknown (e.g. `x + 3 = 8`)
- Equations with two unknowns (`x` and `y`) — when enabled
- **Geometry** (perimeter, area, volume — formula and calculate questions)
- **Comparison** (relational, ordering, expression compare, and cross-type compare — see §25)
- **Fraction recognition** (visual bar and circle models — see §28)
- **Shapes** (shape/color recognition and visual patterns — see §28.6)
- **Numbers / early number sense** (before/after, missing numbers, odd/even — see §39); visual counting and quantity comparison are configured under Shapes
- **Clock / time** (analog read and elapsed time — see §31)
- **Patterns & sequences** (numeric sequences; visual patterns are configured under Shapes — see §32 and §28.6)
- **Trigonometry** (right-triangle ratios — formula selection and side naming — see §38)
- **Logarithms** (log rules and numeric log/ln values — see §41)
- **Differentiation** and **Integration** (symbolic MC — see §34)
- **Linear and quadratic equations** (multi-step linear equations and factorable quadratics — see §43)
- **Limits** (direct substitution, factor-and-cancel, infinity, and rationalization limits — see §44)

**Shipped:** comparison (all subtypes in §25), equations with **two** unknowns (`x` and `y`), **linear and quadratic equations** (§43), **limits** (§44), **Learn** reference library (23 topics), visual fraction recognition with keyboard entry, shape recognition, clock/time, patterns, **decimal toggles** on basic operations (1 decimal place), trigonometry v1 (§38), **logarithms** (§41), calculus with power/constant/sum, natural log, trig, and quotient/simplify-fraction rules (§34), expanded 2D/3D geometry, configurable timed penalties and bonuses, build/update information, privacy policy screen, compact question cards for visual prompts, **confirm before submit** for multiple choice, **English + Macedonian** UI (§42), **share settings export/import** (§62), and a **redesigned Progress screen** with session-mode filter, expandable session rows, timed-run detail lines, and topic accuracy (§36). The application currently targets **Expo SDK 57**.

**Planned next:** dedicated decimal/percent practice beyond rounding and comparison (see §24.3 and §51).

**Potential curriculum expansion:** ratios and proportions (§45), Least Common Multiple and Greatest Common Divisor (§46), decade-based number reasoning (§47), matrices (§48), place value / number decomposition (§49), and the implementation-conscious curriculum candidates in §§50–60.

**Later:** Learn quality pass (§35), session history question review (§37).

The app should support recommended learning settings based on the learner’s age when provided, while always allowing manual customization of the learning plan per profile.

---

## 3. Product Goals

The main goals of the app are:

- Allow learners to start practicing math quickly with minimal setup.
- Personalize the experience using the learner’s name or nickname and optional profile labels.
- Support multiple learners (profiles) on one device with separate settings and progress.
- Recommend sensible starting plans by age when age is provided, without limiting older or self-directed learners.
- Allow full customization of operations, ranges, and question types per profile.
- Support practice, quiz, and timed session modes.
- Provide multiple-choice or keyboard answer entry where appropriate.
- Track session results, recent performance, and gentle adaptation hints.
- **Export and import** session/topic settings between profiles or devices (includes the profile label; excludes the learner-name field and progress — §62).
- Offer a **Learn** section with explanations and visuals for all 23 curriculum topics.
- Support **English and Macedonian** UI with first-run language selection.

---

## 4. Target Users

The app serves **anyone who wants to practice math**, including:

- **Young learners** (roughly ages 4–12) — primary school arithmetic and geometry
- **Teens and adults** — revision, skills refresh, or targeted practice (decimals, percentages, etc.)
- **Parents and guardians** — configure plans for a child
- **Self-directed learners** — build a custom plan without age-based defaults

Age on a profile is **optional guidance** for recommended plans, not a hard limit on available content.

Suggested learning focus by age (defaults only — all topics remain available in Settings):

| Age Group | Suggested Learning Focus (starting plan) |
|---|---|
| 4–5 | Counting, small number addition, very simple subtraction |
| 6–7 | Addition and subtraction up to 20 |
| 8–9 | Addition and subtraction up to 100, basic multiplication |
| 10–12 | Multiplication, division, mixed arithmetic, fractions, larger ranges |
| 13+ / unspecified | Editable bracket/default plan selected using optional age and confidence (§6.2); all topics remain available |

---

## 5. High-Level User Flow

The recommended first-time user flow is:

1. User opens the app.
2. App prompts **language selection** on first launch (English or Macedonian).
3. App collects profile label and learner name, then optional age and math confidence on a separate screen.
4. App creates and saves the recommended plan from age/confidence (§6.2); the first profile opens Home.
5. User can either start learning immediately or customize the plan.
6. User starts practice, quiz, or a timed run from the home screen (or **Try in practice** from Learn).
7. App presents math questions from the active profile’s enabled sources.
8. User answers via multiple choice or keyboard (depending on settings and question type); optional **Confirm** step for multiple choice.
9. App provides feedback based on the selected mode.
10. App displays progress or final result.
11. User can open **Settings** to switch profiles, edit personal info, change the learning plan, or **share settings** (export/import).
12. User can open **Learn** from home to browse tutorials by topic.

---

## 6. Onboarding Requirements

### 6.1 Profile setup (first launch and add profile)

After language selection, collect **profile label** and **learner name/nickname** together. Both fields must be nonempty. The label defaults to the next available “Profile N”.

Continue opens a separate screen for **optional age** and **optional math knowledge/confidence**. Age is initially blank. Confidence offers levels **1–5**; the visible initial selection is 3, but it is stored as unset unless changed.

Saving the first profile stores its recommended plan, completes onboarding and opens Home. The onboarding add-profile route uses the name/age steps and then opens the recommended-plan screen. Settings also provides a combined add/edit profile form.

### 6.2 Age and math confidence

Age accepts **1–150**, or may remain blank. Confidence is nullable, with values **1–5**. Neither limits available topics.

Recommendation selection:
- Both unset: use the neutral default, currently the **8–9** plan.
- Age only: ages up to 5 use **4–5**, 6–7 use **6–7**, 8–9 use **8–9**, and 10+ use **10–12**.
- Confidence provided: shift effective age by **2 × (level − 3)** years before selecting the bracket. Use age 8 as the base if age is absent; clamp effective age to 1–150.

An adult with age only currently receives the 10–12 starting plan, not a dedicated adult plan. Users can customize every topic.

### 6.3 Name / nickname (within profile setup)

The learner name should be used in the app to make the experience more personal.

Example usage:

- “Hi Alex!”
- “Great job, Alex!”

A nickname is accepted; a legal name is not required.

### 6.4 Recommended plan as default

Save the recommended plan with the profile so practice can begin without manual configuration. First-profile onboarding opens Home directly. Where the recommended-plan screen is shown, it offers Start learning and Customize. Later settings edits must not be overwritten by a stale onboarding recommendation.

---

## 7. Learning Plan Requirements

The learning plan defines which operations are enabled and what number ranges should be used for each operation.

The app should not use one global number range for all operations.

Each operation should have its own configuration because different operations require different ranges.

Example:

- Addition: numbers 1–100
- Subtraction: first number 1–100, second number 1–20
- Multiplication: numbers 1–10
- Division: answer 1–10, divisor 1–10

### 7.1 Operation Selection

The app should allow each operation to be enabled or disabled independently.

Available operations (each can be enabled or disabled independently):

- Addition
- Subtraction
- Multiplication
- Division
- Squaring
- Square roots
- Rounding (nearest 10, 100, whole, tenth, hundredth — see §8.5)
- Order of operations
- **Equivalent expressions** (identities, distribution, factorization)
- Equations with an unknown (`x`), with per-operator toggles when enabled
- Equations with two unknowns (`x` and `y`) — see §26
- **Geometry** (perimeter, area, volume — see §8.7)
- **Comparison** (see §25)
- **Fraction recognition** (visual bar and circle models — see §28)
- **Shapes** (recognition, colors, and visual patterns — see §28.6)
- **Numbers / early number sense** (see §39)
- **Clock / time** (see §31)
- **Patterns & sequences** (see §32)
- **Trigonometry** (see §38)
- **Logarithms** (see §41)
- **Differentiation** and **Integration** (see §34)
- **Linear and quadratic equations** (see §43)
- **Limits** (see §44)

There should not be a separate “Mixed” operation.

Mixed practice is created automatically when more than one operation is enabled.

Example:

| Operation | Enabled | Range |
|---|---:|---|
| Addition | Yes | 1–100 and 1–100 |
| Subtraction | Yes | 1–100 and 1–20 |
| Multiplication | Yes | 1–10 and 1–10 |
| Division | No | Not used |

In this example, the session is mixed because more than one operation is enabled.

### 7.2 Profiles

The app supports **multiple profiles** on one device.

Each profile stores:

- Profile name (switch label)
- Learner name or nickname
- Optional age and math confidence (nullable)
- Full learning plan (`MathLearningConfig`)
- Session history for that profile

Settings includes a profile switcher: switch, edit (select profile to load in editor), add profile, remove profile (when more than one exists).

Only one profile is **active** at a time for practice, quiz, timed runs, and progress views.

### 7.3 Per-operation question toggles (basic operations)

For addition, subtraction, multiplication, and division, each operation card includes toggles (not a global “question styles” card):

- Standard calculation
- **Regrouping** (addition and subtraction only): Off = no regrouping questions; On = mix of with and without regrouping
- Negative numbers (where applicable)
- **Decimals** (addition, subtraction, multiplication, division): Off = whole numbers only (current behavior); On = include decimal operands and/or answers per §8.1–§8.4
- Missing number
- Equations with `x` (per operation, where supported)
- **Word problems** (per operation)
- **Fractions** (with denominator mode: same only, different only, mix)

### 7.4 Geometry

When geometry is enabled, questions are drawn from a separate geometry source (not mapped onto addition/multiplication). See §8.7.

### 7.5 Word-problem scenarios (shipped)

The source of truth is `src/features/questions/wordProblemTemplates.ts` and its Macedonian counterpart. Current scenarios are:

| Operation | Ordinary scenarios | Signed-number scenarios |
|---|---|---|
| Addition | Stickers gained, birds landing in a tree, shells collected | Temperature rising or falling |
| Subtraction | Cookies eaten, marbles given away, passengers leaving a bus | Elevator moving between floors |
| Multiplication | Apples in bags, rows of stars, packs of pencils | Points lost per round, removal of point penalties |
| Division | Treats shared among friends, stickers in equal groups, pencils in equal piles | Average points gained or lost per round |

Signed templates are selected when an operand or result is negative. Example stories include three birds joined by two more (5), temperature rising from −3°C by 5 degrees (2°C), and an elevator descending five floors from floor 2 (floor −3). Word problems are text-based questions; visual word-problem rendering remains future work.

---

## 8. Operation Configuration Requirements

### 8.1 Addition Configuration

Addition should support two number ranges:

- First number range
- Second number range

Example:

```text
First number: 1–100
Second number: 1–100
```

Possible generated question:

```text
37 + 18 = ?
```

Although addition can often use the same range for both numbers, the app should support separate ranges for flexibility.

**Shipped toggles on the addition card:** standard calculation, regrouping, negative numbers, **decimals (1 decimal place)**, missing number, equations with `x`, word problems, fractions (with denominator mode).

**Regrouping:** When Off, generated whole-number addition questions never require carrying. When On, the session mixes questions with and without regrouping.

**Decimals toggle (shipped):**

- **Off:** whole-number operands and answers only.
- **On:** operands may be decimals drawn from configured ranges; answers may be decimal when the sum is non-integer.
- Decimal precision: **1 decimal place** in v1.
- Respects **maximum final result** cap where applicable (compare evaluated decimal result to cap).
- Example: `3.5 + 2.1 = ?` → `5.6`

### 8.2 Subtraction Configuration

Subtraction should support two number ranges:

- First number range
- Second number range

Example:

```text
First number: 1–100
Second number: 1–20
```

Possible generated question:

```text
86 - 7 = ?
```

Subtraction should also support a setting for negative answers.

Required setting:

```text
Allow answers below zero: Yes / No
```

**Shipped toggles on the subtraction card:** same pattern as addition (including regrouping, **decimals (1 decimal place)**, and word problems).

**Regrouping:** When Off, generated whole-number subtraction questions never require borrowing. When On, the session mixes with and without borrowing.

When answers below zero are disabled, invalid questions such as `3 - 8 = ?` must not be generated.

Default behavior should be:

```text
Allow answers below zero: No
```

When negative answers are not allowed, the generated question should ensure that the result is zero or greater.

Examples of valid questions:

```text
8 - 3 = ?
15 - 15 = ?
42 - 9 = ?
```

Examples of invalid questions when negative answers are disabled:

```text
3 - 8 = ?
4 - 12 = ?
```

**Decimals toggle (shipped):**

- **Off:** whole numbers only.
- **On:** decimal minuend/subtrahend allowed; result respects **Allow answers below zero** setting.
- Example: `5.2 − 1.8 = ?` → `3.4`

### 8.3 Multiplication Configuration

Multiplication should support two number ranges:

- First number range
- Second number range

Example:

```text
First number: 1–10
Second number: 1–10
```

Possible generated question:

```text
7 × 6 = ?
```

Multiplication ranges should usually be smaller than addition and subtraction ranges.

Recommended multiplication ranges:

- 1–5
- 1–10
- 1–12

**Shipped toggles on the multiplication card:** standard calculation, missing number, equations with `x`, word problems, fractions (with denominator mode), **decimals (1 decimal place)**.

**Decimals toggle (shipped):**

- **Off:** whole-number factors and products only.
- **On:** one or both factors may be decimals; product may be decimal.
- Prefer smaller decimal ranges when enabled (e.g. 0.1–9.9) to keep mental math feasible.
- Example: `2.5 × 4 = ?` → `10`; `0.3 × 0.2 = ?` → `0.06`

### 8.4 Division Configuration

Division should not be generated by randomly selecting a dividend and divisor, because that can create decimal answers.

Instead, division should be generated from a clean answer and divisor.

Division should support two ranges:

- Answer range
- Divisor range

Example:

```text
Answer: 1–10
Divisor: 1–10
```

Generation logic:

```text
answer = random number from answer range
divisor = random number from divisor range
dividend = answer × divisor
question = dividend ÷ divisor
correctAnswer = answer
```

Example:

```text
answer = 7
divisor = 6
dividend = 42
question = 42 ÷ 6 = ?
correct answer = 7
```

This guarantees whole-number division questions when decimals are **off**.

**Shipped toggles on the division card:** standard calculation, missing number, equations with `x`, word problems, fractions (with denominator mode), division remainders, **decimals (1 decimal place)**.

**Decimals toggle (shipped):**

- **Off:** current **clean whole-number** generation (answer × divisor = dividend) — unchanged.
- **On:** additional generation modes, e.g.:
  - Decimal dividend with whole divisor → decimal quotient
  - Whole dividend ÷ whole divisor → terminating decimal quotient (when exact)
- When decimals are off, never generate questions whose exact answer is non-integer.
- Example (decimals on): `7.5 ÷ 3 = ?` → `2.5`

### 8.5 Rounding configuration

Rounding should support:

- Enable/disable toggle
- Round to nearest **10**, **100**, **whole number**, **tenth**, and/or **hundredth** (at least one when enabled)
- A range of whole numbers to round (e.g. 1–99)

Example question:

```text
Round 47 to the nearest 10.
correct answer = 50
```

Rounding is **not** limited by the maximum final result setting (see §12).

### 8.6 Order of operations configuration

Order of operations should support:

- Enable/disable toggle
- Operand maximum (each of `a`, `b`, `c` in `a + b × c = ?` is chosen from 1…operandMax)

Generation must follow multiply-before-add (PEMDAS), not left-to-right.

Order of operations is **not** limited by the maximum final result setting (see §12).

### 8.7 Geometry configuration (shipped — Phase 1)

Geometry is configured on a dedicated **Geometry** card in Settings.

**Master toggle:** Geometry on/off.

**Measures** (each with its own on/off):

| Measure | Shapes (display order) |
|---|---|
| Perimeter | square, rectangle, triangle, circle, rhombus, kite, parallelogram, trapezoid |
| Area | square, rectangle, triangle, circle, rhombus, kite, parallelogram, trapezoid |
| Volume | cube, cuboid, square pyramid, triangular pyramid, cone, cylinder, triangular prism |

**Question types:**

- **Formula** — “What is the area formula for a …?” Multiple choice only; distractors are other formulas for the same measure.
- **Calculate** — Given dimensions (always integers **1–10**), find perimeter, area, or volume. Keyboard allowed for integer answers when global entry mode is keyboard.

**Answer entry overrides:**

- Formula questions: always multiple choice (even if keyboard mode is on).
- Circle perimeter/area and cone/cylinder volume calculate: multiple choice with **π forms** (e.g. `10π`, `25π`), not decimals.

**Progress:** Session stats roll up under operation label **Geometry**.

**Recommended plan (ages 10–12):** Square and rectangle perimeter and area enabled (formula + calculate) by default; other geometry off until user enables.

There are **no** dimension sliders for geometry; simplicity is intentional (focus on formulas and methods, not large-number arithmetic).

---

## 9. Suggested Configuration Data Model

The app should use operation-specific configuration instead of forcing all operations into one generic shape.

Suggested TypeScript model:

```ts
type AdditionConfig = {
  enabled: boolean;
  standardCalculation: boolean;
  allowNegativeNumbers: boolean;
  leftMin: number;
  leftMax: number;
  rightMin: number;
  rightMax: number;
  /** Addition-specific result cap. */
  answerMax: 10 | 20 | 50 | 100 | 1000 | 1000000 | 'unlimited';
  missingNumber: boolean;
  fractions: boolean;
  fractionDenominatorMode: 'same_only' | 'different_only' | 'mixed';
  regrouping: boolean;
  allowDecimals: boolean;
  wordProblems: boolean;
};

type SubtractionConfig = {
  enabled: boolean;
  standardCalculation: boolean;
  allowNegativeNumbers: boolean;
  firstMin: number;
  firstMax: number;
  secondMin: number;
  secondMax: number;
  missingNumber: boolean;
  allowNegativeAnswers: boolean;
  fractions: boolean;
  fractionDenominatorMode: 'same_only' | 'different_only' | 'mixed';
  regrouping: boolean;
  allowDecimals: boolean;
  wordProblems: boolean;
};

type MultiplicationConfig = {
  enabled: boolean;
  /** First factor is selected from these multiplication tables. */
  factors: number[];
  secondFactorSource: 'selection_only' | 'one_to_ten' | 'one_to_twenty';
  randomizeFactorOrder: boolean;
  standardCalculation: boolean;
  allowNegativeNumbers: boolean;
  missingNumber: boolean;
  fractions: boolean;
  fractionDenominatorMode: 'same_only' | 'different_only' | 'mixed';
  allowDecimals: boolean;
  wordProblems: boolean;
};

type DivisionConfig = {
  enabled: boolean;
  standardCalculation: boolean;
  allowNegativeNumbers: boolean;
  answerMin: number;
  answerMax: number;
  divisors: number[];
  allowRemainders: boolean;
  missingNumber: boolean;
  fractions: boolean;
  fractionDenominatorMode: 'same_only' | 'different_only' | 'mixed';
  allowDecimals: boolean;
  wordProblems: boolean;
};

type MathLearningConfig = {
  addition: AdditionConfig;
  subtraction: SubtractionConfig;
  multiplication: MultiplicationConfig;
  division: DivisionConfig;
  square: SquareConfig;
  squareRoot: SquareRootConfig;
  rounding: RoundingConfig;
  orderOfOperations: OrderOfOperationsConfig;
  equivalentExpressions: EquivalentExpressionsConfig;
  equationUnknown: EquationUnknownConfig;

  /** Shipped — Phase 1 geometry. */
  geometry: GeometryConfig;

  /** Shipped — see §25. */
  comparison: ComparisonConfig;

  /** Shipped — see §26 */
  equationTwoUnknowns: EquationTwoUnknownsConfig;

  /** Shipped — see §28 */
  fractionVisual: FractionVisualConfig;

  /** Shipped — see §28.6 */
  shapeRecognition: ShapeRecognitionConfig;

  /** Shipped — see §39 */
  numberSense: NumberSenseConfig;

  /** Shipped (partial) — see §31 */
  clock: ClockConfig;

  /** Shipped — see §32 */
  patterns: PatternsConfig;

  /** Shipped — see §38 */
  trigonometry: TrigonometryConfig;

  /** Shipped — see §41 */
  logarithm: LogarithmConfig;
  /** Shipped — see §43 */
  advancedEquations: AdvancedEquationsConfig;
  /** Shipped — see §44 */
  limits: LimitsConfig;

  /** Shipped — see §34 */
  differentiation: CalculusOpConfig;
  integration: CalculusOpConfig;

  mode: 'practice' | 'quiz' | 'timed';
  questionsCount: number;
  answerEntryMode: 'multiple_choice' | 'keyboard';
  answerOptionsCount: 2 | 3 | 4 | 6;
  /** Shipped — MC only; requires Confirm tap before answer is counted */
  confirmAnswerBeforeSubmit: boolean;
  /** Legacy migration field; current answer limit is addition.answerMax. */
  maxFinalResult: 10 | 20 | 100 | 1000 | 'unlimited';
  timerEnabled: boolean;
  timerSecondsPerQuestion: number;
  timedDurationMinutes: 0.25 | 0.5 | 1 | 2 | 3 | 5 | 10;
  /** Legacy mirror retained for persisted plans. */
  timedSubtractSecondsOnWrong: boolean;
  timedWrongPenaltySeconds: number;
  timedCorrectBonusSeconds: number;
};

/** Shipped — see §8.7 */
type GeometryConfig = {
  enabled: boolean;
  perimeter: { enabled: boolean; shapes: { square; rectangle; triangle; circle; rhombus; kite; parallelogram; trapezoid } };
  area: { enabled: boolean; shapes: { square; rectangle; triangle; circle; rhombus; kite; parallelogram; trapezoid } };
  volume: { enabled: boolean; shapes: { cube; cuboid; pyramid; triangular_pyramid; cone; cylinder; triangular_prism } };
  questionKinds: { formula: boolean; calculate: boolean };
};

/** Shipped — see §25 */
type ComparisonConfig = {
  enabled: boolean;
  /** Shipped */
  relational: boolean;
  ordering: boolean;
  expressionCompare: boolean;
  fractionVsDecimal: boolean;
  percentVsFraction: boolean;
  fractionVsFraction: boolean;
  measurementUnitConversion: boolean;
};

/** Shipped — see §26 */
type EquationTwoUnknownsConfig = {
  enabled: boolean;
  operators: { addition; subtraction; multiplication; division };
};

/** Shipped — see §28 */
type FractionVisualConfig = {
  enabled: boolean;
};

/** Shipped — see §28.6 */
type ShapeRecognitionConfig = {
  enabled: boolean;
  shapeQuestions: boolean;
  colorQuestions: boolean;
  colorAndShapeQuestions: boolean;
  shapes: Record<'circle' | 'square' | 'rectangle' | 'triangle' | 'star' | 'oval', boolean>;
};

/** Shipped (partial) — see §31 */
type ClockConfig = {
  enabled: boolean;
  readAnalog: boolean;
  elapsedTime: boolean;
  hourFormat: 12 | 24;
  minuteGranularity: 5 | 15 | 1;
};

/** Shipped — see §32 */
type PatternsConfig = {
  enabled: boolean;
  arithmeticSequence: boolean;
  geometricSequence: boolean;
  shapePattern: boolean;
  numberPattern: boolean;
  coloredShapePattern: boolean;
};

/** Shipped — visual counting/quantity comparison may be surfaced with Shapes in the UI. */
type NumberSenseConfig = {
  enabled: boolean;
  /** Retained for migration but not generated. */
  numberRecognition: boolean;
  countObjects: boolean;
  beforeAfter: boolean;
  missingNumber: boolean;
  compareQuantities: boolean;
  oddEven: boolean;
  maxNumber: 5 | 10 | 20 | 100;
};

/** Shipped — see §38 */
type TrigonometryConfig = {
  enabled: boolean;
  ratios: { sin: boolean; cos: boolean; tan: boolean; cot: boolean };
  questionKinds: { pickFormula: boolean; nameSide: boolean; findAngle: boolean };
};

/** Shipped — see §41 */
type LogarithmConfig = {
  enabled: boolean;
  productRule: boolean;
  quotientRule: boolean;
  powerRule: boolean;
  /** log₂, log₃, log₅, log₁₀ — integer answers */
  numericLog: boolean;
  /** ln(e), ln(e²), etc. */
  numericLn: boolean;
};

/** Shipped — see §43 */
type AdvancedEquationsConfig = {
  enabled: boolean;
  multiStepLinear: boolean;
  variablesBothSides: boolean;
  linearParentheses: boolean;
  factorableQuadratic: boolean;
};

/** Shipped — see §44 */
type LimitsConfig = {
  enabled: boolean;
  directSubstitution: boolean;
  factorAndCancel: boolean;
  limitsAtInfinity: boolean;
  rationalization: boolean;
};

/** Shipped — see §34 */
type CalculusOpConfig = {
  enabled: boolean;
  powerRule: boolean;
  constantRule: boolean;
  simpleSum: boolean;
  naturalLogRule: boolean;
  trigRule: boolean;
  /** Differentiation: quotient rule; Integration: simplify fractions then integrate */
  quotientRule: boolean;
};

/** Shipped — see §27; content/navigation, not session generation */
type LearnTopicId =
  | 'shapes' | 'numbers' | 'patterns' | 'clock'
  | 'addition' | 'subtraction' | 'multiplication' | 'division'
  | 'comparison' | 'rounding' | 'fractions'
  | 'squaring' | 'square_roots' | 'geometry' | 'order_of_operations'
  | 'equivalent_expressions'
  | 'equations_xy'
  | 'trigonometry' | 'logarithm' | 'advanced_equations' | 'limits'
  | 'differentiation' | 'integration';
```

**Profiles (shipped):** Persisted separately from `MathLearningConfig`:

```ts
type LearnerProfile = {
  id: string;
  profileName: string;
  name: string;
  age: number | null;
  mathKnowledgeLevel: 1 | 2 | 3 | 4 | 5 | null;
  learningConfig: MathLearningConfig | null;
  sessionHistory: SessionHistoryEntry[];
};
```

*(Implementation may still use `ChildProfile` as the persisted type name for backward compatibility.)*

---

## 10. Recommended Learning Plan by Age and Confidence

Bracket plans are starting suggestions selected using §6.2. Current defaults are defined in `src/features/learning-plan/recommendedLearningPlan.ts`; this table summarizes selected fields instead of duplicating full configuration objects.

| Bracket | Addition operand ranges | Addition answer cap | Questions | Answer choices |
|---|---|---:|---:|---:|
| 4–5 | 1–5 and 1–5 | 10 | 5 | 2 |
| 6–7 | 1–20 and 1–20 | 100 | 10 | 3 |
| 8–9 | 1–100 and 1–100 | 1000 | 10 | 4 |
| 10–12 | 1–100 and 1–100 | 1000 | 10 | 4 |

The youngest plan includes Shapes and Numbers alongside addition. The 6–7 plan enables subtraction and Numbers; 8–9 enables multiplication; 10–12 enables division and basic geometry. Neutral defaults currently reuse the 8–9 plan. Confidence can shift the bracket (§6.2).

Default mode is Practice, per-question timer is off, and confirm-before-submit is off. Timed configuration starts at 1 minute with a 5-second wrong-answer penalty and 2-second correct-answer bonus.

---

## 11. Learning Plan UI Requirements

Settings is a hub for the active profile:

- **Profile details:** switch, add, edit or remove profiles; edit label, learner name, optional age and confidence.
- **Session settings:** mode, question count, answer entry, answer choices, confirmation and timers.
- **Topics:** topic-specific enable switches, ranges, question styles and examples.
- **Share settings:** export/import a settings file (§62).
- **About:** build/update information.

Topic cards own their controls; there is no global question-style card. Geometry owns measures, shapes and question types. Editable sub-screens provide Save and protect unsaved changes (§40). Focused Learn → Try shows only the selected topic and offers start-only or save-and-start.

The Topics hub groups settings into **Foundations**, **Operations**, **Advanced topics**, and **Calculus**. These are navigation groups for the existing 23 curriculum topics, not additional topics. Learn retains its full ordered topic list rather than this grouped settings navigation.

---

## 12. Range Selection Requirements

Current preset controls:

- **Addition/subtraction:** independent operand upper-limit sliders, lower bound 1, with stops at **5, 10, 20, 50, 100, 1000, 1,000,000**.
- **Multiplication:** selected tables **1–10**, second-factor source **selected only / 1–10 / 1–20**, and optional factor-order randomization.
- **Division:** quotient presets **1–5 / 1–10 / 1–12** and individually selected divisors **1–10**.
- Other topics retain dedicated controls; geometry dimensions are generated rather than configured with sliders.

### Addition maximum answer

The addition card has a separate answer-limit slider: **10, 20, 50, 100, 1000, 1,000,000, Unlimited**. It limits addition results independently of operand ranges.

For a finite limit, ordinary numeric addition answers must lie between 0 and the limit, or between the negative and positive limit when negative addition numbers are enabled. Addition distractors use the corresponding band. Addition validation reports incompatible operand ranges and answer limits. Arithmetic fraction questions take a separate generator path that bypasses this shared cap check; the cap is not a universal promise for every addition question style.

The shared answer-cap check applies **only to addition**. Subtraction, multiplication, division, squares, roots and other operations follow their own settings. Questions routed through addition, including its unknown-equation forms, use addition's answer band where that check is applied.

`maxFinalResult` is a **legacy persisted field** retained for normalization/migration, not a current global user-facing limit. Current addition configuration uses `addition.answerMax`.

---

## 13. Practice, Quiz, and Timed Modes

The app supports three session modes (configured on the learning plan).

### 13.1 Practice Mode

Practice mode is the default mode.

In practice mode:

1. App shows one question.
2. User selects an answer (or types in keyboard mode).
3. If **Confirm answer** is on and the question uses multiple choice, user taps **Confirm** before feedback.
4. App immediately shows whether the answer is correct or wrong.
5. App shows the correct answer if the selected answer is wrong.
6. User continues to the next question.

Practice mode is optimized for learning.

### 13.2 Quiz Mode (shipped)

Quiz mode is supported alongside practice mode.

In quiz mode:

1. App shows a fixed number of questions.
2. User answers each question.
3. App does not immediately show correct/wrong feedback after each question.
4. App displays the result at the end.

Quiz mode is optimized for checking knowledge.

Suggested result display:

```text
You answered 8 out of 10 correctly.
Score: 80%
Great job!
```

### 13.3 Timed mode (shipped)

In timed mode:

1. User has a **total session clock** with presets of **15 seconds, 30 seconds, 1, 2, 3, 5, or 10 minutes**.
2. Questions are generated one after another until time runs out.
3. A configurable wrong-answer penalty subtracts **0–15 seconds**; `0` disables it.
4. A configurable correct-answer bonus adds **0–5 seconds**; `0` disables it.
5. Per-question timer from practice/quiz does not apply; timed mode uses the session clock only.
6. Result screen shows score and per-question breakdown (like quiz), including timed-run duration data.

Timed mode does not use a fixed question count setting.

After a submitted answer, show correctness feedback and any time adjustment, then automatically advance after approximately **600 ms**. The session clock continues during feedback. Remaining time cannot go below zero; correct-answer bonuses can extend it beyond the original duration, with no runtime upper cap. Only submitted answers enter the result; the unanswered question visible when time expires is excluded.

### 13.4 Per-question timer (Practice and Quiz)

- Optional and off by default; configurable from **10 to 120 seconds** in **5-second steps**, with a stored default of **45 seconds**.
- Expiry locks the question and records no answer when the learner continues; it counts as wrong in scoring. Practice reveals feedback, while Quiz withholds correctness until the result screen.
- A selected multiple-choice answer awaiting confirmation is not protected from expiry. The timer stops when the answer is accepted; without confirmation enabled, selecting a Quiz option stops the timer, while Next/Finish advances the session.
- Learn → Try uses an open-ended, untimed practice loop and does not apply this timer.

---

## 14. Question Count Requirements

The app should allow the number of questions in a session to be configured.

Shipped options for Practice and Quiz (not Timed or Learn → Try):

- 5 questions
- 10 questions
- 15 questions
- 20 questions

Default recommendation:

| Age Group | Default Question Count |
|---|---:|
| 4–5 | 5 |
| 6–7 | 10 |
| 8–9 | 10 |
| 10–12 | 10 |

---

## 15. Answer Input Requirements

The app supports two answer entry modes (configurable on the learning plan):

- **Multiple choice** — 2, 3, 4, or 6 answer choices (default for younger users)
- **Keyboard** — user types numeric answers, fractions (`3/4`), or equation expressions after `x=` where supported; question types with awkward or symbolic formats fall back to multiple choice

Optional **Confirm answer** toggle (multiple choice only):

- **Off (default):** tapping an option submits immediately (practice shows feedback at once; timed counts the answer at once).
- **On:** user selects an option, then taps **Confirm** before the answer is counted. Practice shows feedback after confirm; timed submits on confirm.

Reasons to default to multiple choice:

- Easier on mobile devices
- Easier for beginners and quick practice
- Faster and more game-like experience

### 15.1 Answer options count

Supported options: **2, 3, 4, 6** (not 5).

Recommended defaults:

| Age Group | Answer Choices |
|---|---:|
| 4–5 | 2 |
| 6–7 | 3 |
| 8–9 | 4 |
| 10–12 | 4 |

### 15.2 Keyboard mode (shipped)

When keyboard mode is selected:

- Whole-number arithmetic accepts numeric input.
- Arithmetic fraction questions and visual fraction-recognition questions accept `numerator/denominator`, a reducible equivalent (for example `8/10` for `4/5`), or an equivalent decimal.
- Equation-unknown questions accept expression after `x=` (e.g. `4`, `20:5`).
- Equations with two unknowns accept numeric keyboard answers for the requested value.
- Geometry **integer** calculate questions accept numeric input.
- Number-sense questions with numeric answers (count objects, before/after, and missing number) accept numeric input.

**Keyboard is not offered when:**

- The generated question asks for a division quotient and remainder. This is a per-question override, not a blanket keyboard restriction whenever division remainders are enabled.
- Geometry **formula** questions (always multiple choice).
- Geometry **π-form** calculate questions (circle, cone, cylinder — always multiple choice, e.g. `10π`).
- Comparison, equivalent expressions, shapes, clock, patterns, trigonometry, **logarithms**, **linear and quadratic equations**, **limits**, and **calculus** questions (always multiple choice in v1).
- Number-sense label questions (odd/even and compare quantities) remain multiple choice.

Settings shows a note when geometry is enabled and keyboard is selected: formula and π questions still use answer choices.

### 15.3 Multiple-choice-only topics

Comparison questions (§25), shape recognition (§28.6), clock/time (§31), patterns (§32), trigonometry (§38), **logarithms (§41)**, **linear and quadratic equations (§43)**, **limits (§44)**, and **calculus (§34)** are **multiple choice only** in all modes. Visual fraction identification (§28) follows the global answer-entry preference and supports fraction keyboard entry.

Example with 2 answers:

```text
2 + 3 = ?

[4] [5]
```

Example with 4 answers:

```text
7 × 6 = ?

[36] [42] [48] [56]
```

---

## 16. Answer Option Generation Requirements

For each question, the app should generate:

- One correct answer
- A set of wrong answers
- A shuffled list of possible answers

The correct answer must always be included exactly once.

Wrong answers should:

- Be close enough to the correct answer to be meaningful
- Not duplicate the correct answer
- Not duplicate each other
- Not be negative unless negative answers are part of the configured learning plan

Example:

Question:

```text
8 + 7 = ?
```

Correct answer:

```text
15
```

Possible answers:

```text
[13] [15] [16] [18]
```

The order of answers should be randomized.

---

## 17. Question Generation Requirements

### 17.0 Addition answer limit

Use `addition.answerMax` as described in §12. For numeric addition questions passing through the cap check, a finite limit requires `0 ≤ correctAnswer ≤ cap`, or `−cap ≤ correctAnswer ≤ cap` when negative addition numbers are enabled. Unlimited disables this ceiling. Arithmetic fraction questions bypass this shared check (§12).

The shared cap helper bypasses every operation other than addition. Do not apply legacy `maxFinalResult` as a global arithmetic cap. Addition sampling and validation respect operand ranges and the addition answer limit together.

### 17.6 Rounding generation

Logic:

```text
n = random whole number from configured value range
unit = nearest 10 and/or 100 (per enabled rounding modes)
correctAnswer = round n to unit
```

Example:

```text
Round 47 to the nearest 10.
correctAnswer = 50
```

The maximum final result setting does not constrain rounding questions or their multiple-choice distractors.

### 17.7 Order of operations generation

Logic (PEMDAS — multiply before add):

```text
a, b, c = random integers from 1…operandMax
correctAnswer = a + b × c
question = "a + b × c = ?"
```

Example:

```text
3 + 4 × 5 = ?
correctAnswer = 23   (not 35 from left-to-right)
```

Wrong multiple-choice options should include common mistakes (e.g. `(a + b) × c`, `a + b + c`). The maximum final result setting does not constrain these answers or distractors.

### 17.1 Operation Selection

When a session starts, the app should identify all enabled operations.

If only one operation is enabled, all questions should use that operation.

If multiple operations are enabled, the app should randomly select from the enabled operations.

Generation attempts to avoid repeated **question text** within a Practice/Quiz batch and across a Timed run. It falls back to valid repeats after bounded attempts, so uniqueness is not guaranteed for small pools. Learn → Try generates one question at a time without retaining a cross-question uniqueness set. If no valid question can be generated, the session presents a settings/generation error rather than starting with invalid content.

Example:

Enabled operations:

- Addition
- Subtraction
- Multiplication

Disabled operations:

- Division

The app should generate a mix of addition, subtraction, and multiplication questions.

### 17.2 Addition Generation

Logic:

```text
left = random number from left range
right = random number from right range
correctAnswer = left + right
```

Question format:

```text
left + right = ?
```

### 17.3 Subtraction Generation

Logic when negative answers are disabled:

```text
first = random number from first range
second = random number from second range

if second > first:
  swap first and second

correctAnswer = first - second
```

Question format:

```text
first - second = ?
```

Logic when negative answers are enabled:

```text
first = random number from first range
second = random number from second range
correctAnswer = first - second
```

### 17.4 Multiplication Generation

Logic:

```text
left = random number from left range
right = random number from right range
correctAnswer = left × right
```

Question format:

```text
left × right = ?
```

### 17.5 Division Generation

Logic:

```text
answer = random number from answer range
divisor = random number from divisor range
dividend = answer × divisor
correctAnswer = answer
```

Question format:

```text
dividend ÷ divisor = ?
```

This ensures whole-number answers.

### 17.8 Geometry generation (shipped)

When geometry is enabled, questions are picked from a separate geometry source (not mapped onto basic operations).

- **Formula:** Random enabled shape + measure; correct formula vs distractors from other formulas for the same measure.
- **Calculate:** Integer dimensions **1–10**; evaluate perimeter, area, or volume per shape rules.
- **π-form answers:** Circle perimeter/area and cone/cylinder volume use multiple-choice answers like `10π`, not decimal approximations.
- Geometry uses its own settings and is not subject to the addition answer limit (§12).

See §8.7 for shape lists and answer-entry overrides.

---

## 18. Session Behavior Requirements

A session is a set of generated questions based on the current learning plan.

A session should include:

- Current question number
- Total question count
- Current score or progress indicator
- Question text
- Possible answers
- Feedback area

Example:

```text
Question 3 of 10

8 + 6 = ?

[12] [13] [14] [16]
```

### 18.1 Correct Answer Feedback

In practice mode, when the user selects the correct answer, the app should show positive feedback.

Example messages:

- Correct!
- Great job!
- Well done!
- Nice work!

### 18.2 Wrong Answer Feedback

In practice mode, when the user selects the wrong answer, the app should show the correct answer.

Example:

```text
Not quite. The correct answer is 14.
```

The tone should be encouraging, not negative.

### 18.3 Moving to Next Question

Practice and Learn → Try use a **Next** button after feedback, giving the learner time to read it. Quiz advances with Next/Finish without revealing correctness. Timed automatically advances after its brief feedback interval (§13.3).

The full visible area of the primary session button—including its left and right sides, not only the centered label—must be tappable. The touch target should remain forgiving inside scrollable practice and quiz layouts.

---

## 19. Scoring Requirements

The app should track session results.

For each session, the app should track:

- Total questions
- Correct answers
- Wrong answers
- Score percentage

Score formula:

```text
scorePercentage = round(correctAnswers / totalQuestions × 100)
```

Example:

```text
Correct answers: 8
Total questions: 10
Score: 80%
```

A session with zero submitted questions has a score of **0%**. Practice/Quiz timeouts count as wrong; an unanswered question at timed-run expiry is not an attempt (§13).

At the end of a session, the app should show a result summary.

Example:

```text
Great job, Alex!

You answered 8 out of 10 correctly.
Score: 80%
```

---

## 20. Progress and Persistence Requirements

The app persists data locally (Zustand + AsyncStorage) per **profile**.

Each profile stores:

- Profile name (switch label)
- Learner name or nickname
- Optional age and math confidence (nullable)
- Full learning plan (`MathLearningConfig`)
- Session history for that profile

The app remembers the **active profile id** and migrates legacy single-user data into **Profile 1** when needed.

Language selection is device-wide and persisted separately from profiles. Active questions, partial answers, timers, and the immediate result detail are not persisted for session resumption. Leaving an unfinished session does not create a completed-history entry. Removing a profile also removes its local settings and history; the final remaining profile cannot be removed through profile management.

On app start:

- If onboarding is completed for the active profile, app goes to the home screen.
- If onboarding is not completed, app starts profile setup.

**Progress screen (shipped):** Streak card at top; **Sessions** list with mode filter (All / Practice / Quiz / Timed run), filtered average score, and expandable session rows; **By topic** accuracy at the bottom (filtered by the selected mode, hidden when there is no data). Timed-run rows show start duration, penalty/bonus settings, total survived time, and correct/wrong counts when expanded. Up to **50** recent sessions are stored and shown per profile. Streak and gentle **adaptation** hints remain on the home screen when recent misses cluster on one enabled operation.

---

## 21. Main Screens

The app includes the following screens.

### 21.1 Language selection (first launch)

Purpose:

- Choose **English** or **Macedonian** before the main app navigation loads.

Main action:

- Continue → profile setup

### 21.2 Profile setup (onboarding)

Collect profile label and learner name/nickname together. Continue opens the separate age/confidence screen. Both names are required; the profile label has a generated default.

### 21.3 Onboarding: Age and confidence screen

Collect optional age (1–150) and optional math confidence (1–5). Save the profile and recommended plan using §6.2. First launch completes onboarding and opens Home; the onboarding add-mode route opens the recommended-plan screen.

### 21.4 Recommended plan screen

Where used by the add-profile onboarding route, show the prepared plan and offer Start learning or Customize. This is not a mandatory first-launch step.

### 21.5 Settings / learning plan screen

Purpose:

- Hub for profile, session, topic, share, and about actions for the active profile.
- Switch, edit, add, or remove profiles (Profile details).
- Edit personal info (profile name, learner name, optional age and confidence).
- Configure operations, ranges, geometry, mode, question count, answer entry, timers, and caps (Session settings and Topics sub-screens).
- Export or import session and topic settings as a JSON file (Share settings — §62).

Suggested hub actions:

```text
Settings
  Profile details
  Session settings
  Topics
  Share settings        → Export settings | Import settings
  About
```

Main action on sub-screens:

- Save / Start session (practice, quiz, or timed per selected mode)

### 21.6 Home screen

Purpose:

- Start practice, quiz, or timed run with the active profile’s plan.
- Navigate to Settings, Progress, and **Learn**.

### 21.7 Practice session screen

Purpose:

- Show one question at a time.
- Multiple choice or keyboard (per settings and question type).
- Immediate feedback after each answer.

### 21.8 Quiz session screen

Purpose:

- Fixed question count; no per-question feedback until the end.
- Result screen with score and breakdown.

### 21.9 Timed session screen (shipped)

Purpose:

- Session clock (15 seconds–10 minutes); questions until time expires, with bonuses able to extend the run (§13.3).
- Configurable wrong-answer penalty (0–15 seconds, default 5) and correct-answer bonus (0–5 seconds, default 2).
- Result screen with score and per-question breakdown.

### 21.10 Progress screen (shipped)

Purpose:

- Show learning streak, recent sessions (with mode filter and expandable detail rows), and topic accuracy for the active profile.

Layout (top → bottom):

1. **Streak** card (consecutive practice days)
2. **Sessions** — filter chips (All / Practice / Quiz / Timed run), optional filtered average, accordion list of recent sessions (collapsed by default; chevron to expand)
3. **By topic** — operation accuracy bars for the filtered sessions (section hidden when no stats exist)

Session row details when expanded:

- **Practice / Quiz:** total questions, correct count, wrong count
- **Timed run:** configured start duration, wrong-answer penalty, correct-answer bonus, total survived time, correct count, wrong count

Empty states are mode-specific (e.g. “Finish a timed run…” when Timed filter is selected).

See §36 for timed-run detail requirements.

### 21.11 Result screen

Purpose:

- Show final session result (quiz or timed).
- Encourage the learner.
- Retry or return home.

Main actions:

- Practice again
- Change learning plan / Settings
- Go home

### 21.13 Share settings screen (shipped)

Purpose:

- Export the active profile’s **session and topic settings** to a JSON file, or import settings from a file exported by The Real Math App.

Flow:

```text
Settings → Share settings → Export settings | Import settings
```

Import may **create a new profile** (default) or **replace settings** on the active profile (with confirmation). See §62.

### 21.12 Learn (shipped)

Purpose:

- Reference library of tutorials by topic (see §27).
- Browse-only; not mixed into practice sessions unless user taps “Try in practice.”

Flow:

```text
Home → Learn → Topic list → Tutorial for selected topic
```

---

## 22. Shipped Core Scope

The current shipped product includes:

- **Multi-profile** support: profile name, learner name, optional age and confidence; switch / edit / add / remove in Settings
- **Internationalization:** English and Macedonian UI; first-run language picker; localized Learn tutorials (mk overrides), word problems, privacy policy, and operation labels (§42)
- Profile setup onboarding (label/name, then optional age and confidence); age **1–150**; recommendations follow §6.2
- Recommended learning plan by age; full learning plan customization per profile
- Operations: addition, subtraction, multiplication, division, squaring, square roots, rounding, order of operations, equations with one unknown (`x`) and two unknowns (`x`, `y`), **linear and quadratic equations**, **limits**, and **equivalent expressions**
- Per-operation toggles: standard calculation, missing number, word problems, fractions (with denominator mode), regrouping (add/sub), division remainders, **decimals (1 decimal place)**
- Multiplication-table selection with a configurable second-factor pool (`selected only`, `1–10`, or `1–20`) and optional randomized factor order
- Addition-specific maximum result setting, with legacy global-cap migration retained for older saved profiles
- **Comparison:** relational, ordering, expression compare, fraction/percent/measurement subtypes
- **Shapes:** identify shape, color, or both; continue shape and colored-shape cycles using the selected shape pool
- **Numbers:** before/after, missing number, odd/even; numeric keyboard entry where applicable; visual counting and quantity comparison configured under Shapes
- **Clock / time:** analog read and elapsed time
- **Patterns & sequences:** arithmetic, geometric, and number patterns; visual shape patterns live under Shapes
- **Settings workflow:** collapsible enabled sections, header save action, unsaved-changes navigation confirmation, and focused Learn → Try settings
- **Learn** reference library with **23 topics** (easiest → hardest), formula tables, and **Try in practice** for every topic
- **Fraction recognition:** visual bar and circle models; multiple choice or typed fraction/decimal according to the global answer-entry preference
- **Logarithms:** product, quotient, and power rules; numeric log (bases 2, 3, 5, 10) and ln values (§41)
- **Differentiation & Integration:** symbolic MC — power rule, constants, simple sums, natural log, sin/cos, quotient rule (differentiation) / simplify fractions (integration) (§34)
- **Linear & Quadratic Equations:** multi-step linear, variables on both sides, parentheses, and factorable quadratic questions (§43)
- **Limits:** direct substitution, factor-and-cancel, infinity, and rationalization questions (§44)
- **Trigonometry v1:** right-triangle diagrams; pick formula, name sides, find angle; MC only — no numeric calculation (§38)
- **Privacy policy** in-app screen (Home)
- **Compact question card** layout for short prompts with visuals below (clock, shapes, fractions, patterns, trigonometry)
- **Geometry Phase 1:** perimeter and area for square, rectangle, triangle, circle, rhombus, kite, parallelogram, and trapezoid; volume for cube, cuboid, square/triangular pyramids, cone, cylinder, and triangular prism; formula + calculate; π-form multiple choice for circle/cone/cylinder
- Session modes: **practice**, **quiz**, **timed**
- Answer entry: multiple choice (**2, 3, 4, 6** choices) or **keyboard** (with overrides for geometry formula/π, division remainders, and MC-only topics)
- **Confirm before submit** for multiple choice (optional toggle)
- Configurable question count, per-question timer, timed session duration, timed wrong-answer penalty, and timed correct-answer bonus
- Addition answer limit; legacy global-cap field retained for migration (§12)
- **Gentle adaptation** hints on home (focused practice suggestion from recent misses)
- Progress: streak card; session history with mode filter and expandable rows; topic accuracy by operation (§36); up to **50** stored sessions per profile; gentle adaptation card on home
- **Share settings:** export/import session and topic settings as JSON; no learner name, age, or progress in the file (§62)
- Local persistence (Zustand + AsyncStorage); legacy single-profile migration
- Build/update stamping and an in-app About screen (app version, last package/update date, update message); current runtime baseline is Expo SDK 57
- **Learn Try in practice:** open-ended single-question loop; optional save-to-profile; does **not** write session history

**Known partial / not generated:**

- `numberRecognition` toggle exists in Numbers config but is **not generated** (retired subtype)
- `EquationUnknownConfig.mode` (`off` / `mixed` / `only`) exists in types but has **no settings UI** — behavior is driven by per-operation equation toggles only

This section documents what is built today. See **§29** for the detailed status table.

---

## 23. Features to Avoid (Early Versions)

Avoid unnecessary complexity in early releases:

- Complex grading systems and heavy gamification
- Too many subcategories on one screen
- Unrestricted range controls where shipped discrete presets are sufficient
- User accounts and cloud sync (until explicitly scoped)
- Leaderboards and social features
- Parent dashboard (until explicitly scoped)
- Interactive “shade the fraction” questions in v1 of fraction visuals (identification first — see §28)

These may be added later when they clearly serve learning goals.

---

## 24. Implementation Roadmap

### 24.1 Shipped (summary)

See **§29 Implementation status** for a detailed shipped vs planned table. Highlights: profiles, geometry Phase 1, comparison, equations with `x` and `xy`, linear and quadratic equations, limits, equivalent expressions, Learn (23 topics) and focused Try configuration, fraction visuals, Shapes, Numbers, clock/time, numeric and visual patterns, decimal toggles, trigonometry v1, **logarithms**, calculus (ln/trig/quotient), timed mode, keyboard entry, confirm before submit, regrouping, word problems, fractions, progress tracking, gentle adaptation, privacy policy, English + Macedonian UI, and compact visual layouts.

### 24.2 Shipped (recent)

- Decimal toggles on basic operations (§8.1–§8.4) — **1 decimal place**
- Expanded comparison subtypes (§25.5–§25.8)
- Clock / time (§31) — analog read + elapsed; no digital-read subtype yet
- Patterns & sequences (§32)
- Shapes: recognition, colors, and visual patterns
- Numbers / early number sense (§39)
- Colored shape patterns with two- or three-item cycles
- Collapsible Settings sections, top save action, and unsaved-changes confirmation
- Learn → Try focused settings with optional save to the active profile
- Differentiation & Integration expanded (§34): natural log, sin/cos, quotient rule / simplify fractions
- **Logarithms** (§41): product, quotient, power rules; numeric log and ln
- Trigonometry v1 (§38) — pick formula, name sides, find angle; diagram labels; MC only
- Linear & Quadratic Equations v1 (§43)
- Limits v1 (§44)
- **Confirm before submit** for multiple choice
- **English + Macedonian** UI (§42)
- In-app privacy policy
- Compact question card for visual prompts (including trigonometry diagrams)
- Gentle adaptation card on home (focused practice via `?focus=` parameter)
- Visual fraction keyboard entry, including equivalent fractions and decimal values
- Configurable timed-run wrong-answer penalty and correct-answer bonus
- Expo SDK 57 runtime upgrade and build/update stamp display

### 24.3 Later

For potential curriculum topics, the first implementation should prefer text, existing math notation, reusable shape components, and compact tables. Features that require a new general-purpose renderer—interactive graph plotting, generated angle diagrams, protractors, map artwork, chart drawing, or free-form matrix entry—are deferred unless separately scoped.

- Dedicated decimals & percentages module (beyond op-level toggles)
- Money word problems
- Equivalent-fraction and fraction-of-a-number questions (nonvisual), plus any comparison formats beyond the shipped §25 subtypes
- Badges and rewards
- Parent dashboard
- Cloud sync and multiple devices
- Custom worksheets
- Stronger adaptive difficulty
- Visual word problems with objects or pictures
- Learn section quality pass (§35)
- Tappable session history → question review (§37)
- Digital clock read; imperial measurement; pattern keyboard entry
- Trigonometry numeric calculation (evaluate ratios, solve for missing sides or angles — beyond §38 v1)
- Ratios and proportions, including whole-number resource-duration word problems (§45)
- Least Common Multiple and Greatest Common Divisor (§46)
- Decade-based number reasoning with parity, successor, and predecessor (§47)
- Matrices: addition, subtraction, and matrix multiplication (§48)
- Place value and number decomposition / expanded form, such as `82 = 80 + 2` (§49)
- Factors, multiples, primes, and divisibility (§50)
- Percentages (§51)
- Integer extensions beyond the shipped negative arithmetic (§52)
- Powers and exponents (§53)
- Text-first angle reasoning (§54)
- Coordinate reasoning without a plotted graph in v1 (§55)
- Measurement and unit conversion extensions (§56)
- Statistics split into focused subcategories (§57)
- Probability split into focused subcategories (§58)
- Sequences and functions beyond the shipped pattern generators (§59)
- Roman numerals (§60)

---

## 25. Comparison Questions

### 25.1 Master settings

Single **Comparison** on/off toggle on the learning plan (similar simplicity to the Geometry master toggle).

When Comparison is **off**, no comparison questions appear in the session pool.

When Comparison is **on**, individual **subtype toggles** control which comparison categories are included (see §25.2–§25.10).

### 25.2 Relational comparison (`<`, `>`, `=`) — toggle

- **Shipped**
- Question: `7 __ 12` — pick `<`, `>`, or `=`.
- Numbers drawn from enabled operations’ configured ranges (union of sensible bounds).
- **Answer:** multiple choice only (three symbols).

### 25.3 Ordering — toggle

- **Shipped**
- Given 3–4 values (from enabled ranges or expressions), ask: **smallest to largest** or **largest to smallest**.
- **Answer:** multiple choice only (permutations as options); no keyboard (hard on mobile).

### 25.4 Expression comparison — automatic (no toggle)

- **Shipped**
- **Not** a separate on/off control for the user.
- Generated **only when** the corresponding operation(s) are enabled in the plan:

Examples:

- Addition enabled: `3 + 4 __ 2 + 5`
- Multiplication enabled: `3 × 4 __ 2 × 5`
- Mixed (if both enabled): `3 + 4 __ 2 × 3` — compare evaluated results.

**Answer:** multiple choice (`<`, `>`, `=`) or labels like “Left”, “Right”, “Equal”.

### 25.5 Fraction vs decimal — toggle

- **Shipped**
- Question: which is larger, or are they equal? e.g. `3/4 __ 0.75`
- MC only; independent of arithmetic fraction calculation toggles.

### 25.6 Percent vs fraction — toggle

- **Shipped**
- e.g. `50% __ 1/2`, `25% __ 1/3`
- MC: `<`, `>`, `=`.

### 25.7 Fraction vs fraction — toggle

- **Shipped**
- Same or different denominators; e.g. `2/3 __ 3/5`
- MC: `<`, `>`, `=`.

### 25.8 Measurement & unit conversion — toggle

- **Shipped (partial)** — metric **compare** only (`<`, `>`, `=`); conversion “how many …?” and imperial units are later.

### 25.9 Settings UI

- **Shipped** — subtype toggles under Comparison card when master toggle is on.

### 25.10 Generation rules

- **Shipped**
- Expression compare: pool membership follows enabled operations (§25.4).
- Other subtypes: only when their toggle is on.
- Include in session question pool alongside arithmetic, geometry, and equations when Comparison is on.
- Track stats under operation label **Comparison**.

---

## 26. Equations with Two Variables (shipped)

Extend the existing equation-unknown concept (`x`) to **`x` and `y`** using a **system of two equations**, both involving **both variables**.

### 26.1 Question forms (initial scope)

Each question presents **two equations** in `x` and `y`. **Both equations must include `x` and `y`.** The second equation must **not** be a substitution line such as `y = 3` alone.

Linear, accessible templates only, e.g.:

- `x + y = 10` and `x − y = 4` → find `x` (answer `7`)
- `x + y = 12` and `x + 2y = 17` → find `x` (answer `5`)
- `2x + y = 11` and `x + y = 7` → find `y` (answer `3`)
- `x × y = 12` and `x + y = 7` → find `x` (when multiplication enabled; integer solutions only)

**Invalid (do not generate):**

```text
x + y = 10, y = 3. Find x.
```

That is substitution with a single known value, not a two-equation system.

**Valid display format:**

```text
x + y = 10
x − y = 4
Find x.
```

Coefficients and constants stay within enabled operation ranges. Each generated system must have a **unique integer solution** for `(x, y)` within those bounds.

The question asks for **one** unknown (`x` or `y`) per question so answer entry stays a single number in v1.

### 26.2 Answer entry

- **Keyboard (when selected globally):** user enters the **requested variable’s numeric value** (one number).
- **Multiple choice:** numeric distractors near the correct value.
- Do **not** ask users to type full expressions like `x=7, y=3` in v1.

### 26.3 Settings

- Separate toggle: **Equations with x and y** (or extend existing Equations card with mode: one unknown / two unknowns / both).
- Operator subset mirrors one-unknown equation toggles (add, sub, mul, div).

---

## 27. Learn / Tutorials (shipped)

### 27.1 Navigation

New **Home** action alongside Practice, Quiz, Timed, Settings:

```text
Home → Learn → Topic list → Tutorial for selected topic
```

### 27.2 Topic list

Mirrors the top-level configurable curriculum sections (23 topics, easiest → hardest). The shared `CurriculumSectionId` tuple is the source of truth for both Settings and Learn:

1. Shapes → 2. Numbers → 3. Patterns → 4. Clock → 5. Addition → 6. Subtraction → 7. Multiplication → 8. Division → 9. Comparison → 10. Rounding → 11. Fractions → 12. Squaring → 13. Square roots → 14. Geometry → 15. Order of operations → 16. Equivalent expressions → 17. Equations (x and y) → 18. **Linear & quadratic equations** → 19. Trigonometry → 20. **Logarithms** → 21. **Limits** → 22. Differentiation → 23. Integration

Equations with one `x` are not a separate top-level curriculum section: they remain per-operation question toggles under Addition, Subtraction, Multiplication, and Division. Therefore, there is no standalone **Equations with x** Learn card.

**Shipped behavior:** Show **all topics** in Learn regardless of practice settings — Learn is a reference library, not gated by the active learning plan.

### 27.3 Tutorial content structure (per topic)

Each tutorial page should include:

- Short explanation in plain, accessible language
- Formula / method summary (where applicable)
- 1–2 worked examples
- Optional “Try in practice” link that starts a focused session

### 27.4 Geometry tutorials

- Per shape: what perimeter, area, or volume mean
- Formula with labeled diagram (static image or simple SVG)
- Link to formula vs calculate question types in practice

### 27.5 No quiz mixing in v1

Learn explanations are reference content and are not injected into recorded practice/quiz/timed sessions. “Try in practice” opens focused settings, then a separate **open-ended, untimed** question loop. It shows running question/correct counts and answer feedback, but has no result screen and writes no session history, streak, or topic-accuracy data. Saving the focused settings is a separate explicit action (§40.3).

---

## 28. Visual Fraction Recognition (shipped)

### 28.1 Purpose

Teach and assess **understanding of fractions as parts of a whole**, complementing existing **fraction calculation** questions on operation cards.

### 28.2 Visual types

- **Circle / bar model** divided into equal parts; one or more parts shaded.
- Question: “What fraction is shaded?” → answer choices or keyboard entry (e.g. `1/3`, `1/4`, `2/3`).
- Optional inverse: “Shade 1/4 of the shape” — **out of scope for v1** (interaction-heavy); ship MC identification first.

### 28.3 Settings

- Toggle under **Fraction recognition** or **Fraction visuals**.
- Denominator pool aligned with existing fraction denominator pool: **2, 3, 4, 5, 6, 8, 10, 12**.
- Can appear in practice/quiz when enabled; also referenced in Learn → Fractions tutorial.

### 28.4 Assets

- Prefer reusable SVG / React Native vector shapes over bitmaps for crisp scaling.
- Same visuals usable in Learn tutorials and in questions.

### 28.5 Answer entry

Follow the global answer-entry preference:

- **Multiple choice:** show the configured 2, 3, 4, or 6 fraction options.
- **Keyboard:** use the shared fraction input and accept exact fractions, reducible equivalents, and equivalent decimals (for example `4/5`, `8/10`, or `0.8`).
- Use the visual model's shaded numerator and denominator as the canonical value for scoring.

---

## 29. Implementation Status

| Area | Status | Notes |
|---|---|---|
| Multi-profile | **Shipped** | Profile name + learner name + optional age/confidence; switch / edit / add / remove in Settings |
| Internationalization | **Shipped** | English + Macedonian; first-run language gate; mk Learn overrides (§42) |
| Onboarding | **Shipped** | Label/name then optional age 1–150 and confidence 1–5; first profile opens Home (§6) |
| Session modes | **Shipped** | Practice, quiz, timed run |
| Answer entry | **Shipped** | MC 2/3/4/6 or keyboard; visual fractions support typed equivalent fractions/decimals; geometry formula / π forced MC; calculus/logs/trig/advanced-equations/limits MC only |
| Confirm before submit | **Shipped** | Optional MC toggle; Confirm then feedback/submit |
| Per-operation toggles | **Shipped** | Standard, missing number, word problems, fractions, regrouping (add/sub), decimals |
| Special ops | **Shipped** | Squaring, square roots, rounding, order of ops, equations with one unknown (`x`) |
| Two-variable equations | **Shipped** | §26 — two-equation systems; both equations include x and y |
| Equivalent expressions | **Shipped** | Square identities, distribution, factorization, etc. |
| Comparison (relational, ordering, expression) | **Shipped** | §25.2–§25.4; expression auto from enabled ops |
| Comparison (fraction/percent/measurement) | **Shipped** | §25.5–§25.8 |
| Learn / tutorials | **Shipped** | §27 — 23 topics matching top-level Settings sections; Try in practice on all |
| Learn Try in practice | **Shipped** | Focused configuration and open-ended untimed loop; no session history / result screen by current design |
| Visual fraction recognition | **Shipped** | §28 — bar/circle models; MC or fraction keyboard entry |
| Geometry Phase 1 | **Shipped** | Expanded planar/solid shape set; formula + calculate; dims 1–10; π-form MC |
| Shapes | **Shipped** | §28.6 — shape/color recognition and visual patterns |
| Numbers / early number sense | **Shipped (partial)** | §39 — before/after, missing, odd/even; `numberRecognition` not generated |
| Decimals toggle (add/sub/mul/div) | **Shipped** | §8.1–§8.4 — **1 decimal place** only |
| Clock / time | **Shipped (partial)** | §31 — analog read + elapsed; no digital-read subtype |
| Patterns & sequences | **Shipped** | §32 — numeric patterns; visual cycles under Shapes |
| Settings save/navigation UX | **Shipped** | Collapsible sections, header save icon, unsaved-changes modal |
| Logarithms | **Shipped** | §41 — product/quotient/power rules; numeric log (bases 2,3,5,10) and ln |
| Linear & Quadratic Equations | **Shipped** | §43 — multi-step linear, variables on both sides, parentheses, factorable quadratics |
| Limits | **Shipped** | §44 — direct substitution, factor-and-cancel, infinity, and rationalization limits |
| Differentiation & Integration | **Shipped** | §34 — power/constant/sum, ln, sin/cos, quotient/simplify-fraction |
| Trigonometry v1 | **Shipped (partial)** | §38 — pick formula (including unknown-angle scenarios) and name sides; no numeric angle solving |
| Privacy policy (in-app) | **Shipped** | Home → Privacy policy |
| Compact question card | **Shipped** | Short prompts + visual below |
| Gentle adaptation | **Shipped** | Home card → focused practice when recent misses cluster |
| Progress | **Shipped** | Streak; sessions with mode filter + expandable rows; topic accuracy (§36); 50-session history limit |
| Share settings export/import | **Shipped** | §62 — JSON file; session/topic settings only; import to new profile or replace active settings |
| Persistence | **Shipped** | Zustand + AsyncStorage; legacy single-profile migration |
| Timed adjustments | **Shipped** | Configurable seconds subtracted for wrong answers and added for correct answers |
| Build/update information | **Shipped** | Build/update stamp shown in-app; Expo SDK 57 baseline |
| Equation-unknown mode (`off`/`mixed`/`only`) | **Partial** | Type only; no UI or runtime use |
| Ratios and proportions | **Potential** | §45 — standard questions plus whole-number resource-duration word problems |
| LCM and GCD | **Potential** | §46 — dedicated number-theory topic |
| Decade-based number reasoning | **Potential** | §47 — largest/smallest odd/even, successor, and predecessor compositions |
| Matrices | **Potential** | §48 — matrix addition, subtraction, and conformable matrix multiplication |
| Place value / number decomposition | **Potential** | §49 — digit value, forms, comparison, complements, composition, and decomposition |
| Factors, primes, and divisibility | **Potential** | §50 — factors/multiples, prime/composite, rules, factorization, missing factors |
| Percentages | **Potential** | §51 — conversions, percentage of a number, change, discounts/tax/tips |
| Integer extensions | **Potential (partial foundation shipped)** | §52 — negative arithmetic and signed stories exist; add absolute value, number-line reasoning, ordering, elevation |
| Powers and exponents | **Potential (partial foundation shipped)** | §53 — squares exist; add general powers, missing parts, rules, powers of 10, scientific notation |
| Angles | **Potential** | §54 — numeric/text-first questions; custom diagram generation deferred |
| Coordinate geometry | **Potential** | §55 — coordinate tuples and transformations; plotted graph interaction deferred |
| Measurement and conversion | **Potential (partial foundation shipped)** | §56 — metric comparison exists; add conversions and word problems |
| Statistics | **Potential** | §57 — datasets and compact tables first; chart drawing deferred |
| Probability | **Potential** | §58 — text/symbol-based events first; no custom spinner/card artwork required |
| Sequences and functions | **Potential (partial foundation shipped)** | §59 — arithmetic/geometric/number patterns exist; add nth term, tables, linear functions |
| Roman numerals | **Potential** | §60 — text-only conversion, comparison, and clock-related questions |
| Badges, parent dashboard, cloud sync | **Later** | §24.3 |

---

## 30. Open Product Decisions

**Resolved (shipped):**

1. Quiz mode — included in shipped product.
2. Answer choices — **2, 3, 4, 6** supported (not 5).
3. Multiple learner profiles — shipped (multi-profile on one device).
4. Comparison core subtypes — shipped (§25.2–§25.4).
5. Two-variable equations — shipped (§26).
6. Learn library — shipped (§27); show all topics recommended.
7. Visual fraction recognition — shipped (§28).
8. Shapes — shipped (§28.6).
9. Clock / time — shipped (§31, partial).
10. Patterns & sequences — shipped (§32); visual pattern controls are under Shapes.
11. Decimal toggles on basic operations — shipped (1 decimal place).
12. Expanded comparison subtypes — shipped (§25.5–§25.8).
13. Privacy policy screen — shipped.
14. Quiz/timed result screen question review — shipped on immediate result screen (§37 notes history drill-down is later).
15. Differentiation & Integration — shipped (§34): power, constant, sum, ln, trig, quotient/simplify-fraction.
16. Trigonometry v1 — shipped (§38): formula selection and side naming; no numeric calculation yet.
17. **Logarithms — shipped (§41).**
18. **Confirm before submit — shipped.**
19. **English + Macedonian UI — shipped (§42).**
20. **Linear & Quadratic Equations v1 — shipped (§43).**
21. **Limits v1 — shipped (§44).**
22. **Visual fraction keyboard entry — shipped (§28).**
23. **Timed correct-answer bonus and configurable wrong-answer penalty — shipped.**
24. **Expanded geometry shape set — shipped (§8.7).**
25. **Expo SDK 57 and build/update information — shipped.**
26. **Progress screen redesign — shipped (§36):** streak on top; session mode filter; expandable session rows; timed-run detail lines; topic accuracy section.
27. **Share settings export/import — shipped (§62).**
28. **Discrete preset sliders and topic-specific pickers — shipped (§12).**
29. **Addition-only answer limit — shipped (§12); other operations use their own settings.**
30. **Expression comparison uses `<`, `>`, `=` answer symbols (§25), not Left/Right labels.**
31. **Two-variable equations have their own settings card (§26).**
32. **Calculus uses exponents 2–5, includes `+ C` where applicable, and has separate Differentiation and Integration cards (§34).**

**Still open:**

1. Should subtraction support negative answers by default for younger ages, or remain opt-in per profile?
2. Decimal places: add **2 decimal places** option or keep 1 only?
3. Division with decimals: decimal divisor in a future release or quotients only?
4. Measurement: metric-only first vs imperial?
5. Clock: 12h default for all ages or follow locale?
6. Expression compare: keep auto-only or add override toggle?
7. Logarithm: add separate base toggles (2/3/5/10) vs single “Find log value” toggle?
8. Ratios: should direct and inverse proportion be separate settings toggles, or introduced together after standard ratios?
9. LCM/GCD: one combined Number Theory card or two independent top-level topics?
10. Decade terminology: use “first ten / second ten” in English or the less ambiguous range labels (`1–10`, `11–20`, etc.) while retaining the school terminology in Macedonian?
11. Matrices: should v1 remain 2×2 only, or include compatible rectangular products such as 2×3 multiplied by 3×2?
12. Number decomposition: should v1 cover only tens and ones, or include hundreds from the first release?
13. Potential-topic rendering: keep first releases text/table/symbol based as specified in §§50–60, and defer custom graph plotting and angle-diagram generation?

---

## 31. Clock / Time (shipped — partial)

### 31.1 Purpose

Practice reading clocks and working with time — without mixing into arithmetic operation cards.

**Shipped:** analog read and elapsed time. **Not yet shipped:** separate digital-clock-read subtype (BRD originally mentioned analog and digital).

### 31.2 Settings

Master **Clock / time** toggle on the learning plan.

When enabled, subtype toggles:

| Subtype | Description |
|---|---|
| Read analog | Show analog clock; “What time is it?” |
| Elapsed time | “How much time from 2:15 to 3:45?” |

Options:

- **Hour format:** 12-hour (default) or 24-hour
- **Minute granularity:** :00/:15/:30/:45 only, or any minute (harder)

### 31.3 Questions

- MC only in v1 (time strings or duration as options).
- Examples: `3:30`, `1 hour 30 minutes`, `90 minutes`.

### 31.4 Learn

**Shipped** — **Clock / time** topic in Learn (§27).

### 31.5 Progress

Roll up under operation label **Clock**.

---

## 32. Patterns & Sequences (shipped — partial)

### 32.1 Purpose

Recognize and continue numeric and visual patterns — complements arithmetic without replacing it.

**Shipped:** arithmetic, geometric, and number patterns plus uncolored and colored-shape cycles. Shape-based pattern controls are owned by **Shapes**, because that section defines which shapes may appear.

### 32.2 Settings

Master **Patterns & sequences** toggle.

Subtype toggles:

| Subtype | Example |
|---|---|
| Arithmetic sequence | `2, 5, 8, 11, ?` → `14` |
| Geometric sequence | `2, 4, 8, 16, ?` → `32` |
| Number pattern | Skip counting, alternating +/− rules |
Shape and color pattern toggles are no longer displayed in this card; see §28.6.

### 32.3 Answer entry

- MC only in v1 (next term or missing position).
- Keyboard optional later for numeric-only patterns.

### 32.4 Learn

**Shipped** — **Patterns & sequences** topic in Learn.

### 32.5 Progress

Roll up under **Patterns**.

---

## 28.6 Shapes (shipped)

### 28.6.1 Purpose

Teach and assess basic shapes and colors, and reuse the selected shape pool for visual patterns. Supported shapes are circle, square, rectangle, triangle, star, and oval.

### 28.6.2 Questions

- Identify the shape, identify its color, or identify both color and shape.
- Continue an uncolored repeating shape cycle.
- Continue a colored-shape cycle containing two or three distinct items.
- Colored answers render as figures and respect the configured answer-choice count.
- Multiple choice only.

### 28.6.3 Settings

- Master **Shapes** toggle.
- Question toggles: identify shape, identify color, identify color and shape, shape pattern, color and shape pattern.
- Per-shape toggles define the pool used by recognition and pattern questions.
- Enabled by default in recommended plan for ages **4–5**.

### 28.6.4 Learn

- **Shapes** topic in Learn covers names, colors, and repeating visual patterns.

### 28.6.5 Progress

Roll up under operation label **Shapes**.

---

## 34. Differentiation & Integration (shipped — v1)

### 34.1 Purpose

Introduce basic **symbolic** differentiation and integration — for older or self-directed learners. Off by default in all age recommended plans.

### 34.2 Question types

**Differentiation (MC only):**

- Power rule: `(x^n)' = ?` → e.g. `(x³)' = 3x²`
- Constant rule: `(c)' = ?` → `0`
- Constant multiple: `(k·x^n)' = ?`
- Simple sum (optional toggle): `(x² + 3x)' = ?`
- Natural log: `(ln x)' = ?` → `1/x`
- Trig: `(sin x)' = cos x`, `(cos x)' = −sin x` (with optional coefficient)
- **Quotient rule:** ratios that **cannot** be simplified to a single power first, e.g. `(2x/(x + 3))' = 6/(x + 3)²` using `(f/g)' = (f'g − fg') / g²`

**Integration (MC only):**

- Power rule: `∫ x^n dx = ?` → e.g. `x³/3 + C` (n ≥ 1)
- Constant: `∫ k dx = ?` → `kx + C`
- Constant multiple: `∫ k·x^n dx = ?`
- Natural log: `∫ (1/x) dx = ?` → `ln x + C`
- Trig: `∫ sin x dx = −cos x + C`, `∫ cos x dx = sin x + C`
- **Simplify fractions:** e.g. `∫ (x³/x) dx = ∫ x² dx = x³/3 + C` (integration has no quotient rule — simplify first)
- Answers include **`+ C`** where applicable

Exponents **2–5**, coefficients **2–5**, constants **1–12**. Questions use prime notation `(expression)' = ?`.

### 34.3 Settings

Separate **Differentiation** and **Integration** cards. Each has:

| Toggle | Description |
|---|---|
| Master on/off | Include in session pool |
| Power rule | `x^n` terms |
| Constant rule | Constants / `∫ k dx` |
| Simple sum | Two-term expressions |
| Natural log | `(ln x)'` / `∫(1/x) dx` |
| sin & cos | Trig derivatives and integrals |
| Quotient rule (differentiation) / Simplify fractions (integration) | See §34.2 |

### 34.4 Answer entry

Symbolic **multiple choice only** (expressions like `2x`, `6/(x + 3)²`, `x³/3 + C`). Keyboard not used in v1.

### 34.5 Learn

Separate **Differentiation** and **Integration** tutorials: rules, quotient-rule formula table with mnemonic (“Low d-High minus High d-Low, over Low squared”), worked examples, “Try in practice” links.

### 34.6 Progress

Roll up under **Differentiation** and **Integration** operation labels.

---

## 38. Trigonometry (shipped — v1, partial)

### 38.1 Purpose

Introduce **right-triangle trigonometry** relative to angle θ: name the sides (opposite, adjacent, hypotenuse) and choose the correct ratio (SOH-CAH-TOA).

**Shipped in v1:** formula **selection** and side **naming** using labeled diagrams.

**Not yet shipped:** evaluating ratios or calculating numeric side lengths or angle measures.

### 38.2 Settings

Master **Trigonometry** toggle on the learning plan (separate card, like Geometry). Default **off** in age-based recommended plans — opt in via Settings.

When enabled:

| Control | Description |
|---|---|
| Ratio toggles | **Sine**, **Cosine**, **Tangent**, **Cotangent** — at least one required when pick-formula is on |
| Pick formula | Choose the ratio that matches the diagram (find a side or find angle θ) |
| Name sides | Identify the highlighted side relative to θ |
| Find angle | Include pick-formula scenarios where θ is the unknown (requires **tan** or **cot** when both legs are known and hypotenuse is not labeled) |

Default ratio toggles: sin and cos on; tan and cot off.

### 38.3 Question subtypes

**Pick formula**

- Short prompt only (e.g. “Find the hypotenuse side.” / “Find angle θ.”) — known values appear on the diagram.
- **Find side:** one side unknown (`?` on diagram); when the angle is known, the diagram shows its degree measure and MC options use that value (e.g. `cos 33° = ? / 10`).
- **Find angle:** two sides labeled with numbers; MC options use full numeric ratios (e.g. `cos θ = 8 / 13`) — no `?` placeholders in answers.
- Distractors use other ratios and/or flipped numerators/denominators; options with two `?` placeholders are excluded.

**Name side**

- Diagram highlights one side; answer choices: Opposite, Adjacent, Hypotenuse, Right angle.

### 38.4 Diagram rules

- θ at the **bottom-left** acute corner; right angle at bottom-right (consistent with Learn).
- Known sides show **numeric labels**; unknown side or angle marked **?**.
- When hypotenuse and at least one leg are both labeled, hypotenuse is always **longer** than each known leg.
- Adjacent side label appears **below** the horizontal leg.

### 38.5 Answer entry

**Multiple choice only** (2, 3, 4, or 6 options). Long formula text uses a **stacked** vertical layout. Keyboard entry is not used.

### 38.6 Learn

**Shipped** — **Trigonometry** topic in Learn (§27):

- Side naming relative to θ
- SOH-CAH-TOA formula table with diagrams (sin, cos, tan, cot)
- Common exact **sin & cos** values for 30°, 45°, 60°, and 90°
- “Try in practice” opens a focused trigonometry session

### 38.7 Progress

Roll up under operation label **Trigonometry**.

### 38.8 Later

- Numeric calculation: evaluate sin/cos/tan or solve for a missing side or angle
- Inverse trigonometric functions
- Non–bottom-left θ layouts (if ever needed)

---

## 35. Later: Learn Section Quality Pass

Review and improve **every Learn topic** for clarity, age-appropriate language, more worked examples, and visuals where helpful (geometry, fractions, clock, patterns, trigonometry, calculus, etc.).

Suggested per-topic checklist:

- Clear summary in plain language
- Step-by-step method
- At least two worked examples
- “Try in practice” link where applicable
- Diagrams or visuals where they aid understanding

**Partly implemented:** Learn topics now include contextual introductions, mathematical and real-life uses, and worked examples beside related concepts in English and Macedonian. Further editorial/visual review remains planned; these structures do not establish that every topic meets the entire quality checklist.

---

## 36. Progress Screen UX and Timed Run Session Details (shipped)

### 36.1 Layout

The Progress screen uses a vertical layout:

1. **Streak** — consecutive days with at least one completed session
2. **Sessions** — mode filter (All / Practice / Quiz / Timed run), optional filtered average for the visible window, accordion list of recent sessions
3. **By topic** — per-operation accuracy for sessions matching the active filter; hidden when there is no data for that filter

Up to **50** sessions are persisted per profile and eligible for display.

Streaks use local calendar days and completed sessions across all modes, independently of the mode filter. A streak remains active if the latest completed day is yesterday. Because streaks are derived from retained history, this is not a permanent lifetime streak record.

The displayed average is the rounded mean of session percentages in the filtered history; sessions carry equal weight regardless of question count. Topic accuracy instead aggregates correct/attempted questions for each operation in that filtered history.

### 36.2 Session list rows

- Rows are **collapsed by default**; a chevron toggles expand/collapse (no separate “tap for details” hint text).
- Collapsed row shows: date (Today / Yesterday / short date), mode badge, score percentage.
- **Practice / Quiz expanded:** total questions, correct answers, wrong answers.
- **Timed run expanded:** configured start duration, wrong-answer penalty seconds, correct-answer bonus seconds, total survived time, correct answers, wrong answers.
- Timed-run metadata is stored on the session history entry at finish time.

### 36.3 Empty states

- Filter-specific copy when a mode has no sessions yet (practice-only, quiz-only, timed-only).
- Topic accuracy section is omitted entirely when the filtered history has no operation stats.

### 36.4 Not in scope (later)

- Questions-per-minute or other derived timed metrics
- Separate visual row styling for timed vs quiz (beyond expanded detail lines)
- Persisted question-level review from history rows (see §37)

### 36.5 Gentle adaptation on Home

Review the most recent **5 completed sessions**. An enabled operation becomes eligible for a suggestion after at least **3 attempts**, **2 wrong answers**, and a wrong-answer rate of at least **34%**. Prefer the eligible operation with the most misses, then the higher miss rate. The learner chooses whether to start focused practice; the app does not automatically increase difficulty or rewrite the saved learning plan. Learn → Try contributes no history to this calculation.

---

## 37. Later: Session History Question Review

Today:

- **Quiz** and **timed** sessions show a full **Question review** list on the **immediate result screen** (question text, your answer, correct answer if wrong).
- That detail is **not persisted** in session history — only aggregates (score %, correct/total, operation stats) are saved.

**Future:**

- Tap a recent quiz or timed row (or its score %) on Progress → open the same style of question review for that past session.
- Requires persisting a compact `quizQuestionOutcomes`-style list per history entry (or last N sessions) and a new detail screen/route.

**Not implemented in current release.**

---

## 39. Numbers / Early Number Sense (shipped)

### 39.1 Purpose

Provide developmentally appropriate number-sense practice for the youngest learners before or alongside formal arithmetic.

### 39.2 Settings

The dedicated **Numbers** card includes a master toggle and these question-type toggles:

- Before and after (predecessor and successor)
- Missing number in a short consecutive sequence
- Odd and even

Visual **count shapes** and **more, fewer, or same** toggles are owned by **Shapes**, since they use the selected shape pool and do not use the Numbers upper-limit slider.

The former **Recognize numbers / Select the number …** subtype is retired and must not be generated, including from legacy profile data.

The general upper limit uses the shared discrete slider UI with stops at **5, 10, 20, and 100**. The selected range is stated above the slider, so redundant numeric tick labels are not shown below it.

### 39.3 Generation rules

- **Count shapes (Shapes):** name the target color and shape in the prompt and show its figure inside the question card, then show a shuffled mix below. Count only exact matches. Correct answer and distractors remain within 1–10.
- **Before and after:** ask for the number immediately before or after a value, within the configured limit.
- **Missing number:** show a short consecutive sequence with one term replaced by `?`.
- **More, fewer, or same (Shapes):** show two visually separate cards labeled **Group A** and **Group B**. Both groups repeat the same colored shape so only quantity differs; each contains 1–10 figures. Answers are Group A, Group B, and Same.
- **Odd and even:** ask whether a number within the configured limit is odd or even. Zero is even.
- String-valued choices must use direct localized-label scoring so a visibly matching answer is never rejected.

### 39.4 Recommended plans

- Ages **4–5:** Numbers enabled up to 10; odd/even off initially.
- Ages **6–7:** Numbers enabled up to 20; odd/even enabled.
- Older plans: Numbers remains available but is off by default.

### 39.5 Learn and progress

- Learn contains a **Numbers** topic covering counting, before/after, missing values, comparisons, and odd/even.
- **Try in practice** opens focused Numbers settings before starting.
- Attempts roll up under operation label **Numbers**.

---

## 40. Settings and Focused Try UX (shipped)

### 40.1 Collapsible learning-plan cards

- When a section is enabled, tapping its title collapses or expands its content.
- No separate “Collapse” or “Expand” text is shown.
- The main enable switch remains independent from the title action.
- Subsection switches use a larger touch target than their original compact implementation while remaining visually smaller than master switches.

### 40.2 Saving and navigation

- Settings provides the existing bottom Save action and a white save/disk icon in the header.
- If the user attempts to navigate back with unsaved changes, show a confirmation modal with:
  - Save and leave
  - Leave without saving
  - Cancel (return to Settings)
- Back navigation must work normally when there are no unsaved changes.
- On Android, after Save the app defers header updates and back navigation briefly so react-native-screens does not crash when options change during the same transition.

### 40.3 Learn → Try in practice

- Try opens a configuration view containing only the selected topic’s settings.
- The learner may adjust what to try before starting.
- Starting offers two explicit paths: start without changing the active profile, or save the focused settings to the active profile and start.
- Saving focused settings must update every setting owned by that topic. For example, Shapes also saves its shape-pattern toggles.

### 40.4 Visual-answer consistency

- Visual pattern answers render figures rather than text descriptions.
- Uncolored pattern figures use the same sizing as colored figures and consistent outlined styling, including the star.
- Colored pattern questions return exactly the configured answer-choice count, with unique choices and relevant visible-cycle distractors prioritized.

---

## 41. Logarithms (shipped — v1)

### 41.1 Purpose

Practice **logarithm rules** and **evaluating log/ln expressions** symbolically — for older or self-directed learners. Off by default in all age recommended plans.

### 41.2 Question types (MC only)

| Subtype | Example | Setting toggle |
|---|---|---|
| Product rule | `log(4 × 5) = ?` → `log 4 + log 5` | `productRule` |
| Quotient rule | `log(20/4) = ?` → `log 20 − log 4` | `quotientRule` |
| Power rule | `log(x³) = ?` → `3 log x` | `powerRule` |
| Find log value | `log₂(8) = ?` → `3` (bases 2, 3, 5, 10) | `numericLog` |
| Find ln value | `ln(e²) = ?` → `2` | `numericLn` |

Distractors avoid equivalent wrong forms (e.g. `log 45` when correct is `log 4 + log 5`).

### 41.3 Settings

Dedicated **Logarithms** card:

- Master on/off
- Per-subtype toggles: Product rule, Quotient rule, Power rule, **Find log value**, **Find ln value**

### 41.4 Answer entry

**Multiple choice only.** Log MC labels show the expression only (no redundant `x=` prefix).

### 41.5 Learn

**Logarithms** topic in Learn (§27): product, quotient, and power rules; numeric examples; formula table; “Try in practice” opens focused logarithm session.

### 41.6 Progress

Roll up under operation label **Logarithms**.

---

## 42. Internationalization (shipped)

### 42.1 Supported locales

- **English (`en`)** — default source strings
- **Macedonian (`mk`)** — full UI translation

### 42.2 Language selection

- **First launch:** language picker before main navigation (required for Android stability).
- **Language switch:** available on Home and non-session headers, including Settings; persisted device-wide. The header switch is hidden during active sessions to avoid changing question language mid-session.

### 42.3 Localized content

| Area | Localization |
|---|---|
| UI chrome | `common`, `navigation`, `home`, `onboarding`, `settings`, `practice`, `progress`, `privacy`, `questions` namespaces |
| Learn tutorials | Macedonian overrides in `overrides.mk.ts`; English source in `learnTopics.ts` |
| Word problems | Macedonian template set |
| Privacy policy | Localized sections |
| Operation labels | i18n via `operationLabel()` |

Mathematical notation in generated questions uses shared formatters; not every symbol is locale-specific beyond the questions namespace.

---

## 43. Linear & Quadratic Equations (shipped — v1)

### 43.1 Purpose

Extend equation practice beyond one-step `x` questions and two-variable systems. This topic bridges equivalent expressions, functions, and later calculus. It is off by default in all age-based recommended plans.

### 43.2 Settings

The dedicated learning-plan card has a master toggle and these independent subtype toggles:

- Multi-step linear equations (`ax + b = c`)
- Variables on both sides (`ax + b = cx + d`)
- Linear equations with parentheses (`a(x + b) = c`)
- Monic factorable quadratics with two distinct integer roots

At least one subtype must be enabled when the master toggle is on.

### 43.3 Generation and answer entry

- Linear questions are generated backwards from a chosen integer solution so every question has a valid exact answer.
- Variables-on-both-sides questions guarantee different nonzero net coefficients.
- Quadratics are generated from two distinct integer roots and expanded to monic standard form.
- Questions are **multiple choice only** in v1.
- Prompts show `Find x:` on the first line and the equation on a separate line for readability.
- Linear answers use `x = n`; quadratic answers show both roots in one option (`x = a or b`).
- Distractors are unique and include nearby values, sign mistakes, altered roots, or “No real solutions.”

### 43.4 Learn and progress

Learn includes an introductory tutorial, worked examples, and focused Try in practice. Attempts roll up under **Linear & quadratic equations**.

---

## 44. Limits (shipped — v1)

### 44.1 Purpose

Introduce the concept required before differentiation and integration: the value an expression approaches as `x` approaches a point. Limits are off by default in all age-based recommended plans.

### 44.2 Settings

The dedicated learning-plan card has a master toggle and these independent subtype toggles:

- Direct substitution for polynomials and rational expressions with a nonzero denominator
- Removable `0/0` limits solved by factoring and canceling a common factor
- Limits at infinity for rational functions (equal degrees or numerator degree lower than denominator degree)
- Rationalization of removable limits containing square roots by multiplying by the conjugate

At least one subtype must be enabled when the master toggle is on.

### 44.3 Generation and answer entry

- Polynomial questions use small integer coefficients and approach values.
- Rational-substitution questions guarantee a nonzero denominator and an integer result.
- Polynomial and rational direct-substitution questions share one subtype because they use the same solution method.
- Factor-and-cancel questions are built from `(x − a)(x − b)/(x − a)`, so direct substitution gives `0/0` and cancellation gives a finite integer limit.
- Limits at infinity use leading-degree behavior: equal degrees use the ratio of leading coefficients; a lower-degree numerator approaches `0`.
- Rationalization questions produce `0/0` before simplification and use a conjugate to remove the square root; answers are simple unit fractions.
- The prompt uses a centered equation-style math layout: `lim` is the main symbol, `x → 4` or `x → ∞` is centered directly beneath it, and `= ?` follows short expressions. For long polynomials or wide fractions, `= ?` moves to a centered line below the formula so the expression is never squeezed or clipped. Rational expressions use the shared stacked-fraction presentation (numerator above denominator with a fraction bar) instead of slash notation.
- Enabled subtypes rotate through a shuffled bag before any subtype repeats, so short focused-practice runs show the selected variety.
- Questions are **multiple choice only** in v1. Scalar numeric and simple fractional choices use the shared two-column answer grid, with both cards in a row sharing the same height. Formula and other symbolic choices remain full-width, one per row.
- Distractors are generated near the correct numeric result.

### 44.4 Learn and progress

Learn explains all four generated subtypes—direct substitution, factor-and-cancel, limits at infinity, and rationalization—with a numbered, step-by-step worked example directly below each explanation. Learn examples reuse the same structured notation as practice: the approach is centered below `lim`, every fraction in the question and solution is stacked instead of written with a slash, and each fraction bar sizes to its wider term instead of stretching across the card. It also explains how limits underpin continuity, derivatives, integrals, and long-term behavior, plus applications to instantaneous speed, population/investment behavior, physics, engineering, and accumulated quantities. Focused Try in practice is available. Attempts roll up under **Limits**.

---

## 45. Ratios & Proportions (potential)

### 45.1 Purpose

Teach ratios as comparisons between quantities and extend them into proportional reasoning. This should be a dedicated configurable topic, off by default until implemented, with a Learn tutorial and focused Try flow.

### 45.2 Proposed question types

- **Read or write a ratio:** “There are 6 red and 4 blue balls. What is the ratio of red to blue?”
- **Simplify a ratio:** `12:18 = ?` → `2:3`.
- **Equivalent ratios:** `3:5 = 12:?` or select the ratio equivalent to `4:6`.
- **Find a missing term in a proportion:** `a:b = c:?` using whole-number solutions.
- **Unit-rate questions:** find the amount for one unit before scaling to another whole-number quantity.
- **Direct proportion word problems:** both quantities increase or decrease by the same scale factor.
- **Inverse proportion / shared-resource duration word problems:** the total resource is fixed, so increasing consumers shortens the remaining duration.
- **Scale recipes:** increase or decrease ingredient quantities by an integer scale factor.
- **Maps and scale drawings:** use written scales and numeric distances; a custom map drawing is not required in v1.
- **Speed, distance, and time:** solve one missing value using whole-number inputs and results in v1.
- **Unit rates and best value:** compare price per item, distance per unit time, or another exact whole-number/terminating-decimal unit rate.

### 45.3 Resource-duration word problems

Include problems such as:

> A farmer has 20 cows and enough food for 10 days. After 5 days, 5 more cows arrive. For how many more days will the remaining food last?

Required solution model:

```text
Initial food = 20 × 10 = 200 cow-days
Food used in 5 days = 20 × 5 = 100 cow-days
Food remaining = 200 − 100 = 100 cow-days
New herd size = 20 + 5 = 25 cows
Remaining duration = 100 ÷ 25 = 4 days
```

The requested answer is the duration **after** the new cows arrive, so the correct answer is `4 days`, not the total elapsed duration.

Generation must use whole numbers throughout:

1. Choose initial animals `A > 0`, initial duration `D > 1`, elapsed days `E` where `0 < E < D`, and arriving animals `B > 0`.
2. Compute remaining resource units as `A × (D − E)`.
3. Accept the generated question only when `A × (D − E)` is exactly divisible by `A + B`.
4. Keep all displayed values, intermediate quantities, and the final answer positive whole numbers.
5. Use varied contexts—animals and food, workers and supplies, machines and fuel—but never rely on fractional days or rounding in the first version.

### 45.4 Answer entry and distractors

- Support multiple choice and numeric keyboard entry.
- Accept the numeric duration without requiring the unit word.
- Distractors should represent understandable mistakes: ignoring the elapsed days, ignoring the added consumers, adding elapsed days to the requested remaining duration, or applying direct instead of inverse proportion.
- The wording must explicitly distinguish “how many more days” from “how many days in total.”

### 45.5 Settings, Learn, and progress

Proposed settings: master toggle plus standard ratios, equivalent/simplify, missing proportion term, unit rate/best value, recipes/scales, speed-distance-time, direct-proportion word problems, and inverse-proportion resource problems. Attempts should roll up under **Ratios & proportions**. English and Macedonian prompts, units, explanations, and Learn examples are required before release.

---

## 46. Least Common Multiple and Greatest Common Divisor (potential)

### 46.1 Purpose

Add a number-theory topic covering **Least Common Multiple (LCM)** and **Greatest Common Divisor (GCD)**. Macedonian localization should use the standard school terms **најмал заеднички содржател (НЗС)** and **најголем заеднички делител (НЗД)**.

### 46.2 Proposed question types

- Find `LCM(a, b)` for two positive whole numbers.
- Find `GCD(a, b)` for two positive whole numbers.
- Select common multiples or common divisors from answer choices.
- Find a missing number when the LCM or GCD is given.
- Apply LCM to repeating-event problems, such as when two schedules next coincide.
- Apply GCD to equal-grouping or largest-equal-piece problems with no remainder.

### 46.3 Generation and difficulty

- Start with two values in `2–20`; later difficulty may include three values or larger bounds.
- Generate nontrivial pairs often enough that the answer is not usually `1` for GCD or simply the product for LCM.
- Compute answers exactly using the Euclidean algorithm for GCD and `LCM(a,b) = |a × b| / GCD(a,b)`.
- Keep all generated inputs and answers as positive whole numbers.
- Avoid duplicate questions caused only by swapping input order unless order is pedagogically relevant.

### 46.4 Answer entry, Learn, and progress

Support both multiple choice and numeric keyboard entry. Learn should cover listing multiples/divisors, prime factorization, the Euclidean method at an age-appropriate level, and when LCM versus GCD is useful. Proposed progress labels are **Least common multiple** and **Greatest common divisor**, either separately or under one **LCM & GCD** topic depending on the product decision in §30.

---

## 47. Decade-Based Number Reasoning (potential)

### 47.1 Purpose and terminology

Extend Numbers / early number sense with multi-step questions that combine a decade range, smallest/largest value, parity, and successor/predecessor reasoning.

For unambiguous generation, this BRD defines school “tens” as:

| School term | Inclusive range |
|---|---:|
| 1st ten | 1–10 |
| 2nd ten | 11–20 |
| 3rd ten | 21–30 |
| 4th ten | 31–40 |
| nth ten | `(n−1)×10 + 1` through `n×10` |

English prompts should prefer an explicit range when “nth ten” may sound unnatural or ambiguous. Macedonian may use the familiar curriculum wording (`прва десетка`, `втора десетка`, etc.) and must use **следбеник** for successor and **претходник** for predecessor.

### 47.2 Proposed question types and examples

- Largest even number from the 4th ten (`31–40`) → `40`.
- Smallest odd number from the 3rd ten (`21–30`) → `21`.
- Successor of the largest number from the 2nd ten (`11–20`) → `21`.
- Predecessor of the smallest number from the 4th ten (`31–40`) → `30`.
- Successor or predecessor of the largest/smallest odd or even number in a selected ten.
- Reverse form: identify the ten containing a given number, including boundary values.

### 47.3 Generation rules

1. Resolve the inclusive decade range first.
2. Filter it by parity when the prompt requests odd or even.
3. Select the smallest or largest matching number.
4. Apply successor (`+1`) or predecessor (`−1`) only after selection when requested.
5. The final result may fall just outside the named ten; this is intentional and should be explained in Learn content.
6. Generate only prompts with one unambiguous answer, and validate the computed answer independently from the displayed wording.

### 47.4 Settings, answer entry, Learn, and progress

Add this as a potential subtype under **Numbers**, not as a new arithmetic operation. Proposed controls are decade range, largest/smallest, odd/even, and successor/predecessor combinations, with simpler one-step forms introduced before composed forms. Support multiple choice and numeric keyboard entry. Learn should visually show each ten as an inclusive number strip and explain boundary crossings such as the successor of `20` being `21`. Attempts should roll up under **Numbers** unless future analytics justify a separate label.

---

## 48. Matrices (potential)

### 48.1 Purpose

Introduce matrices as rectangular arrays of numbers and teach the distinction between element-wise addition/subtraction and row-by-column matrix multiplication. This should be a dedicated configurable topic, off by default until implemented, aimed at older or self-directed learners.

### 48.2 Proposed question types

- Identify a matrix's dimensions (`rows × columns`).
- Find a requested matrix element such as `a₂₁`.
- **Matrix addition:** add corresponding entries of two matrices with identical dimensions.
- **Matrix subtraction:** subtract corresponding entries of two matrices with identical dimensions.
- **Matrix multiplication:** multiply conformable matrices using row-by-column dot products.
- Determine whether an operation is possible from the operand dimensions.

Scalar multiplication, determinants, inverses, transposes, and systems represented as matrices may be later extensions; they are not required for the first matrix release.

### 48.3 Generation rules

- Begin with `2×2` matrices and small whole-number entries, initially `0–9`.
- Addition and subtraction operands must have the same dimensions, and answers are computed element by element.
- Subtraction may initially generate nonnegative result entries; a later difficulty setting may allow negative entries.
- For multiplication, if `A` is `m×n` and `B` is `n×p`, generate an `m×p` answer. The inner dimensions must match.
- Matrix multiplication must use row-by-column dot products and must never be scored as element-wise multiplication.
- A later difficulty level may include conformable rectangular products such as `2×3 · 3×2` and negative entries.
- Keep displayed matrices compact enough to fit the mobile question card without clipping.

Example:

```text
| 1  2 |   | 5  6 |   |  6   8 |
| 3  4 | + | 7  8 | = | 10  12 |

| 1  2 |   | 5  6 |   | 19  22 |
| 3  4 | × | 7  8 | = | 43  50 |
```

### 48.4 Answer entry and distractors

- Use multiple choice for the first version because a matrix requires a structured grid rather than the existing single-value keyboard field.
- Render each answer as a properly aligned matrix, not a flattened comma-separated string.
- Addition/subtraction distractors should include one-entry arithmetic mistakes, reversed subtraction, and row/column swaps.
- Multiplication distractors should include element-wise multiplication, incorrect row-column pairing, and one dot-product arithmetic mistake.
- A future matrix-grid editor may enable keyboard entry after it has clear cell focus, navigation, validation, and accessibility behavior.

### 48.5 Settings, Learn, and progress

Proposed settings: master toggle; addition, subtraction, and multiplication toggles; matrix-size/difficulty presets; and an optional negative-entry toggle. Learn should explain rows, columns, dimensions, corresponding entries, conformability, and row-by-column multiplication with worked visuals. Focused Try should be available. Attempts should roll up under **Matrices**, with English and Macedonian terminology localized before release.

---

## 49. Place Value & Number Decomposition (potential)

### 49.1 Purpose and terminology

Teach place value by composing and decomposing a whole number into hundreds, tens, and ones. For example, `82 = 80 + 2` means that 82 contains 8 tens and 2 ones. This is **number decomposition** or **expanded form**, not division.

Macedonian localization should use age-appropriate terminology such as **разложување на број** and explain **десетки** and **единици** explicitly.

### 49.2 Proposed question types

- **Decompose a number:** `82 = ?` → `80 + 2`.
- **Complete the expanded form:** `82 = 80 + ?` → `2`.
- **Find the tens part:** `47 = ? + 7` → `40`.
- **Compose a number:** `60 + 5 = ?` → `65`.
- **Name place-value digits:** “How many tens and ones are in 93?” → 9 tens and 3 ones.
- **Value of a digit:** “What is the value of 5 in 4,582?” → `500`.
- **Standard, expanded, and word form:** convert between `4,582`, `4,000 + 500 + 80 + 2`, and its localized written form.
- **Compare by place value:** choose `<`, `>`, or `=` after comparing the highest differing place.
- **Complements:** find the amount needed to reach `10`, `100`, or `1,000`.
- **Three-digit expansion at higher difficulty:** `347 = 300 + 40 + 7`.
- Include zero-place cases without adding misleading terms: `504 = 500 + 4`; Learn may also show `500 + 0 + 4` to explain the zero tens digit.

### 49.3 Generation rules

1. Start with two-digit whole numbers from `10–99`.
2. For a number `n`, compute `tens = floor(n / 10) × 10` and `ones = n mod 10`.
3. Generate the displayed equation and correct answer from those computed place-value parts.
4. When hundreds are enabled, compute each place independently and preserve internal zero digits correctly.
5. Do not describe expanded form as division, and do not use `/` or `÷` notation.
6. Avoid ambiguous blank placement; each question must make clear whether the learner should enter the whole number, tens part, ones part, or complete expression.

### 49.4 Answer entry and distractors

- Numeric blanks such as `82 = 80 + ?` and `60 + 5 = ?` support keyboard entry.
- Full expanded expressions such as `80 + 2` should initially use multiple choice unless the equation-expression keyboard is deliberately extended to this topic.
- Distractors should reflect common place-value mistakes: `8 + 2`, `800 + 2`, reversed digits (`28`), wrong tens (`70 + 2`), or treating the digits as separate unrelated values.
- Do not accept mathematically equal but pedagogically unhelpful expressions such as `81 + 1` when the question specifically asks for expanded place-value form.

### 49.5 Settings, Learn, and progress

Add this as a potential subtype under **Numbers**, with separate toggles or difficulty levels for tens/ones, hundreds/thousands, decomposition, composition, digit value, standard/expanded/word form, comparison, complements, and missing-place questions. Learn should use a compact place-value table and grouped existing visual objects before moving to symbolic expanded form. No custom illustration is required. Attempts should roll up under **Numbers** unless future analytics justify a separate **Place value** label.

---

## 50. Factors, Multiples, Primes & Divisibility (potential)

### 50.1 Existing foundation

Multiplication tables and multiplication missing-number questions are shipped, so a prompt such as `6 × ? = 42` can already occur. The potential topic should reuse that arithmetic engine while adding explicit factor language, factor sets, multiples, primes, divisibility, and a dedicated Learn progression.

### 50.2 Scope

Add a dedicated prerequisite topic for LCM/GCD and fraction simplification:

- Prime versus composite; explicitly teach that `1` is neither.
- Find all factors, factor pairs, or the next multiples of a positive whole number.
- Determine whether one number is a factor or multiple of another.
- Divisibility rules for `2`, `3`, `5`, `9`, and `10` in v1.
- Prime factorization, first as repeated factors and later with exponent notation.
- Missing-factor questions such as `6 × ? = 42`.

### 50.3 Implementation constraints

Use integers and text/choice layouts only; no factor-tree drawing tool is required. Generate factor lists from exact divisors, generate primes with a deterministic primality check, and verify prime-factor products reconstruct the original number. Numeric blanks support keyboard entry; prime/composite and factor-list questions use multiple choice. Proposed settings are subtype toggles plus maximum number (`20`, `50`, `100`, `1,000`). Attempts roll up under **Factors & primes**.

---

## 51. Percentages (potential; comparison foundation shipped)

### 51.1 Existing foundation

Percent-versus-fraction comparison already exists under Comparison. A dedicated percentage practice source, settings card, Learn topic, and progress label are not implemented.

### 51.2 Proposed scope

- Convert between common fractions, terminating decimals, and percentages.
- Find a percentage of a number with exact whole-number or terminating-decimal answers.
- Find the original amount or missing percentage in simple cases.
- Percentage increase and decrease.
- Discounts, tax, and tips using clearly stated rates and rounding rules.

Use text and the existing stacked-fraction renderer; no charts are required. V1 should favor common rates (`1%`, `5%`, `10%`, `20%`, `25%`, `50%`, `75%`) and currency values that produce exact answers. Numeric/fraction questions support keyboard entry; conversion forms containing `%` may initially use multiple choice. Attempts roll up under **Percentages**.

---

## 52. Integer Extensions (potential; negative arithmetic foundation shipped)

### 52.1 Existing foundation

The four basic operations already support negative operands/results when enabled. Signed word problems already include temperature, elevator floors, score changes, penalties, and average change. These must not be duplicated as a separate generator solely to create an Integers label.

### 52.2 Missing scope

- Absolute value, including simple equations such as `|x| = 5` at higher difficulty.
- Number-line movement expressed textually, for example “Start at −3 and move 5 steps right.”
- Order and compare negative integers.
- Opposite numbers and additive inverses.
- Elevation/sea-level and debt/balance word problems.

V1 uses signed-number text and arrow/step language; a custom number-line drawing is optional and deferred. Numeric answers use the existing signed keyboard. These may be grouped into a future **Integers** card or added as toggles around the existing negative-number setting.

---

## 53. Powers & Exponents (potential; squares foundation shipped)

### 53.1 Existing foundation

Squaring, square roots, and optional square terms in order-of-operations questions are shipped. General exponent practice and scientific notation are not.

### 53.2 Proposed scope

- Evaluate `aⁿ` using small integer bases and nonnegative exponents.
- Find a missing base or exponent where the answer is unique.
- Product, quotient, and power-of-a-power rules with integer exponents in v1.
- Powers of `10`, including place-value shifts.
- Convert between ordinary and scientific notation.

Use Unicode superscripts or the existing structured math text—no drawing is required. Generate questions backwards when solving for a missing base/exponent to guarantee exact answers. Start with positive exponents; zero and negative exponents are later difficulty levels. Attempts roll up under **Powers & exponents**.

---

## 54. Angles (potential; text-first v1)

### 54.1 Proposed scope

- Classify a stated measure as acute, right, obtuse, straight, reflex, or full turn.
- Find a missing angle on a straight line using `x + a = 180°`.
- Find a missing angle around a point using a sum of `360°`.
- Complementary (`90°`) and supplementary (`180°`) angle pairs.
- Triangle angle sums using three stated measures or a compact symbolic expression.

V1 must be solvable from text and equations, for example “What type of angle is 120°?” or `65° + x = 180°`. Do not require generated angle arcs, protractors, or draggable diagrams. Reusable static illustrations may appear only in Learn. Numeric blanks support keyboard entry; classification uses multiple choice. Attempts roll up under **Angles**.

---

## 55. Coordinate Geometry (potential; no plotted graph in v1)

### 55.1 Proposed scope

- Read an explicitly written ordered pair and identify its `x`- or `y`-coordinate.
- Identify a quadrant from the signs of `(x, y)`.
- Reflect a point across the x-axis, y-axis, or origin.
- Translate a point by a stated horizontal/vertical displacement.
- Find horizontal or vertical distance between aligned points.
- Find a midpoint when both midpoint coordinates are integers.

V1 uses coordinate tuples and text only. Interactive plotting, axes, grids, freehand graphs, and arbitrary line drawing are deferred. Answers containing ordered pairs should initially be multiple choice unless a validated two-field coordinate input is added. Attempts roll up under **Coordinate geometry**.

---

## 56. Measurement & Unit Conversion (potential extension)

### 56.1 Existing foundation

Metric measurement comparison using `<`, `>`, or `=` exists under Comparison. General conversion questions, multi-step measurement stories, and imperial units are not implemented.

### 56.2 Proposed scope

- Length: `mm`, `cm`, `m`, `km`.
- Mass: `g`, `kg`.
- Capacity: `mL`, `L`.
- Area units with squared conversion factors at higher difficulty.
- Time conversions among minutes, hours, and days.
- Exact metric conversions and multi-step text word problems.
- Imperial units as a later opt-in extension.

Use text and unit abbreviations only; rulers, scales, containers, and maps do not need custom drawings. Generate from exact conversion factors and state whether decimal answers are allowed. Numeric keyboard answers omit the unit only when the prompt and input label make the expected unit explicit. Attempts roll up under **Measurement**.

---

## 57. Statistics (potential; separate top-level topic)

Statistics must be separate from Probability and split into focused subcategories:

- **Read data:** values, totals, highest/lowest, and differences from a compact table.
- **Frequency tables:** counts and simple cumulative totals; plain table layout only.
- **Mean:** calculate an average or find one missing value from a stated mean.
- **Median:** sort a short dataset and handle odd/even item counts.
- **Mode:** one mode, no mode, or two modes.
- **Range:** largest minus smallest and missing endpoints.
- **Compare datasets:** compare center or spread using stated values.

V1 uses short numeric lists and standard app table/card components. Bar, line, pie, pictogram, and interactive chart drawing are deferred. Generators must keep means and missing values exact whole numbers initially. Numeric results support keyboard entry; “no mode” and comparison conclusions use multiple choice. Attempts roll up under **Statistics**.

---

## 58. Probability (potential; separate top-level topic)

Probability must be separate from Statistics and split into focused subcategories:

- Vocabulary: impossible, unlikely, equally likely, likely, certain.
- Simple probability as `favorable outcomes / total outcomes`.
- Compare or order probabilities expressed as fractions, decimals, or percentages.
- Complementary probability using `P(not A) = 1 − P(A)`.
- Small sample spaces for one or two coins/dice.
- Experimental versus theoretical probability.
- Expected frequency with exact whole-number results.

V1 uses text, Unicode coin/die symbols where reliable, or the app's existing colored shapes. It must not require custom cards, spinners, animation, or chart drawing. Combined events, replacement rules, and conditional probability are later difficulty levels. Fraction/numeric answers can reuse existing keyboard parsing; vocabulary stays multiple choice. Attempts roll up under **Probability**.

---

## 59. Sequences & Functions Extensions (potential; pattern foundation shipped)

### 59.1 Existing foundation

Arithmetic, geometric, skip-counting, alternating-number, and visual shape patterns are shipped under Patterns.

### 59.2 Missing scope

- Find the nth term of a simple arithmetic sequence.
- Complete compact input/output tables.
- Recognize a linear rule from numeric pairs.
- Evaluate functions such as `f(x) = 2x + 3` for a given `x`.
- Find a missing input or output when the linear rule is given.

V1 uses sequence text, formulas, and small two-column tables. Coordinate graphs and plotted function lines are deferred. Numeric results support keyboard entry. These may extend the existing Patterns card, while explicit function notation can roll up under a later **Functions** label.

---

## 60. Roman Numerals (potential)

### 60.1 Proposed scope

- Convert Roman numerals to ordinary whole numbers and back.
- Compare two Roman numerals.
- Complete a short Roman-numeral sequence.
- Read familiar clock-hour values without requiring a new clock drawing.

Start with `I`, `V`, and `X` (`1–20`), then add `L`, `C`, `D`, and `M` up to `3,999`. Enforce canonical subtractive forms such as `IV`, `IX`, `XL`, `XC`, `CD`, and `CM`; do not generate nonstandard forms such as `IIII`. Use text-only rendering. Numeric conversions support keyboard entry; Roman-text answers use multiple choice until the keyboard sanitizer supports the required letters. Attempts roll up under **Roman numerals**.

---

## 62. Share Settings Export/Import (shipped)

### 62.1 Purpose

Allow users to **back up, copy, or move** session and topic settings between devices or profiles without exporting the learner-name field, age, math confidence or progress. The profile label is included as metadata and may itself contain identifying text.

Typical uses:

- Share a teacher-prepared plan with a parent (settings only)
- Duplicate topic configuration into a second profile on the same device
- Restore session/topic settings after reinstalling the app (profile must be recreated on import)

### 62.2 Settings navigation

```text
Settings hub → Share settings → Export settings | Import settings
```

The hub shows a single **Share settings** entry; export and import actions live on the dedicated share screen.

### 62.3 Export

- Exports the active profile’s `learningConfig` (`MathLearningConfig`) plus metadata.
- Opens the system share sheet with a JSON file (e.g. `therealmath-grade-4-plan.json`).
- **Includes:** the profile label in the payload and generated filename. This user-entered label may contain identifying text.
- **Does not include:** the separate learner-name field, age, math confidence, session history, streak, or adaptation state.

Export payload (version **1**):

| Field | Description |
|---|---|
| `kind` | `therealmath-learning-plan` |
| `version` | `1` |
| `exportedAt` | ISO timestamp |
| `appVersion` | App version at export time (optional) |
| `label` | Optional human label (usually the profile name used at export) |
| `learningConfig` | Full normalized learning plan object; validated during import and before starting a session |

### 62.4 Import

1. User picks a `.json` file (document picker).
2. App validates file size (max **256 KB**), JSON shape, `kind`, `version`, and `learningConfig` using the same validators as in-app saves.
3. User enters a **profile name** for this device (prefilled from export `label` when present).
4. User chooses destination:
   - **Create new profile** (default) — learner name defaults to localized **“friend”**; age left blank; new profile becomes active.
   - **Replace settings in current profile** — overwrites only `learningConfig` on the active profile after confirmation; profile name, learner name, age, and progress are unchanged.

Import errors show a localized message (invalid JSON, wrong file type, unsupported version, invalid settings, file too large, read failure).

Import normalizes older settings and permits a configuration with all question sources disabled. Starting a session still requires at least one valid enabled source. Import is a settings transfer, not a full profile/progress backup, and does not transfer the device-wide language preference.

### 62.5 Security and privacy

- Treat imports as untrusted input: parse JSON only; reject oversize files; require known `kind` and `version`; run existing `validateLearningConfig`.
- Import parses settings data, never executable content. Exports include the profile label and must not be described as guaranteed free of identifying text.
- Export is user-initiated; import never runs automatically.

### 62.6 Localization

English and Macedonian strings for hub entry, share screen, import flow, error messages, and replace-settings confirmation.

---

## 63. Implementation Review — 9 September 2026

### 63.1 Changes from this review

| Area | BRD correction or addition | Implementation evidence |
|---|---|---|
| Session settings | Exact start-duration presets, per-question timer range/default, timeout scoring, timed feedback/advance behavior, and uncapped bonus extension (§13) | [Session constants](../src/features/learning-plan/learningPlan.types.ts), [Practice/Quiz view](../src/components/practice/MathSessionView.tsx), [Timed view](../src/components/practice/TimedMathSessionView.tsx), [time adjustment](../src/features/learning-plan/timedRun.utils.ts) |
| Learning versus recorded progress | Learn → Try is untimed and open-ended, with no result/history; all Learn topics are already visible (§27) | [Learn list](../src/app/learn/index.tsx), [Learn practice](../src/components/practice/LearnPracticeSessionView.tsx) |
| Settings navigation and answer entry | Four topic groups; quotient/remainder keyboard fallback is per question (§11, §15) | [Topic groups](../src/components/settings/settingsTopicCategories.ts), [answer-input rules](../src/features/questions/questionAnswerInput.ts) |
| Progress and persistence | Local-day streak semantics, session-average versus topic accuracy, adaptation thresholds, and no in-progress session persistence (§20, §36) | [History](../src/features/progress/sessionHistory.ts), [adaptation](../src/features/progress/adaptation.ts), [store](../src/store/useAppStore.ts) |
| Question generation | Best-effort prompt uniqueness with valid-repeat fallback; no cross-question uniqueness in Learn → Try; arithmetic fractions bypass the shared addition cap check (§12, §17) | [Question generator](../src/features/questions/questionGenerator.ts), [Learn practice](../src/components/practice/LearnPracticeSessionView.tsx) |
| Resolved decisions | Remove already-implemented controls, answer caps, comparison labels, equations-card placement, and calculus choices from the open list (§30) | [Comparison generator](../src/features/comparison/comparisonGenerator.ts), [settings editor](../src/components/learning-plan/LearningPlanEditor.tsx), topic generators |
| Sharing and language | Normalize imported settings; disabled plans may import but cannot start; language is device-wide and its switch is hidden in sessions (§42, §62) | [Import parser](../src/features/learning-plan/learningPlanExport.utils.ts), [root navigation](../src/app/_layout.tsx) |

### 63.2 Device behavior and current limits

- The app requests portrait orientation on phones. On screens with a shortest dimension of at least 600 layout units, it unlocks orientation. See [orientation hook](../src/hooks/usePhonePortraitOrientation.ts); platform behavior still requires device verification.
- Written question prompts remain necessary. There is no implemented question read-aloud control; an installed speech dependency is not evidence of narration. Timed feedback has a screen-reader announcement for time adjustments, which is distinct from question narration.
- Session history stores aggregates, not a recoverable copy of each question. The immediate Quiz/Timed review stores text and answer labels, not full visual diagram data. Full visual replay and persisted history review must not be advertised as shipped.
- Offline question generation, Learn content, and local progress do not require an account or remote question service. Downloading the app or updates and sharing through an external destination can still require connectivity.

### 63.3 Scope retained for future decisions

No implemented top-level topic needs to be removed from the current feature inventory. Dedicated percentages, ratios, number theory, matrices, statistics, probability, and the other §§45–60 proposals remain potential extensions. Learn editorial/visual review and persisted question-history review remain future work. Their priority has not been changed by this source review.

This was a documentation/source comparison, not an emulator, accessibility certification, or store-release verification. No mobile behavior was changed.

---

## 61. Summary

The app provides a simple, friendly math learning experience for **learners of all ages**, with optional age-based recommended plans and flexible profiles for multiple learners on one device.

First-time flow:

```text
Language → Profile label + learner name → Optional age + confidence → Save recommended plan → Home → Practice / Quiz / Timed / Learn / Settings / Progress
```

The learning plan is flexible but not overwhelming: each operation (plus geometry, comparison, logarithms, linear/quadratic equations, limits, calculus, and other topic cards) is configurable separately, with per-operation toggles for question styles. Multiple-choice answers are the default; keyboard mode is available where appropriate. Optional **Confirm answer** for multiple choice. Practice gives immediate feedback; Quiz withholds correctness until the end; Timed gives brief feedback with time adjustments and a final summary. Learn → Try is separate open-ended practice without recorded progress.

**Shipped today:** arithmetic, decimals toggle (1 place), fractions on operation cards, regrouping, word problems, equations with `x` and `xy`, **linear and quadratic equations**, **limits**, equivalent expressions, expanded geometry, comparison, Shapes with color and pattern questions, Numbers / early number sense, clock/time, numeric patterns, visual fractions with multiple-choice or keyboard entry, trigonometry v1, **logarithms**, calculus (power/constant/sum/ln/trig/quotient), focused Learn/Try configuration (23 topics), configurable timed penalties and bonuses, multi-profile, progress screen with streak, session filter, expandable rows, and topic accuracy (§36), **share settings export/import** (§62), gentle adaptation, build/update information (About screen), privacy policy, unsaved-settings protection, compact visual layouts, **English + Macedonian** UI, and an Expo SDK 57 runtime baseline.

**Later / potential:** dedicated percentages (§51), money word problems, ratios and proportions (§45), LCM/GCD (§46), decade-based number reasoning (§47), matrices (§48), place value / number decomposition (§49), factors/primes/divisibility (§50), integer extensions (§52), powers/exponents (§53), text-first angles (§54), coordinate reasoning without graph drawing (§55), measurement conversions (§56), statistics (§57), probability (§58), sequence/function extensions (§59), Roman numerals (§60), Learn quality pass (§35), history question drill-down (§37), gamification, cloud sync, and parent dashboard.
