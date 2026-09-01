export const MATH_KNOWLEDGE_LEVELS = [1, 2, 3, 4, 5] as const;

export type MathKnowledgeLevel = (typeof MATH_KNOWLEDGE_LEVELS)[number];

export const DEFAULT_MATH_KNOWLEDGE_LEVEL: MathKnowledgeLevel = 3;

export function clampMathKnowledgeLevel(raw: unknown): MathKnowledgeLevel {
  const n = typeof raw === 'number' && Number.isFinite(raw) ? Math.round(raw) : DEFAULT_MATH_KNOWLEDGE_LEVEL;
  return Math.min(5, Math.max(1, n)) as MathKnowledgeLevel;
}

export const MATH_KNOWLEDGE_LABEL_KEYS = {
  1: 'settings:mathKnowledge1',
  2: 'settings:mathKnowledge2',
  3: 'settings:mathKnowledge3',
  4: 'settings:mathKnowledge4',
  5: 'settings:mathKnowledge5',
} as const satisfies Record<MathKnowledgeLevel, string>;
