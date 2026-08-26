import type { LearnTopicId, LearnTutorial } from '@/features/learn/learnTopics';
import type { SupportedLocale } from '@/i18n/types';

/** Section indexes for each topic-level example, in the example's existing order. */
const EN_EXAMPLE_SECTIONS: Record<LearnTopicId, number[]> = {
  shapes: [0, 0, 2, 4, 5],
  numbers: [0, 0, 1],
  patterns: [0],
  clock: [0, 1],
  addition: [1, 1],
  subtraction: [0, 0],
  multiplication: [0, 0],
  division: [0, 1, 2],
  comparison: [0, 1, 2],
  rounding: [0],
  fractions: [1, 0],
  squaring: [0],
  square_roots: [0],
  geometry: [0, 0],
  order_of_operations: [0, 1, 1],
  equivalent_expressions: [2, 0, 1, 1, 3],
  equations_xy: [0],
  advanced_equations: [0, 1],
  trigonometry: [1, 1, 0],
  logarithm: [2, 0, 1, 2],
  limits: [],
  differentiation: [2, 2, 5, 6, 6, 7, 3, 4],
  integration: [2, 4, 6, 6, 5, 2, 1, 2],
};

const MK_EXAMPLE_SECTIONS: Record<LearnTopicId, number[]> = {
  ...EN_EXAMPLE_SECTIONS,
  shapes: [1],
  differentiation: [0, 1, 2, 3],
  integration: [0, 1, 2, 3],
};

/** Reorder conceptual sections from introductory to advanced before placing examples. */
const EN_SECTION_ORDER: Partial<Record<LearnTopicId, number[]>> = {
  equivalent_expressions: [1, 2, 0, 3],
  differentiation: [0, 7, 1, 2, 3, 4, 5, 6],
  integration: [0, 5, 1, 6, 2, 4, 3],
};

const MK_SECTION_ORDER: Partial<Record<LearnTopicId, number[]>> = {
  equivalent_expressions: [1, 2, 0, 3],
};

export function placeLearnExamples(topic: LearnTutorial, locale: SupportedLocale): LearnTutorial {
  const sectionOrder = (locale === 'mk' ? MK_SECTION_ORDER : EN_SECTION_ORDER)[topic.id];
  const orderedSections = sectionOrder
    ? sectionOrder.map((index) => topic.sections[index]).filter((section) => section !== undefined)
    : topic.sections;
  const sections = orderedSections.map((section) => ({ ...section, examples: undefined }));
  const placements = (locale === 'mk' ? MK_EXAMPLE_SECTIONS : EN_EXAMPLE_SECTIONS)[topic.id];

  topic.examples?.forEach((example, exampleIndex) => {
    const requestedIndex = placements[exampleIndex] ?? sections.length - 1;
    const sectionIndex = Math.max(0, Math.min(requestedIndex, sections.length - 1));
    const section = sections[sectionIndex];
    if (!section) return;
    section.examples = [...(section.examples ?? []), example];
  });

  return { ...topic, sections, examples: undefined };
}
