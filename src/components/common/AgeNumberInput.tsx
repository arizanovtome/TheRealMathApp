import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { formatAgeYears, parseAgeYears } from '@/utils/parseAgeYears';

type AgeNumberInputProps = {
  value: number | null;
  onChange: (age: number | null) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  placeholder?: string;
};

export function AgeNumberInput({
  value,
  onChange,
  disabled = false,
  accessibilityLabel = 'Age in years',
  placeholder = 'Your age',
}: AgeNumberInputProps) {
  const [text, setText] = useState(value === null ? '' : formatAgeYears(value));

  useEffect(() => {
    setText(value === null ? '' : formatAgeYears(value));
  }, [value]);

  const commit = (raw: string) => {
    if (!raw.trim()) {
      onChange(null);
      setText('');
      return true;
    }
    const parsed = parseAgeYears(raw);
    if (parsed !== null) {
      onChange(parsed);
      setText(formatAgeYears(parsed));
      return true;
    }
    setText(value === null ? '' : formatAgeYears(value));
    return false;
  };

  return (
    <View style={styles.wrap}>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        editable={!disabled}
        keyboardType="number-pad"
        maxLength={3}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={(next) => {
          const digits = next.replace(/\D/g, '').slice(0, 3);
          setText(digits);
          if (!digits) {
            onChange(null);
            return;
          }
          const parsed = parseAgeYears(digits);
          if (parsed !== null) onChange(parsed);
        }}
        onBlur={() => {
          commit(text);
        }}
        style={[styles.input, disabled && styles.inputDisabled]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 21,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 56,
  },
  inputDisabled: {
    opacity: 0.45,
  },
});
