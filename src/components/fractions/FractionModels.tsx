import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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

type FractionModel = 'bar' | 'circle';

type FractionVisualModelProps = {
  model?: FractionModel;
  numerator: number;
  denominator: number;
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

function pointOnCircle(center: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  };
}

function sectorPath(index: number, denominator: number, center: number, radius: number): string {
  const sectorAngle = 360 / denominator;
  const start = pointOnCircle(center, radius, -90 + index * sectorAngle);
  const end = pointOnCircle(center, radius, -90 + (index + 1) * sectorAngle);
  const largeArc = sectorAngle > 180 ? 1 : 0;
  return [
    `M ${center} ${center}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

export function FractionCircleModel({
  numerator,
  denominator,
  size = 164,
}: FractionBarModelProps & { size?: number }) {
  const center = size / 2;
  const radius = center - OUTLINE_WIDTH;
  return (
    <Svg width={size} height={size} accessibilityElementsHidden>
      {Array.from({ length: denominator }, (_, i) => (
        <Path
          key={i}
          d={sectorPath(i, denominator, center, radius)}
          fill={i < numerator ? colors.fractionShaded : colors.fractionUnshaded}
          stroke={colors.fractionLine}
          strokeWidth={OUTLINE_WIDTH}
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

export function FractionVisualModel({ model = 'bar', numerator, denominator }: FractionVisualModelProps) {
  return model === 'circle' ? (
    <FractionCircleModel numerator={numerator} denominator={denominator} />
  ) : (
    <FractionBarModel numerator={numerator} denominator={denominator} />
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
