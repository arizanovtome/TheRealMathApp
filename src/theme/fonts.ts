import { Platform } from 'react-native';

/**
 * Chalkboard feel for headings only.
 * Math lines use a separate face so Unicode − × ÷ render clearly (Chalkboard SE looks rough on those).
 */
export const fonts = {
  chalkTitle: Platform.select({
    ios: 'Chalkboard SE',
    android: undefined,
    default: undefined,
  }),
  /** Question text + numeric answers: strong glyph coverage for operators. */
  math: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif-medium',
    default: undefined,
  }),
} as const;
