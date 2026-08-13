import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radii } from '@/theme/spacing';

const OUTLINE_WIDTH = 3;
const GAP_WIDTH = 3;

type FractionBarModelProps = {
  numerator: number;
  denominator: number;
  width?: number;
  height?: number;
};

export function FractionBarModel({
  numerator,
  denominator,
  width = 248,
  height = 52,
}: FractionBarModelProps) {
  return (
    <View style={[styles.barOuter, { width, height, borderWidth: OUTLINE_WIDTH }]}>
      {Array.from({ length: denominator }, (_, i) => (
        <View
          key={i}
          style={[
            styles.barPart,
            {
              backgroundColor:
                i < numerator ? colors.fractionShaded : colors.fractionUnshaded,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  barOuter: {
    flexDirection: 'row',
    gap: GAP_WIDTH,
    padding: GAP_WIDTH,
    borderColor: colors.fractionLine,
    borderRadius: radii.sm,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: colors.fractionLine,
  },
  barPart: {
    flex: 1,
    borderRadius: 2,
  },
});
