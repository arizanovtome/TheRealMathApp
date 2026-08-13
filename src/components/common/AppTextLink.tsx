import type { GestureResponderEvent } from 'react-native';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';

type AppTextLinkProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  accessibilityHint?: string;
};

export function AppTextLink({ label, onPress, accessibilityHint }: AppTextLinkProps) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <AppText variant="body" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    color: colors.text,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
