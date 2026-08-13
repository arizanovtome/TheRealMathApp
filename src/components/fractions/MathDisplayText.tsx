import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Text as SvgText } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { tokenizeMathDisplayText, mathDisplayTextHasFractions } from '@/features/questions/mathDisplayTokens';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export type MathDisplaySize = 'question' | 'answer' | 'body' | 'sm';

type FractionSizeSpec = {
  fontSize: number;
  barHeight: number;
  barPad: number;
};

type FractionMetrics = {
  width: number;
  height: number;
  cx: number;
  numBaseline: number;
  barY: number;
  denBaseline: number;
  fontSize: number;
};

type StackedFractionProps = {
  numerator: number;
  denominator: number;
  size?: MathDisplaySize;
  muted?: boolean;
  selected?: boolean;
};

/** SVG layout — avoids RN Text ascender/descender quirks on iOS. */
function getFractionMetrics(spec: FractionSizeSpec, digits: number): FractionMetrics {
  const fontSize = spec.fontSize;
  const gap = spec.barPad;
  const bar = spec.barHeight;
  const slot = Math.round(fontSize * 0.82);
  const width = Math.max(Math.round(digits * fontSize * 0.58 + fontSize * 0.4), Math.round(fontSize * 1.15));
  const height = slot + gap + bar + gap + slot;
  const cx = width / 2;
  const numBaseline = slot - 1;
  const barY = slot + gap + bar / 2;
  const denBaseline = slot + gap + bar + gap + Math.round(fontSize * 0.78);

  return { width, height, cx, numBaseline, barY, denBaseline, fontSize };
}

export function StackedFraction({
  numerator,
  denominator,
  size = 'body',
  muted = false,
  selected = false,
}: StackedFractionProps) {
  const spec = SIZE_LAYOUT[size];
  const digitColor = selected ? colors.primary : muted ? colors.textMuted : colors.text;
  const digits = Math.max(String(numerator).length, String(denominator).length);
  const m = getFractionMetrics(spec, digits);
  const svgFont = fonts.math ? { fontFamily: fonts.math } : {};

  return (
    <View
      style={[styles.fraction, { width: m.width, height: m.height }]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Svg width={m.width} height={m.height} viewBox={`0 0 ${m.width} ${m.height}`}>
        <SvgText
          x={m.cx}
          y={m.numBaseline}
          fill={digitColor}
          fontSize={m.fontSize}
          fontWeight="700"
          textAnchor="middle"
          {...svgFont}
        >
          {numerator}
        </SvgText>
        <Line
          x1={1}
          y1={m.barY}
          x2={m.width - 1}
          y2={m.barY}
          stroke={digitColor}
          strokeWidth={spec.barHeight}
        />
        <SvgText
          x={m.cx}
          y={m.denBaseline}
          fill={digitColor}
          fontSize={m.fontSize}
          fontWeight="700"
          textAnchor="middle"
          {...svgFont}
        >
          {denominator}
        </SvgText>
      </Svg>
    </View>
  );
}

type MathDisplayTextProps = {
  text: string;
  size?: MathDisplaySize;
  muted?: boolean;
  selected?: boolean;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  textAlign?: 'left' | 'center';
};

/** Renders math strings with stacked fractions instead of slash notation. */
export function MathDisplayText({
  text,
  size = 'body',
  muted = false,
  selected = false,
  style,
  containerStyle,
  textAlign = 'center',
}: MathDisplayTextProps) {
  const spec = SIZE_SPECS[size];

  if (!mathDisplayTextHasFractions(text)) {
    return (
      <AppText
        variant={spec.textVariant}
        muted={muted}
        style={[
          spec.plainText,
          spec.plainFont,
          textAlign === 'center' && styles.textCenter,
          style,
        ]}
      >
        {text}
      </AppText>
    );
  }

  const tokens = tokenizeMathDisplayText(text);
  const textColor = selected ? colors.primary : muted ? colors.textMuted : colors.text;

  return (
    <View
      style={[
        styles.row,
        textAlign === 'center' && styles.rowCenter,
        containerStyle,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {tokens.map((token, index) =>
        token.kind === 'fraction' ? (
          <StackedFraction
            key={`f-${index}-${token.numerator}-${token.denominator}`}
            numerator={token.numerator}
            denominator={token.denominator}
            size={size}
            muted={muted}
            selected={selected}
          />
        ) : (
          <AppText
            key={`t-${index}`}
            variant={spec.textVariant}
            style={[
              spec.plainText,
              spec.plainFont,
              { color: textColor },
              style,
            ]}
          >
            {token.value}
          </AppText>
        ),
      )}
    </View>
  );
}

const SIZE_LAYOUT: Record<MathDisplaySize, FractionSizeSpec> = {
  sm: { fontSize: 16, barHeight: 2, barPad: 3 },
  body: { fontSize: 18, barHeight: 2, barPad: 3 },
  answer: { fontSize: 22, barHeight: 2.5, barPad: 4 },
  question: { fontSize: 38, barHeight: 3, barPad: 5 },
};

const SIZE_SPECS = {
  sm: {
    textVariant: 'body' as const,
    plainText: { fontSize: 16, lineHeight: 20 },
    plainFont: {},
  },
  body: {
    textVariant: 'body' as const,
    plainText: typography.body,
    plainFont: fonts.math ? { fontFamily: fonts.math } : {},
  },
  answer: {
    textVariant: 'subtitle' as const,
    plainText: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
    plainFont: fonts.math ? { fontFamily: fonts.math } : {},
  },
  question: {
    textVariant: 'question' as const,
    plainText: typography.question,
    plainFont: fonts.math ? { fontFamily: fonts.math } : {},
  },
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  rowCenter: {
    justifyContent: 'center',
    alignSelf: 'center',
  },
  textCenter: {
    textAlign: 'center',
  },
  fraction: {
    alignSelf: 'center',
    marginHorizontal: spacing.xs,
  },
});
