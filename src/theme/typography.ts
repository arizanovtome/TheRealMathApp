import type { TextStyle } from 'react-native';

import { fonts } from '@/theme/fonts';

export const typography = {
  title: {
    fontSize: 30,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.3,
    ...(fonts.chalkTitle ? { fontFamily: fonts.chalkTitle } : {}),
  },
  subtitle: {
    fontSize: 21,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 18,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 26,
    letterSpacing: 0.15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.4,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  question: {
    fontSize: 38,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
    ...(fonts.math ? { fontFamily: fonts.math } : {}),
  },
} as const;
