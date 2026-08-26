import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { MathDisplayText } from '@/components/fractions/MathDisplayText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type QuestionCardProps = {
  progressLabel: string;
  questionText: string;
  /** Short prompts with a diagram or sequence below — tighter vertical padding. */
  compact?: boolean;
  /** Replaces the default text renderer for structured math layouts. */
  questionContent?: ReactNode;
  children?: ReactNode;
};

export function QuestionCard({ progressLabel, questionText, compact = false, questionContent, children }: QuestionCardProps) {
  return (
    <View style={styles.board}>
      <View style={styles.rule} />
      <AppText variant="label" muted accessibilityLabel={progressLabel}>
        {progressLabel}
      </AppText>
      <View
        style={[styles.questionBlock, compact && styles.questionBlockCompact]}
        accessibilityLabel={questionText}>
        {questionContent ?? (
          <MathDisplayText
            text={questionText}
            size="question"
            textAlign="center"
            style={styles.question}
          />
        )}
        {children ? <View style={styles.questionVisual}>{children}</View> : null}
      </View>
      <View style={[styles.rule, styles.ruleBottom, compact && styles.ruleBottomCompact]} />
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: colors.boardDeep,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  rule: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.85,
  },
  ruleBottom: {
    marginTop: spacing.xs,
  },
  questionBlock: {
    minHeight: 132,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  questionBlockCompact: {
    minHeight: undefined,
    paddingVertical: spacing.xs,
  },
  ruleBottomCompact: {
    marginTop: 0,
  },
  question: {
    color: colors.text,
    textAlign: 'center',
  },
  questionVisual: { alignItems: 'center', marginTop: spacing.sm },
});
