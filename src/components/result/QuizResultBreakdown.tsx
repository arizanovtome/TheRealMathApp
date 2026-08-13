import { StyleSheet, View } from 'react-native';

import type { TFunction } from 'i18next';

import { AppText } from '@/components/common/AppText';
import { MathDisplayText } from '@/components/fractions/MathDisplayText';
import type { QuizQuestionOutcome } from '@/features/questions/questionScoring';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type QuizResultBreakdownProps = {
  outcomes: QuizQuestionOutcome[];
};

export function QuizResultBreakdown({ outcomes }: QuizResultBreakdownProps) {
  const { t } = useAppTranslation(['practice', 'common']);

  return (
    <View style={styles.wrap} accessibilityRole="list">
      <AppText variant="subtitle" style={styles.heading}>
        {t('practice:questionReview')}
      </AppText>
      {outcomes.map((row, i) => (
        <QuizOutcomeRow key={`${i}-${row.questionText}`} index={i + 1} outcome={row} t={t} />
      ))}
    </View>
  );
}

function QuizOutcomeRow({
  index,
  outcome,
  t,
}: {
  index: number;
  outcome: QuizQuestionOutcome;
  t: TFunction;
}) {
  const { isCorrect, questionText, chosenAnswerLabel, correctAnswerLabel } = outcome;

  return (
    <View
      style={[styles.card, isCorrect ? styles.cardCorrect : styles.cardWrong]}
      accessibilityRole="summary"
      accessibilityLabel={
        isCorrect
          ? t('practice:questionCorrectA11y', { index, chosen: chosenAnswerLabel })
          : t('practice:questionIncorrectA11y', {
              index,
              chosen: chosenAnswerLabel,
              correct: correctAnswerLabel,
            })
      }>
      <View style={styles.row}>
        <View style={styles.signalLane}>
          <View style={[styles.signal, isCorrect ? styles.signalGreen : styles.signalRed]} />
          <AppText variant="label" muted style={styles.qTag}>
            {t('practice:qIndex', { index })}
          </AppText>
        </View>
        <View style={styles.body}>
          <MathDisplayText text={questionText} size="body" textAlign="left" style={styles.question} />
          <View style={styles.answerRow}>
            <AppText variant="body" muted>
              {t('common:yourAnswerLabel')}
            </AppText>
            <MathDisplayText text={chosenAnswerLabel} size="body" textAlign="left" />
          </View>
          {!isCorrect ? (
            <View style={styles.answerRow}>
              <AppText variant="body" style={styles.correctLine}>
                {t('common:correctAnswerLabel')}
              </AppText>
              <MathDisplayText
                text={correctAnswerLabel}
                size="body"
                textAlign="left"
                style={styles.correctEmphasis}
              />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const LAMP_W = 20;
const LAMP_H = 28;

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  heading: {
    marginBottom: spacing.xs,
  },
  card: {
    borderRadius: radii.md,
    borderWidth: 2,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  cardCorrect: {
    borderColor: colors.feedbackCorrectBorder,
  },
  cardWrong: {
    borderColor: colors.feedbackIncorrectBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  signalLane: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: 2,
  },
  signal: {
    width: LAMP_W,
    height: LAMP_H,
    borderRadius: LAMP_W / 2,
  },
  signalGreen: {
    backgroundColor: colors.quizSignalGreen,
    shadowColor: colors.quizSignalGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 5,
  },
  signalRed: {
    backgroundColor: colors.quizSignalRed,
    shadowColor: colors.quizSignalRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  qTag: {
    fontSize: 12,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  question: {
    fontWeight: '600',
  },
  correctLine: {
    color: colors.text,
    fontWeight: '600',
  },
  correctEmphasis: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
  },
});
