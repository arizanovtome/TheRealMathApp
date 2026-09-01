import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { SessionHistoryModeFilter } from '@/features/progress/sessionHistory.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type SessionModeFilterProps = {
  value: SessionHistoryModeFilter;
  onChange: (mode: SessionHistoryModeFilter) => void;
};

const FILTER_OPTIONS: SessionHistoryModeFilter[] = ['all', 'practice', 'quiz', 'timed'];

export function SessionModeFilter({ value, onChange }: SessionModeFilterProps) {
  const { t } = useAppTranslation(['progress', 'common']);

  const labelFor = (mode: SessionHistoryModeFilter) => {
    switch (mode) {
      case 'all':
        return t('progress:filterAll');
      case 'practice':
        return t('common:practice');
      case 'quiz':
        return t('common:quiz');
      case 'timed':
        return t('common:timed');
    }
  };

  return (
    <View style={styles.row} accessibilityRole="tablist">
      {FILTER_OPTIONS.map((mode) => {
        const selected = value === mode;
        return (
          <Pressable
            key={mode}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={labelFor(mode)}
            onPress={() => onChange(mode)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <AppText variant="label" style={selected ? styles.chipTextSelected : styles.chipText}>
              {labelFor(mode)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
  chipText: {
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.primary,
  },
});
