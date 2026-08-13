import type { TextProps } from 'react-native';
import { Text } from 'react-native';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

type Variant = 'title' | 'subtitle' | 'body' | 'label' | 'question';

type AppTextProps = TextProps & {
  variant?: Variant;
  muted?: boolean;
};

export function AppText({ variant = 'body', muted, style, ...rest }: AppTextProps) {
  const base = typography[variant];
  const color = muted ? colors.textMuted : colors.text;
  const shadowStyle =
    variant === 'question'
      ? {
          textShadowColor: 'rgba(255, 255, 255, 0.22)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }
      : {};
  return <Text accessibilityRole="text" style={[base, { color }, shadowStyle, style]} {...rest} />;
}
