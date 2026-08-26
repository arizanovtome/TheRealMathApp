import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { MathDisplayText, StackedExpressionFraction } from '@/components/fractions/MathDisplayText';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { spacing } from '@/theme/spacing';

export function LimitQuestionDisplay({ approach, expression, fraction }: {
  approach: string;
  expression: string;
  fraction?: { numerator: string; denominator: string };
}) {
  return (
    <View style={styles.root} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LimitExpressionDisplay approach={approach} expression={expression} fraction={fraction} showAnswerBlank />
    </View>
  );
}

export function LimitExpressionDisplay({ approach, expression, fraction, compact = false, showAnswerBlank = false }: {
  approach: string;
  expression: string;
  fraction?: { numerator: string; denominator: string };
  compact?: boolean;
  showAnswerBlank?: boolean;
}) {
  const answerBlankOnNewLine = showAnswerBlank && (fraction
    ? Math.max(fraction.numerator.length, fraction.denominator.length) > 8
    : expression.length > 10);

  return (
    <View style={styles.expressionBlock}>
      <View style={[styles.expressionRow, compact && styles.expressionRowCompact]}>
        <View style={[styles.limitSymbol, compact && styles.limitSymbolCompact]}>
          <AppText variant="question" style={[styles.lim, compact && styles.limCompact]}>lim</AppText>
          <AppText variant="label" style={[styles.approach, compact && styles.approachCompact]}>x → {approach}</AppText>
        </View>
        <View style={styles.expressionContainer}>
          {fraction ? (
            <StackedExpressionFraction numerator={fraction.numerator} denominator={fraction.denominator} />
          ) : (
            <MathDisplayText text={expression} size="answer" textAlign="center" style={[styles.expression, compact && styles.expressionCompact]} />
          )}
        </View>
        {showAnswerBlank && !answerBlankOnNewLine ? <AppText variant="question" style={styles.answerBlank}>= ?</AppText> : null}
      </View>
      {answerBlankOnNewLine ? <AppText variant="question" style={styles.answerBlankNewLine}>= ?</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center' },
  expressionBlock: { alignSelf: 'center', alignItems: 'center', maxWidth: '100%', gap: spacing.xs },
  expressionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', maxWidth: '100%', paddingHorizontal: spacing.xs, gap: spacing.xs },
  limitSymbol: { width: 72, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  lim: { color: colors.text, fontSize: 40, lineHeight: 42, fontFamily: fonts.math },
  approach: { color: colors.text, fontSize: 17, lineHeight: 20, marginTop: -3, fontFamily: fonts.math },
  expressionContainer: { flexShrink: 1, minWidth: 0, maxWidth: '78%', alignItems: 'center', justifyContent: 'center' },
  expression: { color: colors.text, fontSize: 27, lineHeight: 34, fontWeight: '700', textAlign: 'center' },
  answerBlank: { color: colors.text, fontSize: 28, lineHeight: 34, fontFamily: fonts.math, flexShrink: 0 },
  answerBlankNewLine: { color: colors.text, fontSize: 28, lineHeight: 34, fontFamily: fonts.math, textAlign: 'center' },
  expressionRowCompact: { paddingHorizontal: 0 },
  limitSymbolCompact: { width: 62 },
  limCompact: { fontSize: 31, lineHeight: 33 },
  approachCompact: { fontSize: 14, lineHeight: 17 },
  expressionCompact: { fontSize: 22, lineHeight: 28 },
});
