import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { MathDisplayText } from '@/components/fractions/MathDisplayText';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { radii, spacing } from '@/theme/spacing';

type FeedbackMessageProps = {
  variant: 'correct' | 'incorrect';
  message: string;
};

/** Split “Not quite. The correct answer is …” into a punchy lead + calmer detail. */
function splitIncorrectFeedback(message: string): { lead: string; rest?: string } {
  const idx = message.indexOf('. ');
  if (idx <= 0 || idx >= message.length - 2) return { lead: message };
  const rest = message.slice(idx + 2).trim();
  if (!rest) return { lead: message };
  return { lead: message.slice(0, idx + 1).trim(), rest };
}

export function FeedbackMessage({ variant, message }: FeedbackMessageProps) {
  const isCorrect = variant === 'correct';
  const { lead, rest } = isCorrect ? { lead: message, rest: undefined } : splitIncorrectFeedback(message);

  return (
    <View
      style={[styles.banner, isCorrect ? styles.bannerCorrect : styles.bannerIncorrect]}
      accessibilityLiveRegion="polite"
      accessibilityRole="text">
      <AppText
        variant="subtitle"
        accessibilityRole="header"
        style={[styles.lead, isCorrect ? styles.leadCorrect : styles.leadIncorrect]}>
        {lead}
      </AppText>
      {rest ? (
        <MathDisplayText text={rest} size="body" muted style={styles.detail} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignSelf: 'stretch',
    maxWidth: '100%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  bannerCorrect: {
    backgroundColor: colors.successSoft,
    borderColor: 'rgba(200, 240, 210, 0.35)',
  },
  bannerIncorrect: {
    backgroundColor: colors.errorSoft,
    borderColor: 'rgba(255, 210, 210, 0.32)',
  },
  lead: {
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  leadCorrect: {
    color: colors.success,
    fontSize: 22,
    fontWeight: '700',
    ...(fonts.chalkTitle ? { fontFamily: fonts.chalkTitle } : {}),
  },
  leadIncorrect: {
    color: colors.error,
    fontSize: 20,
    fontWeight: '700',
  },
  detail: {
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '100%',
    fontWeight: '500',
    ...(fonts.math ? { fontFamily: fonts.math } : {}),
  },
});
