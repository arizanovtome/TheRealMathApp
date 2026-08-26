# Business Requirements Document: The Real Math

## 1. Document Purpose

This document defines the business and functional requirements for a React Native Expo mobile application that helps people learn and practice math. The focus of this document is the application behavior, learning flow, configuration model, and question-generation logic.

The app is designed for **learners of all ages** — from early number sense through upper elementary and beyond — while still offering optional age-based recommended plans for quick setup.

This document does not cover monetization, store release requirements, or legal requirements. An **in-app privacy policy** screen is shipped (see Home → Privacy policy); store listing URLs and compliance questionnaires remain the publisher’s responsibility.

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
- **Fraction recognition** (visual bar models — see §28)
- **Shapes** (shape/color recognition and visual patterns — see §28.6)
- **Numbers / early number sense** (before/after, missing numbers, odd/even — see §39); visual counting and quantity comparison are configured under Shapes
- **Clock / time** (analog read and elapsed time — see §31)
- **Patterns & sequences** (numeric sequences; visual patterns are configured under Shapes — see §32 and §28.6)
- **Trigonometry** (right-triangle ratios — formula selection and side naming — see §38)
- **Logarithms** (log rules and numeric log/ln values — see §41)
- **Differentiation** and **Integration** (symbolic MC — see §34)
- **Linear and quadratic equations** (multi-step linear equations and factorable quadratics — see §43)
- **Limits** (direct substitution, factor-and-cancel, infinity, and rationalization limits — see §44)

**Shipped:** comparison (all subtypes in §25), equations with **two** unknowns (`x` and `y`), **linear and quadratic equations** (§43), **limits** (§44), **Learn** reference library (23 topics), visual fraction recognition, shape recognition, clock/time, patterns, **decimal toggles** on basic operations (1 decimal place), trigonometry v1 (§38), **logarithms** (§41), calculus with power/constant/sum, natural log, trig, and quotient/simplify-fraction rules (§34), privacy policy screen, compact question cards for visual prompts, **confirm before submit** for multiple choice, and **English + Macedonian** UI (§42).

**Planned next:** dedicated decimal/percent practice module beyond rounding and comparison (see §24.6).

**Later:** Learn quality pass (§35), richer timed-run stats (§36), session history question review (§37).

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
| 13+ / unspecified | User chooses operations manually; no assumption of “kids only” content |

---

## 5. High-Level User Flow

The recommended first-time user flow is:

1. User opens the app.
2. App prompts **language selection** on first launch (English or Macedonian).
3. App prompts **profile setup**: profile label (e.g. “Subtraction”, “Advanced”), learner name or nickname, and age.
4. App creates a recommended learning plan based on age (using 4–12 brackets when age falls in that range).
5. User can either start learning immediately or customize the plan.
6. User starts practice, quiz, or a timed run from the home screen (or **Try in practice** from Learn).
7. App presents math questions from the active profile’s enabled sources.
8. User answers via multiple choice or keyboard (depending on settings and question type); optional **Confirm** step for multiple choice.
9. App provides feedback based on the selected mode.
10. App displays progress or final result.
11. User can open **Settings** to switch profiles, edit personal info, or change the learning plan.
12. User can open **Learn** from home to browse tutorials by topic.

---

## 6. Onboarding Requirements

### 6.1 Profile setup (first launch and add profile)

On first launch, the app creates **Profile 1** by default for the profile label; the user may change it.

The profile setup screen should collect:

1. **Profile name** — a short label for switching profiles (e.g. “Subtraction”, “Advanced”, “Profile 2”). Placeholder example: `Subtraction, Advanced, …`
2. **Name or nickname** — used in greetings and feedback (e.g. “Hi Alex!”). Placeholder example: `John Smith`
3. **Age (years)** — numeric entry; no default pre-filled value; placeholder “Your age”

There is no separate “what should we call you?” step without profile name; both are on one screen.

When adding another profile from Settings, the same flow applies (`mode=add`).

### 6.2 Age selection

Supported age entry:

- Minimum: **1**
- Maximum: **150**

