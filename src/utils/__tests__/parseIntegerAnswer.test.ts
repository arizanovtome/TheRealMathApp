import { parseIntegerAnswer, parseNumberAnswer } from '@/utils/parseIntegerAnswer';

describe('parseIntegerAnswer', () => {
  it('parses integers with optional sign', () => {
    expect(parseIntegerAnswer('42')).toBe(42);
    expect(parseIntegerAnswer('-7')).toBe(-7);
    expect(parseIntegerAnswer('+12')).toBe(12);
    expect(parseIntegerAnswer(' \t-3\n')).toBe(-3);
  });

  it('accepts unicode minus', () => {
    expect(parseIntegerAnswer('\u221212')).toBe(-12);
  });

  it('returns null for empty or partial input', () => {
    expect(parseIntegerAnswer('')).toBe(null);
    expect(parseIntegerAnswer('   ')).toBe(null);
    expect(parseIntegerAnswer('-')).toBe(null);
    expect(parseIntegerAnswer('+')).toBe(null);
  });

  it('returns null for decimals or letters', () => {
    expect(parseIntegerAnswer('3.5')).toBe(null);
    expect(parseIntegerAnswer('12a')).toBe(null);
  });
});

describe('parseNumberAnswer', () => {
  it('accepts integers and decimals', () => {
    expect(parseNumberAnswer('42')).toBe(42);
    expect(parseNumberAnswer('-7.5')).toBe(-7.5);
    expect(parseNumberAnswer('+0.25')).toBe(0.25);
    expect(parseNumberAnswer('.5')).toBe(0.5);
    expect(parseNumberAnswer('\u221212.25')).toBe(-12.25);
  });

  it('rejects incomplete or invalid numbers', () => {
    expect(parseNumberAnswer('')).toBe(null);
    expect(parseNumberAnswer('.')).toBe(null);
    expect(parseNumberAnswer('-')).toBe(null);
    expect(parseNumberAnswer('12a')).toBe(null);
  });
});
