import { buildWordProblemText } from '@/features/questions/wordProblemTemplates';
import {
  SIGNED_WORD_PROBLEM_TEMPLATES_MK,
  WORD_PROBLEM_TEMPLATES_MK,
} from '@/i18n/content/wordProblems/mk';

describe('signed word-problem templates', () => {
  it.each([
    ['addition', -3, -4, -7],
    ['subtraction', -3, -4, 1],
    ['multiplication', -7, -1, 7],
    ['division', 7, -1, -7],
  ] as const)('uses a meaningful signed context for %s', (operation, a, b, result) => {
    const text = buildWordProblemText(operation, a, b, result, 'en');

    expect(text).toMatch(/temperature|elevator|change|penalty/i);
    expect(text).not.toMatch(/apples|bags|friends|pencils|cookies|birds/i);
  });

  it('uses localized signed contexts in Macedonian', () => {
    const text = buildWordProblemText('multiplication', -7, -1, 7, 'mk');

    expect(text).toContain('Казна');
    expect(text).not.toContain('јаболка');
  });

  it('uses a natural loss scenario when signed division has a negative result', () => {
    const english = buildWordProblemText('division', 4, -2, -2, 'en');
    const macedonian = buildWordProblemText('division', 4, -2, -2, 'mk');

    expect(english).toBe(
      'A player lost 4 points over 2 rounds. What was the average score change per round?',
    );
    expect(macedonian).toBe(
      'Играч изгубил вкупно 4 поени во 2 рунди. Колкава е просечната промена на резултатот по рунда?',
    );
  });

  it('uses a natural gain scenario when signed division has a positive result', () => {
    expect(buildWordProblemText('division', -4, -2, 2, 'mk')).toBe(
      'Играч освоил вкупно 4 поени во 2 рунди. Колку поени освоил во просек по рунда?',
    );
  });

  it('uses only Cyrillic letters in Macedonian word-problem text', () => {
    for (const templatesByOperation of [
      WORD_PROBLEM_TEMPLATES_MK,
      SIGNED_WORD_PROBLEM_TEMPLATES_MK,
    ]) {
      for (const templates of Object.values(templatesByOperation)) {
        for (const template of templates ?? []) {
          expect(template(-7, -2, 14)).not.toMatch(/[A-Za-z]/);
        }
      }
    }
  });

  it('uses a short loss scenario when exactly one multiplication factor is negative', () => {
    const text = buildWordProblemText('multiplication', -6, 8, -48, 'en');

    expect(text).toBe(
      'A player loses 6 points in each of 8 rounds. What is the total score change?',
    );
  });

  it('keeps ordinary quantity stories for non-negative values', () => {
    const text = buildWordProblemText('multiplication', 7, 3, 21, 'en');

    expect(text).toMatch(/bag|row|pack/);
  });
});