The selected age is used to pick a **recommended learning plan** using these brackets when age falls in range:

| Age entered | Recommended bracket |
|---|---|
| 4–5 | 4–5 plan |
| 6–7 | 6–7 plan |
| 8–9 | 8–9 plan |
| 10–12 | 10–12 plan |
| Outside 4–12 | Closest bracket or default plan (implementation uses `getAgeBracket`) |

Ages below 4 or above 12 still save correctly; recommended defaults are tuned for school-age brackets when age falls in **4–12**. Ages **13+** or outside brackets receive a neutral default plan — users customize operations manually; the app does not assume “kids only” content.

### 6.3 Name / nickname (within profile setup)

The learner name should be used in the app to make the experience more personal.

Example usage:

- “Hi Alex!”
- “Great job, Alex!”

A nickname is accepted; a legal name is not required.

### 6.4 Recommended plan as default

After name and age are selected, the app should default to the recommended learning plan.

The app should not force the user to configure all learning settings before starting.

Recommended primary action:

> Start learning

Secondary action:

> Customize

Example screen message:

> Based on your age, we prepared a learning plan for you. You can change it anytime.

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
- **Fraction recognition** (visual bar models — see §28)
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
- Age
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
  leftMin: number;
  leftMax: number;
  rightMin: number;
  rightMax: number;
  /** Shipped — 1 decimal place; see §8.1 */
  allowDecimals?: boolean;
};

type SubtractionConfig = {
  enabled: boolean;
  firstMin: number;
  firstMax: number;
  secondMin: number;
  secondMax: number;
  allowNegativeAnswers: boolean;
  /** Shipped — see §8.2 */
  allowDecimals?: boolean;
};

type MultiplicationConfig = {
  enabled: boolean;
  leftMin: number;
  leftMax: number;
  rightMin: number;
  rightMax: number;
  /** Shipped — see §8.3 */
  allowDecimals?: boolean;
};

type DivisionConfig = {
  enabled: boolean;
  answerMin: number;
  answerMax: number;
  divisorMin: number;
  divisorMax: number;
  /** Shipped — see §8.4 */
  allowDecimals?: boolean;
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
  equationUnknown: EquationUnknownConfig;

  /** Shipped — Phase 1 geometry. */
  geometry: GeometryConfig;

  /** Shipped base — expanded subtypes planned (§25). */
  comparison: ComparisonConfig;

  /** Shipped — see §26 */
  equationTwoUnknowns: EquationTwoUnknownsConfig;

  /** Shipped — see §28 */
  fractionVisual: FractionVisualConfig;

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
  maxFinalResult: 10 | 20 | 100 | 1000 | 'unlimited';
  timerEnabled: boolean;
  timerSecondsPerQuestion: number;
  timedDurationMinutes: number;
  timedSubtractSecondsOnWrong: boolean;
};

/** Shipped — see §8.7 */
type GeometryConfig = {
  enabled: boolean;
  perimeter: { enabled: boolean; shapes: { square; rectangle; triangle; circle } };
  area: { enabled: boolean; shapes: { square; rectangle; triangle; circle; rhombus; trapezoid } };
  volume: { enabled: boolean; shapes: { cube; cuboid; pyramid; cone; cylinder } };
  questionKinds: { formula: boolean; calculate: boolean };
};

