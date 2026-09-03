import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import {
  buildLearningPlanExportPayload,
  parseLearningPlanImport,
  serializeLearningPlanExport,
  slugifyExportFileName,
} from '@/features/learning-plan/learningPlanExport.utils';
import { DEFAULT_GEOMETRY_CONFIG } from '@/features/geometry/geometry.types';
import type { MathLearningConfig } from '@/features/learning-plan/learningPlan.types';
import { ensureLearningConfigShape } from '@/features/learning-plan/learningPlan.utils';

function sampleConfig(): MathLearningConfig {
  return ensureLearningConfigShape({
    ...getRecommendedLearningPlan(10),
    geometry: DEFAULT_GEOMETRY_CONFIG,
  });
}

describe('learningPlanExport.utils', () => {
  it('builds a versioned export payload', () => {
    const config = sampleConfig();
    const payload = buildLearningPlanExportPayload(config, 'Grade 4 plan');

    expect(payload.kind).toBe('therealmath-learning-plan');
    expect(payload.version).toBe(1);
    expect(payload.label).toBe('Grade 4 plan');
    expect(payload.learningConfig.mode).toBe(config.mode);
  });

  it('round-trips through serialize and parse', () => {
    const config = sampleConfig();
    const raw = serializeLearningPlanExport(buildLearningPlanExportPayload(config, 'Share me'));
    const parsed = parseLearningPlanImport(raw);

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.label).toBe('Share me');
      expect(parsed.config.questionsCount).toBe(config.questionsCount);
    }
  });

  it('rejects files that are too large', () => {
    const result = parseLearningPlanImport('{"kind":"x"}', 4);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('too_large');
  });

  it('rejects unknown export kinds', () => {
    const raw = JSON.stringify({
      kind: 'other-app',
      version: 1,
      learningConfig: sampleConfig(),
    });
    const result = parseLearningPlanImport(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('wrong_kind');
  });

  it('slugifies export file names', () => {
    expect(slugifyExportFileName('Anna — Fractions')).toBe('anna-fractions');
    expect(slugifyExportFileName('   ')).toBe('plan');
  });
});
