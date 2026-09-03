import * as DocumentPicker from 'expo-document-picker';
import {
  cacheDirectory,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import {
  buildLearningPlanExportPayload,
  parseLearningPlanImport,
  serializeLearningPlanExport,
  slugifyExportFileName,
} from '@/features/learning-plan/learningPlanExport.utils';
import type { LearningPlanImportError, LearningPlanImportResult } from '@/features/learning-plan/learningPlanExport.types';

export type ShareLearningPlanResult =
  | { ok: true }
  | { ok: false; reason: 'no_config' | 'write_failed' | 'share_unavailable' | 'cancelled' };

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

  const payload = buildLearningPlanExportPayload(config, label);
  const fileName = `therealmath-${slugifyExportFileName(label)}.json`;
  const uri = `${cacheDirectory}${fileName}`;

  try {
    await writeAsStringAsync(uri, serializeLearningPlanExport(payload));
  } catch {
    return { ok: false, reason: 'write_failed' };
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    return { ok: false, reason: 'share_unavailable' };
  }

  try {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      dialogTitle: fileName,
      UTI: 'public.json',
    });
  } catch {
    return { ok: false, reason: 'cancelled' };
  }

  return { ok: true };
}

export async function pickAndParseLearningPlanFile(): Promise<PickLearningPlanFileResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    return { ok: false, reason: 'cancelled' };
  }

  const asset = result.assets[0];
  if (asset.size != null && asset.size > 256 * 1024) {
    return { ok: false, reason: 'too_large' };
  }

  let raw: string;
  try {
    raw = await readAsStringAsync(asset.uri);
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