/** Shipped base — expanded subtypes planned (§25) */
type ComparisonConfig = {
  enabled: boolean;
  /** Shipped */
  relational: boolean;
  ordering: boolean;
  /** Auto-derived from enabled operations — not a user toggle */
  expressionCompare: boolean;
  /** Planned — explicit toggles */
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
  age: number;
  learningConfig: MathLearningConfig | null;
  sessionHistory: SessionHistoryEntry[];
};
```

*(Implementation may still use `ChildProfile` as the persisted type name for backward compatibility.)*

---

## 10. Recommended Learning Plan by Age

The app should generate a recommended learning plan based on the selected age when provided. These defaults are **starting suggestions only** — all operations and topics remain available for manual configuration regardless of age.

### Age 4–5

Recommended focus:

- Simple addition
- Very small numbers
- Optional simple subtraction later

Suggested config:

```ts
{
  addition: {
    enabled: true,
    leftMin: 1,
    leftMax: 5,
    rightMin: 1,
    rightMax: 5
  },
  subtraction: {
    enabled: false,
    firstMin: 1,
    firstMax: 5,
    secondMin: 1,
    secondMax: 5,
    allowNegativeAnswers: false
  },
  multiplication: {
    enabled: false,
    leftMin: 1,
    leftMax: 5,
    rightMin: 1,
    rightMax: 5
  },
  division: {
    enabled: false,
    answerMin: 1,
    answerMax: 5,
    divisorMin: 1,
    divisorMax: 5
  },
  mode: 'practice',
  questionsCount: 5,
  answerOptionsCount: 2,
  maxFinalResult: 10
}
```

### Age 6–7

Recommended focus:

- Addition up to 20
- Subtraction up to 20

Suggested config:

```ts
{
  addition: {
    enabled: true,
    leftMin: 1,
    leftMax: 20,
    rightMin: 1,
    rightMax: 20
  },
  subtraction: {
    enabled: true,
    firstMin: 1,
    firstMax: 20,
    secondMin: 1,
    secondMax: 20,
    allowNegativeAnswers: false
  },
  multiplication: {
    enabled: false,
    leftMin: 1,
    leftMax: 10,
    rightMin: 1,
    rightMax: 10
  },
  division: {
    enabled: false,
    answerMin: 1,
    answerMax: 10,
    divisorMin: 1,
    divisorMax: 10
  },
  mode: 'practice',
  questionsCount: 10,
  answerOptionsCount: 3,
  maxFinalResult: 20
}
```

### Age 8–9

Recommended focus:

- Addition up to 100
- Subtraction up to 100
- Basic multiplication up to 10

Suggested config:

```ts
{
  addition: {
    enabled: true,
    leftMin: 1,
    leftMax: 100,
    rightMin: 1,
    rightMax: 100
  },
  subtraction: {
    enabled: true,
    firstMin: 1,
    firstMax: 100,
    secondMin: 1,
    secondMax: 100,
    allowNegativeAnswers: false
  },
  multiplication: {
    enabled: true,
    leftMin: 1,
    leftMax: 10,
    rightMin: 1,
    rightMax: 10
  },
  division: {
    enabled: false,
    answerMin: 1,
    answerMax: 10,
    divisorMin: 1,
    divisorMax: 10
  },
  mode: 'practice',
  questionsCount: 10,
  answerOptionsCount: 4,
  maxFinalResult: 100
}
```

### Age 10–12

Recommended focus:

- Addition up to 100
- Subtraction up to 100
- Multiplication up to 12
- Division with whole-number answers

Suggested config:

```ts
{
  addition: {
    enabled: true,
    leftMin: 1,
    leftMax: 100,
    rightMin: 1,
    rightMax: 100
  },
  subtraction: {
    enabled: true,
    firstMin: 1,
    firstMax: 100,
    secondMin: 1,
    secondMax: 100,
    allowNegativeAnswers: false
  },
  multiplication: {
    enabled: true,
    leftMin: 1,
    leftMax: 12,
    rightMin: 1,
    rightMax: 12
  },
  division: {
    enabled: true,
    answerMin: 1,
    answerMax: 12,
    divisorMin: 1,
    divisorMax: 12
  },
  mode: 'practice',
  questionsCount: 10,
  answerOptionsCount: 4,
  maxFinalResult: 1000
}
```

---

## 11. Learning Plan UI Requirements

The learning plan screen (also labeled **Settings** in navigation) allows the user to configure each operation independently and manage profiles.

Suggested screen title:

> Settings

Suggested layout (abbreviated):

```text
Settings

Profiles
  [Profile 1 ▼]  Switch | Edit | Add | Remove

Personal info
  Profile name, name/nickname, age

[✓] Addition
    Ranges … | Standard | Regrouping | Missing | Word | Fractions …

