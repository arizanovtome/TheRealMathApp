import * as DocumentPicker from 'expo-document-picker';

import {
  cacheDirectory,
  EncodingType,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import {
  buildLearningPlanExportPayload,
  slugifyExportFileName,
  serializeLearningPlanExport,
  parseLearningPlanImport,
} from '@/features/learning-plan/learningPlanExport.utils';
import type { LearningPlanImportError, LearningPlanImportResult } from '@/features/learning-plan/learningPlanExport.types';
import { LEARNING_PLAN_IMPORT_MAX_BYTES } from '@/features/learning-plan/learningPlanExport.types';


export type ShareLearningPlanResult =
  | { ok: true }
  | { ok: false; reason: 'no_config' | 'write_failed' | 'share_unavailable' | 'share_failed' | 'cancelled'; details?: string };

export function shareErrorDetails(error: unknown): string {
  if (error instanceof Error) {
    const code = 'code' in error ? String(error.code) : error.name;
    return `${code}: ${error.message}`.slice(0, 1000);
  }
  return String(error).slice(0, 1000);
}

export async function shareLearningPlanAttachment(uri: string): Promise<ShareLearningPlanResult> {
  try {
    if (!(await Sharing.isAvailableAsync())) return { ok: false, reason: 'share_unavailable' };
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      dialogTitle: uri.split('/').pop(),
      UTI: 'public.json',
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: 'share_failed', details: shareErrorDetails(error) };
  }
}

export type PickLearningPlanFileResult =
  | { ok: true; fileName: string; parsed: Extract<LearningPlanImportResult, { ok: true }> }
  | { ok: false; reason: 'cancelled' | 'read_failed' | LearningPlanImportError };

export async function exportLearningPlanFile(
  config: MathLearningConfig,
  label: string,
): Promise<ShareLearningPlanResult> {
  if (!cacheDirectory) {
    return { ok: false, reason: 'write_failed' };
  }

  const fileName = `therealmath-${slugifyExportFileName(label)}.json`;
  const uri = `${cacheDirectory}${fileName}`;

  try {
    const payload = buildLearningPlanExportPayload(config, label);
    await writeAsStringAsync(uri, serializeLearningPlanExport(payload), { encoding: EncodingType.UTF8 });
  } catch (error) {
    return { ok: false, reason: 'write_failed', details: shareErrorDetails(error) };
  }

  return shareLearningPlanAttachment(uri);
}

export async function pickAndParseLearningPlanFile(): Promise<PickLearningPlanFileResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/*', 'application/octet-stream'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    return { ok: false, reason: 'cancelled' };
  }

  const asset = result.assets[0];
  if (asset.size != null && asset.size > LEARNING_PLAN_IMPORT_MAX_BYTES) {
    return { ok: false, reason: 'too_large' };
  }

  let raw: string;
  try {
    raw = await readAsStringAsync(asset.uri, { encoding: EncodingType.UTF8 });
  } catch {
    return { ok: false, reason: 'read_failed' };
  }

  const parsed = parseLearningPlanImport(raw);
  if (!parsed.ok) {
    return { ok: false, reason: parsed.error };
  }

  const fileName = asset.name?.trim() || 'plan.json';
  return { ok: true, fileName, parsed };
}
