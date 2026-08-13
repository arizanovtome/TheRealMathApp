import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import {
  FINAL_RESULT_CAP_OPTIONS,
  type FinalResultCap,
  type FinalResultCapNumeric,
} from '@/features/learning-plan/learningPlan.types';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type FinalResultCapSelectorProps = {
  value: FinalResultCap;
  onChange: (value: FinalResultCap) => void;
};

export function FinalResultCapSelector({ value, onChange }: FinalResultCapSelectorProps) {
  const { t } = useAppTranslation(['settings', 'common']);

  return (
    <View style={styles.wrap}>
      <AppText variant="label">{t('common:answer')}</AppText>
      <View style={styles.row}>
        {FINAL_RESULT_CAP_OPTIONS.map((opt: FinalResultCapNumeric) => {
          const selected = opt === value;
          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              accessibilityLabel={t('common:rangeFrom1To', { lineLabel: t('common:answer'), value: opt })}
              accessibilityState={{ selected }}
              onPress={() => onChange(opt)}
              style={[styles.chip, selected && styles.chipSelected]}>
              <AppText variant="subtitle" style={selected ? styles.chipTextSelected : styles.chipText}>
                {t('common:rangeFrom1To', { lineLabel: t('common:answer'), value: opt })}
              </AppText>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common:unlimited')}
          accessibilityState={{ selected: value === 'unlimited' }}
          onPress={() => onChange('unlimited')}
          style={[styles.chip, value === 'unlimited' && styles.chipSelected]}>
          <AppText variant="subtitle" style={value === 'unlimited' ? styles.chipTextSelected : styles.chipText}>
            {t('common:unlimited')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minWidth: 96,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
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
});
