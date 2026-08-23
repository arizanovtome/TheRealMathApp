import { logAnswersMatch, logAnswersEquivalentForMc } from '@/features/logarithm/logarithmFormat';

describe('logarithmFormat', () => {
  it('matches equivalent log answers', () => {
    expect(logAnswersMatch('log 4 + log 5', 'log 4 + log 5')).toBe(true);
    expect(logAnswersMatch('log 5 + log 9', 'log 9 + log 5')).toBe(true);
    expect(logAnswersMatch('log 20 − log 4', 'log 20 - log 4')).toBe(true);
    expect(logAnswersMatch('3 log x', '3 log x')).toBe(true);
    expect(logAnswersMatch('3 log x', '4 log x')).toBe(false);
    expect(logAnswersMatch('log 5 + log 9', 'log 45')).toBe(false);
  });

  it('detects equivalent forms that should not both appear as MC choices', () => {
    expect(logAnswersEquivalentForMc('log 5 + log 9', 'log 9 + log 5')).toBe(true);
    expect(logAnswersEquivalentForMc('log 5 + log 9', 'log 45')).toBe(true);
    expect(logAnswersEquivalentForMc('log 5 + log 9', '5 log 9')).toBe(false);
  });
});
