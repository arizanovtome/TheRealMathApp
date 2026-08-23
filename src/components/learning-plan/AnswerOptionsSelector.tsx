import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import {
  ANSWER_OPTIONS_COUNT_OPTIONS,
  type AnswerOptionsCount,
} from '@/features/learning-plan/learningPlan.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type AnswerOptionsSelectorProps = {
  optionCount: AnswerOptionsCount;
  keyboardEnabled: boolean;
  onPickCount: (count: AnswerOptionsCount) => void;
  onKeyboardChange: (enabled: boolean) => void;
};

export function AnswerOptionsSelector({
  optionCount,
  keyboardEnabled,
  onPickCount,
  onKeyboardChange,
}: AnswerOptionsSelectorProps) {
  const { t } = useAppTranslation(['settings']);

  return (
    <View style={styles.wrap}>
      <AppText variant="label">{t('settings:answerChoices')}</AppText>
      <AppText variant="body" muted>
        {t('settings:answerChoicesHint')}
      </AppText>
      <View style={styles.row}>
        {ANSWER_OPTIONS_COUNT_OPTIONS.map((opt) => {
          const selected = opt === optionCount;
          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              accessibilityLabel={`${opt} ${t('settings:answerChoices').toLowerCase()}`}
              accessibilityState={{ selected }}
              onPress={() => onPickCount(opt)}
              style={[styles.chip, selected && styles.chipSelected]}>
              <AppText variant="subtitle" style={selected ? styles.chipTextSelected : styles.chipText}>
                {opt}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.switchRow}>
        <View style={styles.switchCopy}>
          <AppText variant="subtitle">{t('settings:keyboardAnswers')}</AppText>
          <AppText variant="body" muted>
            {t('settings:keyboardAnswersHint')}
          </AppText>
        </View>
        <View style={styles.switchWrap}>
          <Switch
            accessibilityLabel={t('settings:keyboardAnswers')}
            value={keyboardEnabled}
            onValueChange={onKeyboardChange}
            thumbColor="#ffffff"
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>
      {keyboardEnabled ? (
        <AppText variant="body" muted>
          {t('settings:keyboardMcOnlyHint')}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chip,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
  chipText: {
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  switchCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  switchWrap: {
    flexShrink: 0,
  },
});