[✓] Geometry
    Perimeter / Area / Volume | Shapes | Formula + Calculate

Practice mode: Practice | Quiz | Timed
Questions: 10
Answer entry: Multiple choice | Keyboard
Confirm answer (MC): On | Off
Answer choices: 4
Maximum answer (final result): Up to 100
Timer … / Timed duration …

[Start practice]
```

Each operation card should have:

- Enable/disable toggle
- Range configuration (where applicable)
- Per-operation toggles (standard, regrouping, missing number, word problems, fractions, etc.) — not a separate global “question styles” card
- Example question preview when possible

The **Geometry** card uses a master toggle plus measure/shape/question-type controls (see §8.7).

**Profiles** block: switch active profile, edit (load profile into editor), add profile, remove profile (when more than one exists).

Main action:

- Save / Start practice (or Start quiz / Start timed run depending on selected mode)

---

## 12. Range Selection Requirements

The app should support predefined range options at first.

A custom slider can be added later, but buttons are simpler and easier to understand.

Suggested range buttons:

### Addition

- 1–5
- 1–10
- 1–20
- 1–50
- 1–100

### Subtraction

For first number:

- 1–10
- 1–20
- 1–50
- 1–100

For second number:

- 1–5
- 1–10
- 1–20
- 1–50
- 1–100

### Multiplication

- 1–5
- 1–10
- 1–12

### Division

For answer range:

- 1–5
- 1–10
- 1–12

For divisor range:

- 1–5
- 1–10
- 1–12

### Maximum final result (correct answer limit)

In addition to per-operation number ranges, the app should let the learner or parent cap how large the **correct answer** may be for most arithmetic. This is a separate control from operand ranges: it limits the **outcome** of each question, not the operands themselves.

The learning plan screen should offer **five preset choices**, implemented as simple buttons (same interaction style as other preset range controls):

- **Up to 10** — for capped operations, correct answers must be between 0 and 10 (or between −10 and 10 when “answers below zero” is allowed for subtraction).
- **Up to 20** — same idea with a limit of 20.
- **Up to 100** — limit of 100.
- **Up to 1000** — limit of 1000.
- **Unlimited** — no numeric ceiling; generation and validation do not reject answers for being too large.

Recommended defaults by age (aligned with §10):

| Age group | Suggested `maxFinalResult` |
| --- | ---: |
| 4–5 | 10 |
| 6–7 | 20 |
| 8–9 | 100 |
| 10–12 | 1000 |

#### Which operations use the cap

The maximum final result applies when generating and validating these enabled operations:

- Addition
- Subtraction
- Multiplication
- Division
- Squaring
- Square roots
- Equations with an unknown (`x`)

It does **not** apply to:

- **Rounding** — the correct answer is the rounded value (e.g. 50 for “Round 47 to the nearest 10”), which is determined by the rounding range and unit, not by the cap.
- **Order of operations** — the correct answer is `a + b × c` (multiply before add); operand limits are configured separately and are not checked against the cap.

For capped operations, question generation must only produce questions whose `correctAnswer` fits the cap (and existing operation rules). Multiple-choice distractors for capped operations should stay within the same band when possible so wrong answers remain plausible.

For rounding and order of operations, generation does not filter by the cap, settings validation does not show cap-related warnings for those operations, and distractors are not clipped to the cap band.

If the user picks a finite cap that cannot be satisfied together with other **capped** enabled operations and ranges, the app should show a clear validation message per operation (e.g. addition, multiplication) rather than failing silently. Rounding and order of operations never trigger those cap warnings.

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

1. User has a **total session clock** (minutes 1–10, configurable).
2. Questions are generated one after another until time runs out.
3. Optional penalty: subtract 15 seconds on each wrong answer (configurable toggle).
4. Per-question timer from practice/quiz does not apply; timed mode uses the session clock only.
5. Result screen shows score and per-question breakdown (like quiz).

Timed mode does not use a fixed question count setting.

---

## 14. Question Count Requirements

The app should allow the number of questions in a session to be configured.

Suggested options:

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
- **Keyboard** — user types numeric answers, fractions (`3/4`), division remainders (`3 R 2`), equation expressions after `x=`, or calculus/log symbolic expressions where supported

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
- Fraction questions accept `numerator/denominator`.
- Equation-unknown questions accept expression after `x=` (e.g. `4`, `20:5`).
- Geometry **integer** calculate questions accept numeric input.

**Keyboard is not offered when:**

- Division remainders are enabled (quotient R remainder format is awkward on keyboard).
- Geometry **formula** questions (always multiple choice).
- Geometry **π-form** calculate questions (circle, cone, cylinder — always multiple choice, e.g. `10π`).
- Comparison, equivalent expressions, fraction visuals, shapes, clock, patterns, trigonometry, **logarithms**, **linear and quadratic equations**, **limits**, and **calculus** questions (always multiple choice in v1).

Settings shows a note when geometry is enabled and keyboard is selected: formula and π questions still use answer choices.

### 15.3 Comparison, visual topics, advanced equations, limits, calculus, and logarithms

Comparison questions (§25), visual fraction identification (§28), clock/time (§31), patterns (§32), trigonometry (§38), **logarithms (§41)**, **linear and quadratic equations (§43)**, **limits (§44)**, and **calculus (§34)** are **multiple choice only** in all modes.

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

### 17.0 Maximum final result

When `maxFinalResult` is a finite number (10, 20, 100, or 1000), generated questions for **capped** operations must have a `correctAnswer` within the allowed band:

- If subtraction **negative answers are disabled**, require `0 ≤ correctAnswer ≤ maxFinalResult`.
- If subtraction **negative answers are enabled**, require `-maxFinalResult ≤ correctAnswer ≤ maxFinalResult`.

When `maxFinalResult` is **unlimited**, no numeric ceiling is applied in generation or validation for capped operations.

**Exempt operations** — rounding and order of operations never use this cap. Their correct answers follow only their own configuration (value range and nearest unit for rounding; operand max for order of operations). The generator does not reject or resample those questions because an answer exceeds the cap.

For capped operations, operand ranges may still be wide; the generator should **sample** operands until the resulting answer fits the cap, or the learning plan screen should warn that the ranges and cap cannot be satisfied together.

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
- Geometry is **exempt** from `maxFinalResult` cap (like rounding and order of operations).

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

After feedback is shown, the user should be able to continue to the next question.

Possible behavior:

- Show a “Next” button.
- Or automatically continue after a short delay.

Recommended first version:

```text
Use a Next button.
```

A Next button gives the learner time to understand the feedback.

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
scorePercentage = correctAnswers / totalQuestions × 100
```

