import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import type {
  TrigonometryConfig,
  TrigonometryQuestionSubtype,
} from '@/features/trigonometry/trigonometry.types';
import { DEFAULT_TRIGONOMETRY_CONFIG } from '@/features/trigonometry/trigonometry.types';

export function normalizeTrigonometryConfig(raw: unknown): TrigonometryConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_TRIGONOMETRY_CONFIG };
  const r = raw as Record<string, unknown>;
  const ratiosRaw =
    r.ratios && typeof r.ratios === 'object'
      ? (r.ratios as Record<string, unknown>)
      : {};
  const kindsRaw =
    r.questionKinds && typeof r.questionKinds === 'object'
      ? (r.questionKinds as Record<string, unknown>)
      : {};
  return {
    enabled: r.enabled === true,
    ratios: {
      sin: ratiosRaw.sin !== false,
      cos: ratiosRaw.cos !== false,
      tan: ratiosRaw.tan === true,
      cot: ratiosRaw.cot === true,
    },
    questionKinds: {
      pickFormula: kindsRaw.pickFormula !== false,
      nameSide: kindsRaw.nameSide !== false,
      findAngle: kindsRaw.findAngle !== false,
    },
  };
}

export function getEnabledTrigonometrySubtypes(
  config: TrigonometryConfig,
): TrigonometryQuestionSubtype[] {
  if (!config.enabled) return [];
  const out: TrigonometryQuestionSubtype[] = [];
  if (config.questionKinds.pickFormula) out.push('pick_formula');
  if (config.questionKinds.nameSide) out.push('name_side');
  return out;
}

export function hasTrigonometrySource(config: MathLearningConfig): boolean {
  const subtypes = getEnabledTrigonometrySubtypes(config.trigonometry);
  if (subtypes.length === 0) return false;
  if (subtypes.includes('pick_formula')) {
    const { sin, cos, tan, cot } = config.trigonometry.ratios;
    if (sin || cos || tan || cot) return true;
  }
  return subtypes.includes('name_side');
}
