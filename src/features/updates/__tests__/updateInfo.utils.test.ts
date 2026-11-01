import { getUpdateMessageFromManifest } from '@/features/updates/updateInfo.utils';

describe('getUpdateMessageFromManifest', () => {
  it('reads message from manifest metadata', () => {
    expect(
      getUpdateMessageFromManifest({
        metadata: { message: 'Fix rounding distractors' },
      }),
    ).toBe('Fix rounding distractors');
  });

  it('reads message from expoClient extra', () => {
    expect(
      getUpdateMessageFromManifest({
        extra: {
          expoClient: {
            name: 'The Real Math',
            slug: 'the-real-math',
            extra: { message: 'QA build for testers' },
          },
        },
      }),
    ).toBe('QA build for testers');
  });

  it('returns null when no message is present', () => {
    expect(getUpdateMessageFromManifest({ metadata: {}, extra: {} })).toBeNull();
    expect(getUpdateMessageFromManifest(undefined)).toBeNull();
  });
});