Example:

```text
Correct answers: 8
Total questions: 10
Score: 80%
```

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
- Age
- Full learning plan (`MathLearningConfig`)
- Session history for that profile

The app remembers the **active profile id** and migrates legacy single-user data into **Profile 1** when needed.

On app start:

- If onboarding is completed for the active profile, app goes to the home screen.
- If onboarding is not completed, app starts profile setup.

**Progress screen (shipped):** Recent sessions, streak and stats by operation (including Geometry, Logarithms, Calculus), and **gentle adaptation** hints on the home screen when recent misses cluster on one enabled operation.

---

## 21. Main Screens

The app includes the following screens.

### 21.1 Language selection (first launch)

Purpose:

- Choose **English** or **Macedonian** before the main app navigation loads.

Main action:

- Continue → profile setup

### 21.2 Profile setup (onboarding and add profile)

Purpose:

- Capture profile label, learner name or nickname, and age on one screen.

Fields:

- Profile name (default `Profile 1` on first launch)
- Name or nickname (placeholder `John Smith`)
- Age (placeholder `Your age`; no pre-filled default)

Main action:

- Continue → age screen or recommended plan (depending on flow)

### 21.3 Onboarding: Age screen

Purpose:

- Confirm or enter age when not collected on prior step (legacy flow may use separate age step).

Main action:

- Continue → recommended plan

