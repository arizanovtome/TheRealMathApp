import { Switch, StyleSheet, View, type SwitchProps } from 'react-native';

import { colors } from '@/theme/colors';

const COMPACT_SCALE = 0.9;
const COMPACT_SWITCH_HIT_SLOP = { top: 8, right: 8, bottom: 8, left: 8 } as const;

type CompactSwitchProps = Omit<SwitchProps, 'thumbColor' | 'trackColor'>;

/** Smaller switch for nested learning-plan options (keeps section toggles full size). */
export function CompactSwitch(props: CompactSwitchProps) {
  return (
    <View style={styles.wrap}>
      <Switch
        hitSlop={COMPACT_SWITCH_HIT_SLOP}
        {...props}
        thumbColor="#ffffff"
        trackColor={{ false: colors.border, true: colors.primary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexShrink: 0,
    transform: [{ scaleX: COMPACT_SCALE }, { scaleY: COMPACT_SCALE }],
    marginRight: -5,
    marginVertical: -2,
  },
});
