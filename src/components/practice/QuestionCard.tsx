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
  /** Remaining share from 0 to 1; replaces the bottom rule with a countdown bar. */
  timerProgress?: number;
  timerAccessibilityLabel?: string;
  children?: ReactNode;
};

export function QuestionCard({
  progressLabel,
  questionText,
  compact = false,
  questionContent,
  timerProgress,
  timerAccessibilityLabel,
  children,
}: QuestionCardProps) {
  const normalizedTimerProgress =
    timerProgress === undefined ? undefined : Math.max(0, Math.min(1, timerProgress));
  const timerWidth = `${Math.round((normalizedTimerProgress ?? 0) * 100)}%` as `${number}%`;

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
      {normalizedTimerProgress === undefined ? (
        <View style={[styles.rule, styles.ruleBottom, compact && styles.ruleBottomCompact]} />
      ) : (
        <View
          style={[styles.timerTrack, compact && styles.ruleBottomCompact]}
          accessibilityRole="progressbar"
          accessibilityLabel={timerAccessibilityLabel}
          accessibilityValue={{
            min: 0,
            max: 100,
            now: Math.round(normalizedTimerProgress * 100),
          }}>
          <View
            style={[
              styles.timerFill,
              normalizedTimerProgress <= 0.25 && styles.timerFillLow,
              { width: timerWidth },
            ]}
          />
        </View>
      )}
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
  timerTrack: {
    height: 6,
    marginTop: spacing.xs,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  timerFillLow: {
    backgroundColor: colors.error,
  },
  question: {
    color: colors.text,
    textAlign: 'center',
  },
  questionVisual: { alignItems: 'center', marginTop: spacing.sm },
});
