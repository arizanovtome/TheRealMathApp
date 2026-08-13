import type { GeometryMeasure, GeometryShape } from '@/features/geometry/geometry.types';
import { buildGeometryFormulaTables } from '@/features/learn/geometryLearnContent';
import { buildTrigonometryFormulaTables } from '@/features/learn/trigonometryLearnContent';
import type { TrigonometryDiagram } from '@/features/trigonometry/trigonometry.types';
import type { LearnPracticeTarget } from '@/features/learn/learnPractice.utils';
import { LEARN_TOPIC_IDS_EASIEST_TO_HARDEST } from '@/constants/topicOrder';
import { applyLearnLocale } from '@/i18n/content/learn/overrides.mk';
import type { SupportedLocale } from '@/i18n/types';

export type LearnTopicId =
  (typeof LEARN_TOPIC_IDS_EASIEST_TO_HARDEST)[number];

export type LearnExample = {
  prompt: string;
  solution: string;
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
  sections: { heading: string; body: string }[];
  formula?: string;
  formulaTables?: LearnFormulaTable[];
  examples?: LearnExample[];
  /** When set, “Try in practice” opens focused, open-ended practice for this topic. */
  tryInPractice?: LearnPracticeTarget;
};

export const LEARN_TOPIC_ORDER: LearnTopicId[] = [...LEARN_TOPIC_IDS_EASIEST_TO_HARDEST];

const LEARN_TOPICS_UNSORTED: LearnTutorial[] = [
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
        body: 'Multiplication is a fast way to add the same number many times. 3 × 4 means three groups of four.',
      },
    ],
    examples: [
      { prompt: '3 × 4 = ?', solution: '12' },
      { prompt: '6 × 5 = ?', solution: '30' },
    ],
    tryInPractice: { kind: 'operation', operation: 'multiplication' },
  },
  {
    id: 'division',
    title: 'Division',
    summary: 'Sharing equally or finding how many groups.',
    sections: [
      {
        heading: 'What is division?',
        body: 'Division splits a total into equal parts. The answer can be how many in each group or how many groups.',
      },
    ],
    examples: [
      { prompt: '12 ÷ 3 = ?', solution: '4' },
      { prompt: '20 ÷ 4 = ?', solution: '5' },
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
    id: 'equations_x',
    title: 'Equations with x',
    summary: 'Find the hidden number that makes the equation true.',
    sections: [
      {
        heading: 'One unknown',
        body: 'x stands for a number you do not know yet. x + 3 = 8 means x = 5.',
      },
    ],
    examples: [{ prompt: 'x + 3 = 8', solution: 'x = 5' }],
    tryInPractice: { kind: 'equation_unknown' },
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
    formulaTables: buildGeometryFormulaTables(),
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
        heading: 'Same idea, different notation',
        body: "Practice questions use prime notation: (expression)' = ?. Textbooks often write d/dx(expression) instead — for example, d/dx(x³) = 3x² means the same as (x³)' = 3x².",
      },
    ],
    formula: "(xⁿ)' = n·xⁿ⁻¹",
    examples: [
      { prompt: "(x²)' = ?", solution: '2x' },
      { prompt: "(x³)' = ?", solution: '3x²' },
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
        body: 'Add 1 to the exponent, divide by the new exponent, then add + C. Example: ∫x² dx = x³/3 + C.',
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
      { prompt: '∫x dx = ?', solution: 'x²/2 + C' },
      { prompt: '∫4 dx = ?', solution: '4x + C' },
      { prompt: '∫2x² dx = ?', solution: '2x³/3 + C' },
    ],
    tryInPractice: { kind: 'operation', operation: 'integration' },
  },
];

export const LEARN_TOPICS: LearnTutorial[] = LEARN_TOPIC_ORDER.map(
  (id) => LEARN_TOPICS_UNSORTED.find((t) => t.id === id)!,
);

export function getLearnTopics(locale: SupportedLocale): LearnTutorial[] {
  return LEARN_TOPICS.map((topic) => applyLearnLocale(topic, locale));
}

export function getLearnTopic(id: string, locale: SupportedLocale = 'en'): LearnTutorial | undefined {
  const topic = LEARN_TOPICS.find((t) => t.id === id);
  return topic ? applyLearnLocale(topic, locale) : undefined;
}

export function getAllLearnTopicIds(): LearnTopicId[] {
  return LEARN_TOPICS.map((t) => t.id);
}
