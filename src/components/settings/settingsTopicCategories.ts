export const SETTINGS_TOPIC_CATEGORY_IDS = [
  'foundations',
  'operations',
  'advanced',
  'calculus',
] as const;

export type SettingsTopicCategoryId =
  (typeof SETTINGS_TOPIC_CATEGORY_IDS)[number];

export type SettingsTopicCategory = {
  id: SettingsTopicCategoryId;
  titleKey: string;
  descriptionKey: string;
  operations: readonly string[];
};

export const SETTINGS_TOPIC_CATEGORIES: readonly SettingsTopicCategory[] = [
  {
    id: 'foundations',
    titleKey: 'settings:foundationsTopics',
    descriptionKey: 'settings:foundationsTopicsHint',
    operations: [
      'shape_recognition',
      'number_sense',
      'pattern',
      'clock',
      'fraction_visual',
    ],
  },
  {
    id: 'operations',
    titleKey: 'settings:operationsTopics',
    descriptionKey: 'settings:operationsTopicsHint',
    operations: [
      'addition',
      'subtraction',
      'multiplication',
      'division',
      'comparison',
      'rounding',
      'square',
      'square_root',
      'order_of_operations',
    ],
  },
  {
    id: 'advanced',
    titleKey: 'settings:advancedTopicsGroup',
    descriptionKey: 'settings:advancedTopicsGroupHint',
    operations: [
      'equivalent_expressions',
      'geometry',
      'equation_two_unknowns',
      'advanced_equations',
      'trigonometry',
      'logarithm',
    ],
  },
  {
    id: 'calculus',
    titleKey: 'settings:calculusTopics',
    descriptionKey: 'settings:calculusTopicsHint',
    operations: ['limits', 'differentiation', 'integration'],
  },
];

export function getSettingsTopicCategory(
  raw: string | string[] | undefined,
): SettingsTopicCategory | null {
  const id = Array.isArray(raw) ? raw[0] : raw;
  return SETTINGS_TOPIC_CATEGORIES.find((category) => category.id === id) ?? null;
}
