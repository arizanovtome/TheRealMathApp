import type { TextInputProps } from 'react-native';

export type AnswerInputKind = 'fraction' | 'numeric' | 'equation';

/** Keyboard props for typed math answers. Fractions need `/` and `.` — not the plain number pad. */
export function answerInputKeyboardProps(
  kind: AnswerInputKind,
): Pick<TextInputProps, 'keyboardType' | 'inputMode'> {
  switch (kind) {
    case 'fraction':
      // `text` keeps the punctuation keyboard (/ and .). Input is sanitized to digits, /, and . only.
      return { keyboardType: 'numbers-and-punctuation', inputMode: 'text' };
    case 'equation':
      return { keyboardType: 'numbers-and-punctuation', inputMode: 'text' };
    case 'numeric':
      return { keyboardType: 'decimal-pad', inputMode: 'decimal' };
  }
}

/** Keeps only digits, `.`, `/`, and an optional leading minus (for fraction answers). */
export function sanitizeFractionAnswerInput(raw: string): string {
  let result = '';
  let hasSlash = false;
  let hasDot = false;

  for (const ch of raw.replace(/\u2212/g, '-')) {
    if (ch >= '0' && ch <= '9') {
      result += ch;
      continue;
    }
    if (ch === '-' && result.length === 0) {
      result += ch;
      continue;
    }
    if (ch === '/' && !hasSlash && !hasDot) {
      hasSlash = true;
      result += ch;
      continue;
    }
    if ((ch === '.' || ch === ',') && !hasDot && !hasSlash) {
      hasDot = true;
      result += '.';
      continue;
    }
  }
  return result;
}

/** Keeps only digits, `.`, and an optional leading minus (for numeric answers). */
export function sanitizeDecimalAnswerInput(raw: string): string {
  let result = '';
  let hasDot = false;

  for (const ch of raw.replace(/\u2212/g, '-')) {
    if (ch >= '0' && ch <= '9') {
      result += ch;
      continue;
    }
    if (ch === '-' && result.length === 0) {
      result += ch;
      continue;
    }
    if ((ch === '.' || ch === ',') && !hasDot) {
      hasDot = true;
      result += '.';
      continue;
    }
  }
  return result;
}

export function sanitizeAnswerInput(raw: string, kind: AnswerInputKind): string {
  switch (kind) {
    case 'fraction':
      return sanitizeFractionAnswerInput(raw);
    case 'numeric':
      return sanitizeDecimalAnswerInput(raw);
    case 'equation':
      return raw;
  }
}
