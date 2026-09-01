import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import {
  MATH_KNOWLEDGE_LEVELS,
  MATH_KNOWLEDGE_LABEL_KEYS,
  type MathKnowledgeLevel,
} from '@/constants/mathKnowledge';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

type MathKnowledgeSelectorProps = {
  value: MathKnowledgeLevel;
  onChange: (level: MathKnowledgeLevel) => void;
};

export function MathKnowledgeSelector({ value, onChange }: MathKnowledgeSelectorProps) {
  const { t } = useAppTranslation('settings');

  return (
    <View style={styles.list}>
      {MATH_KNOWLEDGE_LEVELS.map((level) => {
        const selected = level === value;
        return (
          <Pressable
            key={level}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t(MATH_KNOWLEDGE_LABEL_KEYS[level])}
            onPress={() => onChange(level)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <AppText variant="body" style={selected ? styles.optionTextSelected : styles.optionText}>
              {t(MATH_KNOWLEDGE_LABEL_KEYS[level])}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipSelected,
  },
  optionText: {
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
  },
});
