import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync, writeAsStringAsync } from 'expo-file-system/legacy';
import { exportLearningPlanFile, pickAndParseLearningPlanFile, shareLearningPlanAttachment } from '../learningPlanShare.service';
import { buildLearningPlanExportPayload, serializeLearningPlanExport, parseLearningPlanImport } from '../learningPlanExport.utils';
import { getRecommendedLearningPlan } from '../recommendedLearningPlan';

jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-file-system/legacy', () => ({ cacheDirectory: 'file:///cache/', EncodingType: { UTF8: 'utf8' }, readAsStringAsync: jest.fn(), writeAsStringAsync: jest.fn() }));

describe('sharing settings attachments', () => {
  beforeEach(() => { jest.resetAllMocks(); jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true); });
  it('writes valid JSON before sharing', async () => {
    expect(await exportLearningPlanFile(getRecommendedLearningPlan(10), 'My plan')).toEqual({ ok: true });
    const [uri, data, options] = jest.mocked(writeAsStringAsync).mock.calls[0];
    expect(uri).toBe('file:///cache/therealmath-my-plan.json');
    expect(options).toEqual({ encoding: 'utf8' });
    expect(parseLearningPlanImport(data).ok).toBe(true);
  });
  it('imports settings files through the picker', async () => {
    const payload = buildLearningPlanExportPayload(getRecommendedLearningPlan(10), 'My plan');
    const bytes = serializeLearningPlanExport(payload);
    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///picked', name: 'settings.json', size: bytes.length, lastModified: 0 }] });
    jest.mocked(readAsStringAsync).mockResolvedValue(bytes);
    expect(await pickAndParseLearningPlanFile()).toEqual(expect.objectContaining({ ok: true, parsed: expect.objectContaining({ label: 'My plan' }) }));
  });
  it('recognizes JSON contents with a generic filename', async () => {
    const bytes = serializeLearningPlanExport(buildLearningPlanExportPayload(getRecommendedLearningPlan(10)));
    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///picked', name: 'download', size: bytes.length, lastModified: 0 }] });
    jest.mocked(readAsStringAsync).mockResolvedValue(bytes);
    expect((await pickAndParseLearningPlanFile()).ok).toBe(true);
  });
  it('reports write failures without opening the share sheet', async () => {
    jest.mocked(writeAsStringAsync).mockRejectedValue(new Error('Disk full'));
    expect(await exportLearningPlanFile(getRecommendedLearningPlan(10), 'Plan')).toEqual({ ok: false, reason: 'write_failed', details: 'Error: Disk full' });
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });
  it('handles picker cancellation', async () => {
    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({ canceled: true, assets: null });
    expect(await pickAndParseLearningPlanFile()).toEqual({ ok: false, reason: 'cancelled' });
    expect(readAsStringAsync).not.toHaveBeenCalled();
  });
  it('shares JSON files with JSON metadata', async () => {
    expect(await shareLearningPlanAttachment('file:///settings.json')).toEqual({ ok: true });
    expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///settings.json', expect.objectContaining({ mimeType: 'application/json', UTI: 'public.json' }));
  });
  it('preserves sharing error codes instead of treating failures as cancellation', async () => {
    jest.mocked(Sharing.shareAsync).mockRejectedValue(Object.assign(new Error('Unable to share'), { code: 'ERR_SHARING' }));
    expect(await shareLearningPlanAttachment('file:///settings.json')).toEqual({ ok: false, reason: 'share_failed', details: 'ERR_SHARING: Unable to share' });
  });
  it('handles unavailable sharing and errors checking availability', async () => {
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(false);
    expect(await shareLearningPlanAttachment('file:///settings.json')).toEqual({ ok: false, reason: 'share_unavailable' });
    jest.mocked(Sharing.isAvailableAsync).mockRejectedValue(new Error('Native error'));
    expect(await shareLearningPlanAttachment('file:///settings.json')).toEqual({ ok: false, reason: 'share_failed', details: 'Error: Native error' });
  });
});
