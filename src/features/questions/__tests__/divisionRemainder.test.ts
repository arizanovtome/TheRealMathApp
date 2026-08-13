import {
  buildRemainderMcOptions,
  formatQuotientRemainder,
  parseQuotientRemainderString,
  quotientRemainderEquals,
} from '@/features/questions/divisionRemainder';
import { submittedAnswerIsCorrect } from '@/features/questions/questionScoring';
import type { MathQuestion } from '@/features/questions/question.types';

describe('divisionRemainder', () => {
  it('formats and parses quotient remainder strings', () => {
    expect(formatQuotientRemainder(3, 2)).toBe('3 R 2');
    expect(parseQuotientRemainderString('3 R 2')).toEqual({ quotient: 3, remainder: 2 });
    expect(parseQuotientRemainderString('3r2')).toEqual({ quotient: 3, remainder: 2 });
  });

  it('parses negative quotients with positive remainders', () => {
    expect(parseQuotientRemainderString('-7 R 2')).toEqual({ quotient: -7, remainder: 2 });
    expect(parseQuotientRemainderString('-7 R 1')).toEqual({ quotient: -7, remainder: 1 });
    expect(parseQuotientRemainderString('-7r2')).toEqual({ quotient: -7, remainder: 2 });
  });

  it('rejects invalid remainder strings', () => {
    expect(parseQuotientRemainderString('-7 R -1')).toBeNull();
    expect(parseQuotientRemainderString('abc')).toBeNull();
  });

  it('compares quotient remainders', () => {
    expect(quotientRemainderEquals({ quotient: 3, remainder: 2 }, { quotient: 3, remainder: 2 })).toBe(
      true,
    );
    expect(quotientRemainderEquals({ quotient: 3, remainder: 2 }, { quotient: 4, remainder: 2 })).toBe(
      false,
    );
    expect(quotientRemainderEquals({ quotient: -7, remainder: 1 }, { quotient: -7, remainder: 1 })).toBe(
      true,
    );
  });

  it('builds MC options including the correct answer', () => {
    const opts = buildRemainderMcOptions({ quotient: 3, remainder: 2 }, 4);
    expect(opts).toHaveLength(4);
    expect(opts).toContain('3 R 2');
  });

  it('builds MC options for negative quotients', () => {
    const opts = buildRemainderMcOptions({ quotient: -7, remainder: 2 }, 4);
    expect(opts).toHaveLength(4);
    expect(opts).toContain('-7 R 2');
    expect(opts.every((o) => parseQuotientRemainderString(o) !== null)).toBe(true);
  });

  it('scores negative quotient remainder answers from multiple choice', () => {
    const q: MathQuestion = {
      kind: 'arithmetic',
      id: 'div-rem-1',
      operation: 'division',
      questionStyle: 'standard',
      answerKind: 'quotient_remainder',
      questionText: '-55 ÷ 8 = ? remainder ?',
      correctAnswer: -7,
      quotientRemainder: { quotient: -7, remainder: 1 },
      answerOptions: ['-6 R 1', '-7 R 1', '-7 R 0', '0 R 1'],
    };

    expect(submittedAnswerIsCorrect(q, '-7 R 1')).toBe(true);
    expect(submittedAnswerIsCorrect(q, '-6 R 1')).toBe(false);
  });

  it('scores remainder answers when divisor is negative', () => {
    const q: MathQuestion = {
      kind: 'arithmetic',
      id: 'div-rem-2',
      operation: 'division',
      questionStyle: 'standard',
      answerKind: 'quotient_remainder',
      questionText: '58 ÷ -8 = ? remainder ?',
      correctAnswer: -7,
      quotientRemainder: { quotient: -7, remainder: 2 },
      answerOptions: ['-6 R 2', '-7 R 2', '-7 R 1', '0 R 2'],
    };

    expect(submittedAnswerIsCorrect(q, '-7 R 2')).toBe(true);
    expect(submittedAnswerIsCorrect(q, '-7 R 1')).toBe(false);
  });
});
