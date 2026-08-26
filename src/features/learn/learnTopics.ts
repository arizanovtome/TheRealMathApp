import type { GeometryMeasure, GeometryShape } from '@/features/geometry/geometry.types';
import { buildDifferentiationFormulaTables } from '@/features/learn/calculusLearnContent';
import { buildTrigonometryFormulaTables } from '@/features/learn/trigonometryLearnContent';
import { buildLogarithmFormulaTables } from '@/features/logarithm/logarithmLearnContent';
import type { TrigonometryDiagram } from '@/features/trigonometry/trigonometry.types';
import type { LearnPracticeTarget } from '@/features/learn/learnPractice.utils';
import { LEARN_TOPIC_IDS_EASIEST_TO_HARDEST } from '@/constants/topicOrder';
import { applyLearnLocale } from '@/i18n/content/learn/overrides.mk';
import { getLearnContext } from '@/features/learn/learnContextContent';
import { placeLearnExamples } from '@/features/learn/learnExamplePlacement';
import type { SupportedLocale } from '@/i18n/types';

export type LearnTopicId =
  (typeof LEARN_TOPIC_IDS_EASIEST_TO_HARDEST)[number];

export type LearnExample = {
  prompt: string;
  solution: string;
  limitExpression?: {
    approach: string;
    expression: string;
    fraction?: { numerator: string; denominator: string };
  };
  solutionFraction?: { numerator: number; denominator: number };
  solutionSteps?: LearnSolutionStep[];
};

export type LearnSolutionStep = {
  text?: string;
  before?: string;
  fraction?: { numerator: string; denominator: string };
  after?: string;
};

export type LearnSection = {
  heading: string;
  body: string;
  /** Optional worked example rendered directly below this section. */
  example?: LearnExample;
  /** Additional examples, ordered from simpler to more complex. */
  examples?: LearnExample[];
};

export type LearnGeometryDiagram = {
  measure: GeometryMeasure;
  shape: GeometryShape;
};

export type LearnFormulaRow = {
  shape: string;
  formula: string;
  hint?: string;
  explanation?: string;
  diagram?: LearnGeometryDiagram;
  trigonometryDiagram?: TrigonometryDiagram;
};

export type LearnFormulaTable = {
  heading: string;
  intro?: string;
  rows: LearnFormulaRow[];
};

export type LearnTutorial = {
  id: LearnTopicId;
  title: string;
  summary: string;
  introduction?: LearnSection;
  mathUses?: LearnSection;
  realLifeUses?: LearnSection;
  sections: LearnSection[];
  formula?: string;
  formulaTables?: LearnFormulaTable[];
  examples?: LearnExample[];
  /** When set, “Try in practice” opens focused, open-ended practice for this topic. */
  tryInPractice?: LearnPracticeTarget;
};

export const LEARN_TOPIC_ORDER: LearnTopicId[] = [...LEARN_TOPIC_IDS_EASIEST_TO_HARDEST];

