import { Platform, type TextInputProps } from 'react-native';

import {
  FRACTION_ANSWER_MAX_LENGTH,
  NUMERIC_ANSWER_MAX_LENGTH,
} from '@/constants/inputLimits';

export type AnswerInputKind = 'fraction' | 'numeric' | 'equation';

export function maxLengthForAnswerInputKind(kind: AnswerInputKind): number {
  switch (kind) {
    case 'fraction':
      return FRACTION_ANSWER_MAX_LENGTH;
    case 'equation':
    case 'numeric':
      return NUMERIC_ANSWER_MAX_LENGTH;
  }
}

/** Keyboard props for typed math answers. Fractions need `/` and `.` — not the plain number pad. */
export function answerInputKeyboardProps(
  kind: AnswerInputKind,
  platform: typeof Platform.OS = Platform.OS,
): Pick<TextInputProps, 'keyboardType' | 'inputMode'> {
  switch (kind) {
    case 'fraction':
      // `text` keeps the punctuation keyboard (/ and .). Input is sanitized to digits, /, and . only.
      return { keyboardType: 'numbers-and-punctuation', inputMode: 'text' };
    case 'equation':
      return { keyboardType: 'numbers-and-punctuation', inputMode: 'text' };
    case 'numeric':
      // Android `numeric` includes signed + decimal flags. Its `decimal-pad` omits `-`.
      // iOS has no signed number pad, so use its compact punctuation keyboard.
      return platform === 'ios'
        ? { keyboardType: 'numbers-and-punctuation', inputMode: 'text' }
        : { keyboardType: 'numeric' };
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
  return result.slice(0, FRACTION_ANSWER_MAX_LENGTH);
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
  return result.slice(0, NUMERIC_ANSWER_MAX_LENGTH);
}

export function sanitizeAnswerInput(raw: string, kind: AnswerInputKind): string {
  switch (kind) {
    case 'fraction':
      return sanitizeFractionAnswerInput(raw);
    case 'numeric':
      return sanitizeDecimalAnswerInput(raw);
    case 'equation':
      return raw.slice(0, NUMERIC_ANSWER_MAX_LENGTH);
  }
}