### 21.4 Recommended plan screen

Purpose:

- Show that the app prepared a learning plan for this profile.
- Allow start immediately or customize.

Main actions:

- Start learning
- Customize

### 21.5 Settings / learning plan screen

Purpose:

- Switch, edit, add, or remove profiles.
- Edit personal info (profile name, learner name, age).
- Configure operations, ranges, geometry, mode, question count, answer entry, timers, and caps.

Main action:

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

- Session clock (1–10 minutes); questions until time expires.
- Optional 15-second penalty on wrong answers.
- Result screen with score and per-question breakdown.

### 21.10 Progress screen (shipped)

Purpose:

- Recent session list, streak and operation stats, gentle adaptation suggestions.

### 21.11 Result screen

Purpose:

- Show final session result (quiz or timed).
- Encourage the learner.
- Retry or return home.

Main actions:

- Practice again
- Change learning plan / Settings
- Go home

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

- **Multi-profile** support: profile name, learner name, age; switch / edit / add / remove in Settings
- **Internationalization:** English and Macedonian UI; first-run language picker; localized Learn tutorials (mk overrides), word problems, privacy policy, and operation labels (§42)
- Profile setup onboarding (profile name + name + age); age **1–150**; optional recommended plans use **4–12** brackets
- Recommended learning plan by age; full learning plan customization per profile
- Operations: addition, subtraction, multiplication, division, squaring, square roots, rounding, order of operations, equations with one unknown (`x`) and two unknowns (`x`, `y`), **linear and quadratic equations**, **limits**, and **equivalent expressions**
- Per-operation toggles: standard calculation, missing number, word problems, fractions (with denominator mode), regrouping (add/sub), division remainders, **decimals (1 decimal place)**
- **Comparison:** relational, ordering, expression compare, fraction/percent/measurement subtypes
- **Shapes:** identify shape, color, or both; continue shape and colored-shape cycles using the selected shape pool
- **Numbers:** before/after, missing number, odd/even; visual counting and quantity comparison configured under Shapes
- **Clock / time:** analog read and elapsed time
- **Patterns & sequences:** arithmetic, geometric, and number patterns; visual shape patterns live under Shapes
- **Settings workflow:** collapsible enabled sections, header save action, unsaved-changes navigation confirmation, and focused Learn → Try settings
- **Learn** reference library with **23 topics** (easiest → hardest), formula tables, and **Try in practice** for every topic
- **Fraction recognition:** visual bar models (MC identification)
- **Logarithms:** product, quotient, and power rules; numeric log (bases 2, 3, 5, 10) and ln values (§41)
- **Differentiation & Integration:** symbolic MC — power rule, constants, simple sums, natural log, sin/cos, quotient rule (differentiation) / simplify fractions (integration) (§34)
- **Linear & Quadratic Equations:** multi-step linear, variables on both sides, parentheses, and factorable quadratic questions (§43)
- **Limits:** direct substitution, factor-and-cancel, infinity, and rationalization questions (§44)
- **Trigonometry v1:** right-triangle diagrams; pick formula, name sides, find angle; MC only — no numeric calculation (§38)
- **Privacy policy** in-app screen (Home)
- **Compact question card** layout for short prompts with visuals below (clock, shapes, fractions, patterns, trigonometry)
- **Geometry Phase 1:** perimeter, area, volume; formula + calculate; π-form multiple choice for circle/cone/cylinder
- Session modes: **practice**, **quiz**, **timed**
- Answer entry: multiple choice (**2, 3, 4, 6** choices) or **keyboard** (with overrides for geometry formula/π, division remainders, and MC-only topics)
- **Confirm before submit** for multiple choice (optional toggle)
- Configurable question count, per-question timer, timed session duration, timed wrong-answer penalty
- Maximum final result cap (excluding rounding and order of operations)
- **Gentle adaptation** hints on home (focused practice suggestion from recent misses)
- Progress: session history, streak/stats by operation (including Geometry, Comparison, Trigonometry, Logarithms, Linear & Quadratic Equations, Limits, and Calculus), gentle adaptation card
- Local persistence (Zustand + AsyncStorage); legacy single-profile migration
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
- Advanced sliders for every range (predefined buttons first)
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