const LEARN_TOPICS_UNSORTED: LearnTutorial[] = [
  {
    id: 'advanced_equations',
    title: 'Linear & quadratic equations',
    summary: 'Solve multi-step linear equations and quadratics with two roots.',
    sections: [
      { heading: 'Linear equations', body: 'Undo operations in reverse order and perform the same operation on both sides. Collect variable terms on one side when x appears on both sides.' },
      { heading: 'Quadratic equations', body: 'A quadratic contains x². When it factors into two brackets, set each bracket equal to zero to find both solutions.' },
    ],
    examples: [
      { prompt: '3x + 5 = 20', solution: 'x = 5' },
      { prompt: '(x − 2)(x + 3) = 0', solution: 'x = −3 or 2' },
    ],
    tryInPractice: { kind: 'operation', operation: 'advanced_equations' },
  },
  {
    id: 'limits',
    title: 'Limits',
    summary: 'Find the value an expression approaches as x approaches a point.',
    sections: [
      {
        heading: 'Direct substitution',
        body: 'Substitute the approaching value directly and calculate. This works for polynomials and for rational expressions whose denominator does not become zero.',
        example: {
          prompt: 'lim (x → 2) 12/(x + 2)',
          solution: '12/(2 + 2) = 3',
          limitExpression: { approach: '2', expression: '12/(x + 2)', fraction: { numerator: '12', denominator: 'x + 2' } },
          solutionSteps: [
            { text: 'Substitute x = 2.' },
            { fraction: { numerator: '12', denominator: '2 + 2' } },
            { fraction: { numerator: '12', denominator: '4' }, after: '= 3' },
          ],
        },
      },
      {
        heading: 'Factor and cancel',
        body: 'If substitution gives 0/0, factor the numerator, cancel the shared factor, and then substitute. The original expression is undefined at the point, but its nearby values can still approach one number.',
        example: {
          prompt: 'lim (x → 2) (x² − 4)/(x − 2)',
          solution: '(x − 2)(x + 2)/(x − 2) = x + 2 → 4',
          limitExpression: { approach: '2', expression: '(x² − 4)/(x − 2)', fraction: { numerator: 'x² − 4', denominator: 'x − 2' } },
          solutionSteps: [
            { before: 'Factor:', fraction: { numerator: '(x − 2)(x + 2)', denominator: 'x − 2' } },
            { text: 'Cancel the shared factor (x − 2): x + 2.' },
            { text: 'Substitute x = 2: 2 + 2 = 4.' },
          ],
        },
      },
      {
        heading: 'Limits at infinity',
        body: 'For rational functions, compare the highest powers. Equal degrees approach the ratio of leading coefficients. If the numerator has lower degree, the limit is 0.',
        example: {
          prompt: 'lim (x → ∞) (6x² + 1)/(2x² + 3)',
          solution: '6/2 = 3',
          limitExpression: { approach: '∞', expression: '(6x² + 1)/(2x² + 3)', fraction: { numerator: '6x² + 1', denominator: '2x² + 3' } },
          solutionSteps: [
            { text: 'Keep the highest-degree terms.' },
            { fraction: { numerator: '6x²', denominator: '2x²' } },
            { before: 'Cancel x²:', fraction: { numerator: '6', denominator: '2' }, after: '= 3' },
          ],
        },
      },
      {
        heading: 'Rationalization (limits with roots)',
        body: 'If a square root causes 0/0, multiply the numerator and denominator by the conjugate. The conjugate changes the sign between the two terms, removing the root through a difference of squares.',
        example: {
          prompt: 'lim (x → 0) (√(x + 1) − 1)/x',
          solution: 'Multiply by the conjugate, cancel x, and substitute.',
          limitExpression: { approach: '0', expression: '(√(x + 1) − 1)/x', fraction: { numerator: '√(x + 1) − 1', denominator: 'x' } },
          solutionFraction: { numerator: 1, denominator: 2 },
          solutionSteps: [
            { text: 'Multiply by the conjugate √(x + 1) + 1.' },
            { before: 'After multiplying:', fraction: { numerator: 'x', denominator: 'x(√(x + 1) + 1)' } },
            { before: 'Cancel x:', fraction: { numerator: '1', denominator: '√(x + 1) + 1' } },
            { before: 'Substitute x = 0:', fraction: { numerator: '1', denominator: '2' } },
          ],
        },
      },
    ],
    tryInPractice: { kind: 'operation', operation: 'limits' },
  },
  {
    id: 'addition',
    title: 'Addition',
    summary: 'Putting numbers together to find how many in all.',
    sections: [
      {
        heading: 'What is addition?',
        body: 'Addition means combining two amounts. The answer is called the sum.',
      },
      {
        heading: 'How to add',
        body: 'Start with the first number, then count up by the second number. Line up digits when adding larger numbers.',
      },
    ],
    examples: [
      { prompt: '3 + 4 = ?', solution: '7' },
      { prompt: '12 + 5 = ?', solution: '17' },
    ],
    tryInPractice: { kind: 'operation', operation: 'addition' },
  },
  {
    id: 'subtraction',
    title: 'Subtraction',
    summary: 'Finding the difference when you take away.',
    sections: [
      {
        heading: 'What is subtraction?',
        body: 'Subtraction tells you what is left after removing some amount, or how much more one number is than another.',
      },
    ],
    examples: [
      { prompt: '9 − 4 = ?', solution: '5' },
      { prompt: '15 − 7 = ?', solution: '8' },
    ],
    tryInPractice: { kind: 'operation', operation: 'subtraction' },
  },
  {
    id: 'multiplication',
    title: 'Multiplication',
    summary: 'Equal groups or repeated addition.',
    sections: [
      {
        heading: 'What is multiplication?',
        body:
          'Multiplication is a fast way to add the same number many times. 3 × 4 means three groups of four. When you multiply, you add the same number several times — for example, 4 × 3 = 4 + 4 + 4 = 12, and 5 × 2 = 5 + 5 = 10. Multiplication is a shortcut for repeated addition.',
      },
    ],
    formulaTables: undefined,
    examples: [
      { prompt: '4 × 3 = ?', solution: '12 (4 + 4 + 4)' },
      { prompt: '6 × 5 = ?', solution: '30' },
    ],
    tryInPractice: { kind: 'operation', operation: 'multiplication' },
  },
  {
    id: 'division',
    title: 'Division',
    summary: 'Sharing equally, finding how many groups, or splitting with a remainder.',
    sections: [
      {
        heading: 'What is division?',
        body: 'Division splits a total into equal parts. The answer can be how many in each group or how many groups.',
      },
      {
        heading: 'Quotient and remainder',
        body:
          'Sometimes division does not come out evenly. The whole-number part is the quotient and what is left over is the remainder. For example, 17 ÷ 5 = 3 R 2 because 5 × 3 = 15 and 17 − 15 = 2.',
      },
      {
        heading: 'Remainders with negative numbers',
        body:
          'The remainder is always written as a positive number. When the quotient is negative, the remainder is still positive. For example, −23 ÷ 5 = −4 R 3 because (−4) × 5 + 3 = −23.',
      },
    ],
    examples: [
      { prompt: '12 ÷ 3 = ?', solution: '4' },
      { prompt: '17 ÷ 5 = ? remainder ?', solution: '3 R 2' },
      { prompt: '−23 ÷ 5 = ? remainder ?', solution: '−4 R 3' },
    ],
    tryInPractice: { kind: 'operation', operation: 'division' },
  },
  {
    id: 'squaring',
    title: 'Squaring',
    summary: 'A number multiplied by itself.',
    sections: [
      {
        heading: 'Squares',
        body: 'n² means n × n. Example: 5² = 5 × 5 = 25.',
      },
    ],
    formula: 'n² = n × n',
    examples: [{ prompt: '7² = ?', solution: '49' }],
    tryInPractice: { kind: 'operation', operation: 'square' },
  },
  {
    id: 'square_roots',
    title: 'Square roots',
    summary: 'The number that was squared.',
    sections: [
      {
        heading: 'Square roots',
        body: '√49 asks: what number times itself equals 49? The answer is 7.',
      },
    ],
    formula: 'If n² = a, then √a = n (for whole-number squares).',
    examples: [{ prompt: '√81 = ?', solution: '9' }],
    tryInPractice: { kind: 'operation', operation: 'square_root' },
  },
  {
    id: 'rounding',
    title: 'Rounding',
    summary: 'Approximating to the nearest ten, hundred, or decimal place.',
    sections: [
      {
        heading: 'Nearest ten',
        body: 'Look at the ones digit. 5 or more rounds up; 4 or less rounds down. 47 → 50.',
      },
    ],
    examples: [{ prompt: 'Round 47 to the nearest 10', solution: '50' }],
    tryInPractice: { kind: 'operation', operation: 'rounding' },
  },
  {
    id: 'order_of_operations',
    title: 'Order of operations',
    summary: 'Evaluate powers and roots before multiplication, then add.',
    sections: [
      {
        heading: 'Multiply before addition',
        body: 'In 3 + 4 × 5, multiply first: 4 × 5 = 20, then add 3 to get 23.',
      },
      {
        heading: 'Squares and square roots',
        body: 'Evaluate squares and square roots before multiplication. In 3 + 4² × 2, find 4² = 16 first. In 3 + √16 × 2, find √16 = 4 first.',
      },
    ],
    examples: [
      { prompt: '3 + 4 × 5 = ?', solution: '23' },
      { prompt: '3 + 4² × 2 = ?', solution: '35' },
      { prompt: '3 + √16 × 2 = ?', solution: '11' },
    ],
    tryInPractice: { kind: 'operation', operation: 'order_of_operations' },
  },
  {
    id: 'equivalent_expressions',
    title: 'Equivalent expressions',
    summary: 'Different-looking expressions that have the same value or algebraic meaning.',
    sections: [
      {
        heading: 'Squares of binomials',
        body: '(a + b)² = a² + 2ab + b² and (a − b)² = a² − 2ab + b². The middle term comes from multiplying a and b twice.',
      },
      {
        heading: 'Removing parentheses',
        body: 'A plus before parentheses keeps the signs. A minus before parentheses changes every sign inside: 100 − (50 + 20) = 100 − 50 − 20, and 100 − (50 − 20) = 100 − 50 + 20.',
      },
      {
        heading: 'Distribution and factorization',
        body: 'Distribution multiplies every term: a(b + c) = ab + ac. Factorization reverses this by taking out a common factor: ab + ac = a(b + c).',
      },
      {
        heading: 'Difference of squares',
        body: 'A difference of two squares factors as a² − b² = (a + b)(a − b).',
      },
    ],
    examples: [
      { prompt: '(a + b)² = ?', solution: 'a² + 2ab + b²' },
      { prompt: '100 − (50 + 20) = ?', solution: '100 − 50 − 20' },
      { prompt: '3(x + 4) = ?', solution: '3x + 12' },
      { prompt: '6x + 9 = ?', solution: '3(2x + 3)' },
      { prompt: 'a² − b² = ?', solution: '(a + b)(a − b)' },
    ],
    tryInPractice: { kind: 'operation', operation: 'equivalent_expressions' },
  },
  {
    id: 'equations_xy',
    title: 'Systems of equations',
    summary: 'Two equations, one missing value at a time.',
    sections: [
      {
        heading: 'Two variables',
        body:
          'You get two equations that both use x and y. Use them together to find one value. Example:\nx + y = 10\nx − y = 4\nFrom these, x = 7.',
      },
    ],
    examples: [
      {
        prompt: 'x + y = 10\nx − y = 4\nFind x.',
        solution: 'x = 7',
      },
    ],
    tryInPractice: { kind: 'equation_two_unknowns' },
  },
  {
    id: 'geometry',
    title: 'Geometry',
    summary: 'Perimeter, area, and volume — formulas and calculate questions for every shape in the app.',
    sections: [
      {
        heading: 'Two question types',
        body:
          'Formula questions ask “What is the … formula for a …?” and use multiple choice. Calculate questions give dimensions (whole numbers 1–10) and ask you to find perimeter, area, or volume.',
      },
      {
        heading: 'Letters on diagrams',
        body:
          'Sides use a, b, c, and d (same letter = equal length). r is radius, h is height, and d1 and d2 mark diagonals on a rhombus or kite.',
      },
    ],
    formulaTables: undefined,
    examples: [
      {
        prompt: 'Perimeter of a square with side 5',
        solution: '4 × 5 = 20',
      },
      {
        prompt: 'Area of a circle with radius 3 (calculate, π form)',
        solution: '9π',
      },
    ],
    tryInPractice: { kind: 'operation', operation: 'geometry' },
  },
  {
    id: 'trigonometry',
    title: 'Trigonometry',
    summary:
      'Right triangles — name the sides relative to angle θ and choose sin, cos, or tan (no number crunching yet).',
    sections: [
      {
        heading: 'Relative to angle θ',
        body:
          'In a right triangle, the hypotenuse is the longest side (across from the right angle). The opposite side is across from θ. The adjacent side touches θ but is not the hypotenuse.',
      },
      {
        heading: 'Pick a formula, not a number',
        body:
          'Practice questions show a triangle with angle θ and a side marked ?. Your job is to choose which ratio connects the sides — you do not calculate a numeric answer.',
      },
      {
        heading: 'SOH-CAH-TOA',
        body:
          'Sine uses opposite and hypotenuse. Cosine uses adjacent and hypotenuse. Tangent uses opposite and adjacent. Cotangent is the reciprocal of tangent — adjacent over opposite.',
      },
      {
        heading: 'Special angles',
        body:
          'Some angles have neat exact values — for example sin 30° = 1/2 and cos 60° = 1/2. The table below lists the most common ones to recognize.',
      },
    ],
    formulaTables: buildTrigonometryFormulaTables(),
    examples: [
      {
        prompt: 'θ is marked. Side ? is opposite. Which formula?',
        solution: 'sin θ = opposite / hypotenuse',
      },
      {
        prompt: 'θ is marked. Side ? is adjacent. Which formula?',
        solution: 'cos θ = adjacent / hypotenuse',
      },
      {
        prompt: 'Relative to θ, the vertical side is…',
        solution: 'Opposite (when θ is at the bottom-left corner)',
      },
    ],
    tryInPractice: { kind: 'operation', operation: 'trigonometry' },
  },
  {
    id: 'logarithm',
    title: 'Logarithms',
    summary: 'Inverse of exponentiation — log rules, base 10, and the natural log ln with e.',
    sections: [
      {
        heading: 'What is a logarithm?',
        body:
          'A logarithm answers: “To what power must the base be raised to get this number?” For example, log₁₀(100) = 2 because 10² = 100. Logarithms undo exponentiation, just as square roots undo squaring.',
      },
      {
        heading: 'The number e',
        body:
          'e ≈ 2.718… is a special constant that appears throughout calculus. The natural logarithm ln uses base e. By definition, ln(e) = 1 and ln(eⁿ) = n.',
      },
      {
        heading: 'Using log rules',
        body:
          'Product, quotient, and power rules let you rewrite logs without a calculator. Practice may ask you to expand log(4 × 5) as log 4 + log 5, simplify log(x³) as 3 log x, or evaluate log₁₀(1000) and ln(e²).',
      },
    ],
    formulaTables: buildLogarithmFormulaTables(),
    examples: [
      { prompt: 'log(6 × 5) = ?', solution: 'log 6 + log 5' },
      { prompt: 'log₁₀(1000) = ?', solution: '3' },
      { prompt: 'ln(e²) = ?', solution: '2' },
      { prompt: 'log(x⁴) = ?', solution: '4 log x' },
    ],
    tryInPractice: { kind: 'operation', operation: 'logarithm' },
  },
  {
    id: 'fractions',
    title: 'Fractions',
    summary: 'Parts of a whole and fraction calculations.',
    sections: [
      {
        heading: 'Parts of a whole',
        body: 'In 3/4, the bottom number (4) is how many equal parts; the top (3) is how many are shaded or counted.',
      },
      {
        heading: 'Adding fractions',
        body: 'Same denominator: add numerators. Different denominators: find a common denominator first.',
      },
    ],
    examples: [
      { prompt: '1/4 + 2/4 = ?', solution: '3/4' },
      { prompt: 'What fraction is shaded? (2 of 4 parts)', solution: '2/4 = 1/2' },
    ],
    tryInPractice: { kind: 'fractions' },
  },
  {
    id: 'comparison',
    title: 'Comparison',
    summary: 'Compare numbers and expressions with <, >, and =.',
    sections: [
      {
        heading: 'Symbols',
        body: '< means less than, > means greater than, = means equal.',
      },
      {
        heading: 'Expressions',
        body: 'Compare the answers on each side: 3 + 4 vs 2 + 5 → 7 vs 7 → use =.',
      },
      {
        heading: 'Fractions, percents, and measurement',
        body: 'You can also compare 3/4 vs 0.75, 50% vs 1/2, two fractions, or units like 500 cm vs 5 m.',
      },
    ],
    examples: [
      { prompt: '7 __ 12', solution: '<' },
      { prompt: '3 + 4 __ 2 + 5', solution: '=' },
      { prompt: '3/4 __ 0.75', solution: '=' },
    ],
    tryInPractice: { kind: 'operation', operation: 'comparison' },
  },
  {
    id: 'clock',
    title: 'Clock / time',
    summary: 'Read analog clocks and find elapsed time.',
    sections: [
      {
        heading: 'Reading the clock',
        body: 'The short hand shows the hour. The long hand shows minutes. Each number on the clock is 5 minutes when counting by fives.',
      },
      {
        heading: 'Elapsed time',
        body: 'To find how much time passed, count forward from the start time to the end time.',
      },
    ],
    examples: [
      { prompt: 'Analog clock shows 3:30', solution: '3:30' },
      { prompt: 'From 2:15 to 3:45', solution: '1 hour 30 minutes' },
    ],
    tryInPractice: { kind: 'operation', operation: 'clock' },
  },
  {
    id: 'shapes',
    title: 'Shapes',
    summary: 'Recognize shapes and colors, then continue repeating shape patterns.',
    sections: [
      {
        heading: 'Look at the outline',
        body: 'A circle is round with no corners. A square has four equal sides. A rectangle has four sides but two are longer. A triangle has three corners.',
      },
      {
        heading: 'Say the name',
        body: 'Point to the shape and say its name out loud. Stars and ovals are fun extras once you know the basics.',
      },
      {
        heading: 'Recognize colors',
        body: 'The same shape can appear in red, blue, green, or yellow. Look at its fill color separately from its outline.',
      },
      {
        heading: 'Find and count shapes',
        body: 'Look for the target color and shape, ignore the other shapes, and count only exact matches. Compare two groups to find which has more, or whether they are the same.',
      },
      {
        heading: 'Shape patterns',
        body: 'Shapes may repeat in a cycle. Find the repeating unit and continue it.',
      },
      {
        heading: 'Color and shape patterns',
        body: 'Track both properties at once. Red circle, blue square, red circle, blue square is followed by a red circle.',
      },
    ],
    examples: [
      { prompt: 'What shape is this? (round, no corners)', solution: 'Circle' },
      { prompt: 'What shape is this? (four equal sides)', solution: 'Square' },
      { prompt: 'What color is the blue triangle?', solution: 'Blue' },
      { prompt: '○ △ ○ △ ?', solution: '○' },
      { prompt: 'Red circle, blue square, red circle, blue square, ?', solution: 'Red circle' },
    ],
    tryInPractice: { kind: 'operation', operation: 'shape_recognition' },
  },
  {
    id: 'numbers',
    title: 'Numbers',
    summary: 'Understand number order, missing values, and odd and even numbers.',
    sections: [
      { heading: 'Before and after', body: 'The number before is one less. The number after is one more.' },
      { heading: 'Odd and even', body: 'Even numbers can be arranged in pairs with none left over. Odd numbers have one left over.' },
    ],
    examples: [
      { prompt: 'What comes after 6?', solution: '7' },
      { prompt: '1, 2, ?, 4', solution: '3' },
      { prompt: 'Is 8 odd or even?', solution: 'Even' },
    ],
    tryInPractice: { kind: 'operation', operation: 'number_sense' },
  },
  {
    id: 'patterns',
    title: 'Patterns & sequences',
    summary: 'Find the rule and continue number patterns and sequences.',
    sections: [
      {
        heading: 'Number patterns',
        body: 'Look for what changes each step — adding the same amount, multiplying, skip counting, or alternating rules.',
      },
    ],
    examples: [
      { prompt: '2, 5, 8, 11, ?', solution: '14' },
    ],
    tryInPractice: { kind: 'operation', operation: 'pattern' },
  },
  {
    id: 'differentiation',
    title: 'Differentiation',
    summary: 'Find the rate of change — the derivative of a simple expression.',
    sections: [
      {
        heading: 'What is a derivative?',
        body: 'The derivative tells you how fast something changes. For a curve, it is the slope of the tangent line at a point. At this level we focus on symbolic rules, not graphs.',
      },
      {
        heading: 'Power rule',
        body: "For x raised to a power: bring the exponent down as a multiplier, then subtract 1 from the exponent. Example: (x³)' = 3x².",
      },
      {
        heading: 'Constants',
        body: "The derivative of a plain number (no x) is zero, because it does not change. Example: (5)' = 0.",
      },
      {
        heading: 'Sums',
        body: "Differentiate each term separately and add the results. Example: (x² + 3x)' = 2x + 3.",
      },
      {
        heading: 'Natural log',
        body: "The derivative of ln x is 1/x. Example: (ln x)' = 1/x. This connects to the special constant e and to integration of 1/x.",
      },
      {
        heading: 'Trigonometric functions',
        body: "(sin x)' = cos x and (cos x)' = −sin x. With a constant multiplier: (3 sin x)' = 3 cos x.",
      },
      {
        heading: 'Quotient rule (division rule)',
        body: "Use when differentiating a ratio of two functions f(x)/g(x). The rule is (f/g)' = (f'g − fg') / g² — “Low d-High minus High d-Low, over Low squared,” where Low is the denominator and High is the numerator. Example: for 2x/(x + 3), f = 2x, g = x + 3, so (2·(x + 3) − 2x·1)/(x + 3)² = 6/(x + 3)².",
      },
      {
        heading: 'Same idea, different notation',
        body: "Practice questions use prime notation: (expression)' = ?. Textbooks often write d/dx(expression) instead — for example, d/dx(x³) = 3x² means the same as (x³)' = 3x².",
      },
    ],
    formulaTables: buildDifferentiationFormulaTables(),
    examples: [
      { prompt: "(x²)' = ?", solution: '2x' },
      { prompt: "(x³)' = ?", solution: '3x²' },
      { prompt: "(ln x)' = ?", solution: '1/x' },
      { prompt: "(sin x)' = ?", solution: 'cos x' },
      { prompt: "(cos x)' = ?", solution: '−sin x' },
      { prompt: "(2x/(x + 3))' = ?", solution: '6/(x + 3)²' },
      { prompt: "(5)' = ?", solution: '0' },
      { prompt: "(x² + 4x)' = ?", solution: '2x + 4' },
    ],
    tryInPractice: { kind: 'operation', operation: 'differentiation' },
  },
  {
    id: 'integration',
    title: 'Integration',
    summary: 'Reverse differentiation — find an antiderivative and remember + C.',
    sections: [
      {
        heading: 'What is an integral?',
        body: 'Integration is the opposite of differentiation. An indefinite integral finds a function whose derivative is the expression inside. Because many functions differ only by a constant, we always add + C (the constant of integration).',
      },
      {
        heading: 'Power rule',
        body: 'Add 1 to the exponent, divide by the new exponent, then add + C. Example: ∫x² dx = x³/3 + C. This rule does not apply when the exponent is −1.',
      },
      {
        heading: 'Integrating 1/x',
        body: 'When the exponent is −1, the integral is a logarithm: ∫(1/x) dx = ln|x| + C. At this level we often write ln x + C for x > 0.',
      },
      {
        heading: 'Trigonometric functions',
        body: '∫ sin x dx = −cos x + C and ∫ cos x dx = sin x + C. A constant multiplier stays in front: ∫ 3 sin x dx = −3 cos x + C.',
      },
      {
        heading: 'Simplify fractions',
        body: 'Integration has no quotient rule like differentiation. When the integrand is a fraction of powers of x, simplify the fraction first, then use the power rule. Example: ∫(x³/x) dx = ∫ x² dx = x³/3 + C.',
      },
      {
        heading: 'Constants',
        body: 'The integral of a constant k with respect to x is kx + C. Example: ∫5 dx = 5x + C.',
      },
      {
        heading: 'Sums',
        body: 'Integrate each term and combine. Example: ∫(x² + 2x) dx = x³/3 + x² + C.',
      },
    ],
    formula: '∫xⁿ dx = xⁿ⁺¹/(n+1) + C  (n ≠ −1)',
    examples: [
      { prompt: '∫x² dx = ?', solution: 'x³/3 + C' },
      { prompt: '∫(1/x) dx = ?', solution: 'ln x + C' },
      { prompt: '∫ sin x dx = ?', solution: '−cos x + C' },
      { prompt: '∫ cos x dx = ?', solution: 'sin x + C' },
      { prompt: '∫(x³/x) dx = ?', solution: 'x³/3 + C' },
      { prompt: '∫x dx = ?', solution: 'x²/2 + C' },
      { prompt: '∫4 dx = ?', solution: '4x + C' },
      { prompt: '∫2x² dx = ?', solution: '2x³/3 + C' },
    ],
    tryInPractice: { kind: 'operation', operation: 'integration' },
  },
];

const LEARN_TOPICS_BY_ID = new Map(
  LEARN_TOPICS_UNSORTED.map((topic) => [topic.id, topic] as const),
);

export const LEARN_TOPICS: LearnTutorial[] = LEARN_TOPIC_ORDER.map((id) => {
  const topic = LEARN_TOPICS_BY_ID.get(id);
  if (!topic) throw new Error(`Missing Learn content for curriculum section: ${id}`);
  return { ...topic, ...getLearnContext(id, 'en') };
});

export function getLearnTopics(locale: SupportedLocale): LearnTutorial[] {
  return LEARN_TOPICS.map((topic) => placeLearnExamples(applyLearnLocale(topic, locale), locale));
}

export function getLearnTopic(id: string, locale: SupportedLocale = 'en'): LearnTutorial | undefined {
  const topic = LEARN_TOPICS.find((t) => t.id === id);
  return topic ? placeLearnExamples(applyLearnLocale(topic, locale), locale) : undefined;
}

export function getAllLearnTopicIds(): LearnTopicId[] {
  return LEARN_TOPICS.map((t) => t.id);
}
