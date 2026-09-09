import Constants from 'expo-constants';

import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import {
  LEARNING_PLAN_EXPORT_KIND,
  LEARNING_PLAN_EXPORT_VERSION,
  LEARNING_PLAN_IMPORT_MAX_BYTES,
  type LearningPlanExportPayload,
  type LearningPlanImportResult,
} from '@/features/learning-plan/learningPlanExport.types';
import {
  ensureLearningConfigShape,
  validateLearningConfig,
} from '@/features/learning-plan/learningPlan.utils';

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function slugifyExportFileName(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug.length > 0 ? slug : 'plan';
}

export function buildLearningPlanExportPayload(
  config: MathLearningConfig,
  label?: string | null,
): LearningPlanExportPayload {
  return {
    kind: LEARNING_PLAN_EXPORT_KIND,
    version: LEARNING_PLAN_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: Constants.expoConfig?.version ?? null,
    label: readString(label ?? null),
    learningConfig: ensureLearningConfigShape(config),
  };
}

export function serializeLearningPlanExport(payload: LearningPlanExportPayload): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function parseLearningPlanImport(
  raw: string,
  maxBytes: number = LEARNING_PLAN_IMPORT_MAX_BYTES,
): LearningPlanImportResult {
  if (raw.length > maxBytes) {
    return { ok: false, error: 'too_large' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'invalid_json' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'invalid_json' };
  }

  const record = parsed as Record<string, unknown>;
  if (record.kind !== LEARNING_PLAN_EXPORT_KIND) {
    return { ok: false, error: 'wrong_kind' };
  }

  if (record.version !== LEARNING_PLAN_EXPORT_VERSION) {
    return { ok: false, error: 'unsupported_version' };
  }

  if (!record.learningConfig || typeof record.learningConfig !== 'object') {
    return { ok: false, error: 'missing_config' };
  }

  const config = ensureLearningConfigShape(record.learningConfig as MathLearningConfig);
  const validation = validateLearningConfig(config, { requireQuestionSource: false });
  if (!validation.valid) {
    return { ok: false, error: 'invalid_config' };
  }

  return {
    ok: true,
    config,
    label: readString(record.label),
  };
}