### 24.3 Later

- Dedicated decimals & percentages module (beyond op-level toggles)
- Money word problems
- Equivalent / compare / fraction-of-a-number (non-visual)
- Badges and rewards
- Parent dashboard
- Cloud sync and multiple devices
- Custom worksheets
- Stronger adaptive difficulty
- Visual word problems with objects or pictures
- Learn section quality pass (§35)
- Richer timed-run stats on Progress (§36)
- Tappable session history → question review (§37)
- Circle fraction models; digital clock read; imperial measurement; pattern keyboard entry
- Trigonometry numeric calculation (evaluate ratios, solve for missing sides or angles — beyond §38 v1)

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

**Product decision (recommended):** Show **all topics** in Learn regardless of practice settings — Learn is a reference library, not gated by the active learning plan.

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

Learn content is **browse-only**; not injected into practice/quiz/timed sessions unless the user taps “Try in practice.”

---

## 28. Visual Fraction Recognition (shipped)

### 28.1 Purpose

Teach and assess **understanding of fractions as parts of a whole**, complementing existing **fraction calculation** questions on operation cards.

### 28.2 Visual types

- **Circle / bar model** divided into equal parts; one or more parts shaded.
- Question: “What fraction is shaded?” → MC options (e.g. `1/3`, `1/4`, `2/3`).
- Optional inverse: “Shade 1/4 of the shape” — **out of scope for v1** (interaction-heavy); ship MC identification first.

### 28.3 Settings

- Toggle under **Fraction recognition** or **Fraction visuals**.
- Denominator pool aligned with existing fraction denominator pool: **2, 3, 4, 5, 6, 8, 10, 12**.
- Can appear in practice/quiz when enabled; also referenced in Learn → Fractions tutorial.

### 28.4 Assets

- Prefer reusable SVG / React Native vector shapes over bitmaps for crisp scaling.
- Same visuals usable in Learn tutorials and in questions.

### 28.5 Answer entry

Multiple choice only (see §15.3).

---

## 29. Implementation Status

| Area | Status | Notes |
|---|---|---|
| Multi-profile | **Shipped** | Profile name + learner name + age; switch / edit / add / remove in Settings |
| Internationalization | **Shipped** | English + Macedonian; first-run language gate; mk Learn overrides (§42) |
| Onboarding | **Shipped** | Profile setup screen; age 1–150; optional recommended plans use 4–12 brackets |
| Session modes | **Shipped** | Practice, quiz, timed run |
| Answer entry | **Shipped** | MC 2/3/4/6 or keyboard; geometry formula / π forced MC; calculus/logs/trig/advanced-equations/limits MC only |
| Confirm before submit | **Shipped** | Optional MC toggle; Confirm then feedback/submit |
| Per-operation toggles | **Shipped** | Standard, missing number, word problems, fractions, regrouping (add/sub), decimals |
| Special ops | **Shipped** | Squaring, square roots, rounding, order of ops, equations with one unknown (`x`) |
| Two-variable equations | **Shipped** | §26 — two-equation systems; both equations include x and y |
| Equivalent expressions | **Shipped** | Square identities, distribution, factorization, etc. |
| Comparison (relational, ordering, expression) | **Shipped** | §25.2–§25.4; expression auto from enabled ops |
| Comparison (fraction/percent/measurement) | **Shipped** | §25.5–§25.8 |
| Learn / tutorials | **Shipped** | §27 — 23 topics matching top-level Settings sections; Try in practice on all |
| Learn Try in practice | **Shipped (partial)** | Open-ended loop; no session history / result screen |
| Visual fraction recognition | **Shipped** | §28 |
| Geometry Phase 1 | **Shipped** | Perimeter / area / volume; formula + calculate; dims 1–10; π-form MC |
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
| Trigonometry v1 | **Shipped (partial)** | §38 — pick formula, name sides, find angle; MC only |
| Privacy policy (in-app) | **Shipped** | Home → Privacy policy |
| Compact question card | **Shipped** | Short prompts + visual below |
| Gentle adaptation | **Shipped** | Home card → focused practice when recent misses cluster |
| Progress | **Shipped** | Session history, streak/stats by operation, adaptation hints |
| Persistence | **Shipped** | Zustand + AsyncStorage; legacy single-profile migration |
| Equation-unknown mode (`off`/`mixed`/`only`) | **Partial** | Type only; no UI or runtime use |
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

