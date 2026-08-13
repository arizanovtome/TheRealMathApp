import type { MathLearningConfig, NumberSenseConfig } from '@/features/learning-plan/learningPlan.types';

export function hasNumberSenseSource(config: MathLearningConfig): boolean {
  const n = config.numberSense;
  const numeric = n.enabled && (n.beforeAfter || n.missingNumber || n.oddEven);
  const visual = config.shapeRecognition.enabled && (n.countObjects || n.compareQuantities);
  return numeric || visual;
}

export function normalizeNumberSenseConfig(raw: unknown): NumberSenseConfig {
  const r = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const maxNumber = [5, 10, 20, 100].includes(Number(r.maxNumber)) ? Number(r.maxNumber) as 5 | 10 | 20 | 100 : 10;
  return {
    enabled: r.enabled === true,
    numberRecognition: r.numberRecognition !== false,
    countObjects: r.countObjects !== false,
    beforeAfter: r.beforeAfter !== false,
    missingNumber: r.missingNumber !== false,
    compareQuantities: r.compareQuantities !== false,
    oddEven: r.oddEven === true,
    maxNumber,
  };
}
