import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { AnswerEntryMode, AnswerOptionsCount } from '@/features/learning-plan/learningPlan.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

const COUNTS: AnswerOptionsCount[] = [2, 3, 4, 5, 6];

type AnswerOptionsSelectorProps = {
  entryMode: AnswerEntryMode;
  optionCount: AnswerOptionsCount;
  geometryEnabled?: boolean;
  onPickMultipleChoice: (count: AnswerOptionsCount) => void;
  onPickKeyboard: () => void;
};

export function AnswerOptionsSelector({
  entryMode,
  optionCount,
  geometryEnabled = false,
  onPickMultipleChoice,
  onPickKeyboard,
}: AnswerOptionsSelectorProps) {
  const { t } = useAppTranslation(['settings', 'common']);

  return (
    <View style={styles.wrap}>
      <AppText variant="label">{t('settings:answerChoices')}</AppText>
      <View style={styles.row}>
        {COUNTS.map((opt) => {
          const selected = entryMode === 'multiple_choice' && opt === optionCount;
          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              accessibilityLabel={`${opt} ${t('settings:answerChoices').toLowerCase()}`}
              accessibilityState={{ selected }}
              onPress={() => onPickMultipleChoice(opt)}
              style={[styles.chip, selected && styles.chipSelected]}>
              <AppText variant="subtitle" style={selected ? styles.chipTextSelected : styles.chipText}>
                {opt}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common:keyboard')}
        accessibilityState={{ selected: entryMode === 'keyboard' }}
        onPress={onPickKeyboard}
        style={[styles.keyboardChip, entryMode === 'keyboard' && styles.chipSelected]}>
        <AppText
          variant="subtitle"
          style={entryMode === 'keyboard' ? styles.chipTextSelected : styles.chipText}>
          {t('common:keyboard')}
        </AppText>
        </Pressable>
      {geometryEnabled && entryMode === 'keyboard' ? (
        <AppText variant="body" muted>
          {t('settings:geometryChoicesHint')}
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
    flexWrap: 'wrap',
  },
  chip: {
    minWidth: 64,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chip,
  },
  keyboardChip: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chip,
    marginTop: spacing.xs,
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
});