**Still open:**

1. Should subtraction support negative answers by default for younger ages, or remain opt-in per profile?
2. Should the app use predefined range buttons only, or include custom range sliders later?
3. ~~Should the result screen show only score or also list incorrect questions?~~ **Resolved:** quiz and timed show full question review on the result screen; practice does not.
4. Should the maximum final result cap apply only to addition, or to all capped operations as implemented today (excluding rounding and order of operations)?
5. Comparison: confirm “Left / Right / Equal” vs symbol labels for expression compare.
6. Two-variable equations: separate card vs mode on existing Equations card.
7. Decimal places: add **2 decimal places** option or keep 1 only?
8. Division with decimals: decimal divisor in a future release or quotients only?
9. Measurement: metric-only first vs imperial?
10. Clock: 12h default for all ages or follow locale?
11. Expression compare: keep auto-only or add override toggle?
12. ~~Calculus: max power **n** in generators?~~ **Resolved:** exponents 2–5 in v1.
13. ~~Integration MC: is `+ C` always required?~~ **Resolved:** yes, where applicable.
14. ~~Calculus settings: separate cards vs combined?~~ **Resolved:** separate Differentiation and Integration cards.
15. Logarithm: add separate base toggles (2/3/5/10) vs single “Find log value” toggle?

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

**Not implemented in current release** — track as content/UX improvement work.

---

## 36. Later: Timed Run Stats in Recent Performance

Today, timed sessions in **Recent performance** show the same summary as quiz/practice: mode badge, date, and **score percentage** only.

**Future improvements:**

- Show timed-specific metrics: questions answered, configured session duration, optional questions per minute
- Update empty-state copy to mention timed runs (currently references practice/quiz only)
- Consider separate visual treatment for timed rows vs fixed-count quiz rows

**Not implemented in current release.**

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

The general upper limit uses the shared discrete slider UI with stops at **5, 10, 20, and 100**. Tick labels must be centered under their corresponding slider stops.

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
- **Settings:** language can be changed at any time; persisted in app store.

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

## 33. Summary

The app provides a simple, friendly math learning experience for **learners of all ages**, with optional age-based recommended plans and flexible profiles for multiple learners on one device.

First-time flow:

```text
Language → Profile setup (name + age) → Recommended learning plan → Home → Practice / Quiz / Timed / Learn / Settings / Progress
```

The learning plan is flexible but not overwhelming: each operation (plus geometry, comparison, logarithms, linear/quadratic equations, limits, calculus, and other topic cards) is configurable separately, with per-operation toggles for question styles. Multiple-choice answers are the default; keyboard mode is available where appropriate. Optional **Confirm answer** for multiple choice. Practice gives immediate feedback; quiz and timed modes summarize at the end.

**Shipped today:** arithmetic, decimals toggle (1 place), fractions on operation cards, regrouping, word problems, equations with `x` and `xy`, **linear and quadratic equations**, **limits**, equivalent expressions, geometry, comparison, Shapes with color and pattern questions, Numbers / early number sense, clock/time, numeric patterns, trigonometry v1, **logarithms**, calculus (power/constant/sum/ln/trig/quotient), focused Learn/Try configuration (23 topics), multi-profile, progress tracking, gentle adaptation, privacy policy, unsaved-settings protection, compact visual layouts, **English + Macedonian** UI.

**Later:** dedicated decimal/percent module, money word problems, Learn quality pass (§35), richer timed stats (§36), history question drill-down (§37), gamification, cloud sync, parent dashboard.
