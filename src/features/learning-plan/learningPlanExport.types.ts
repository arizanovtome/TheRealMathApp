import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';

export const LEARNING_PLAN_EXPORT_KIND = 'therealmath-learning-plan' as const;
export const LEARNING_PLAN_EXPORT_VERSION = 1 as const;
export const LEARNING_PLAN_IMPORT_MAX_BYTES = 256 * 1024;

export type LearningPlanExportPayload = {
  kind: typeof LEARNING_PLAN_EXPORT_KIND;
  version: typeof LEARNING_PLAN_EXPORT_VERSION;
  exportedAt: string;
  appVersion: string | null;
  label: string | null;
  learningConfig: MathLearningConfig;
};

export type LearningPlanImportError =
  | 'invalid_json'
  | 'too_large'
  | 'wrong_kind'
  | 'unsupported_version'
  | 'missing_config'
  | 'invalid_config';

export type LearningPlanImportResult =
  | { ok: true; config: MathLearningConfig; label: string | null }
  | { ok: false; error: LearningPlanImportError };
