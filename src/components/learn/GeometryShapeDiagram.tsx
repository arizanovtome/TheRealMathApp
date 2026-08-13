import { SvgXml } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

import { buildGeometryDiagramSvg } from '@/features/learn/geometryDiagramSvg';
import type { GeometryMeasure, GeometryShape } from '@/features/geometry/geometry.types';
import { radii, spacing } from '@/theme/spacing';

export type GeometryShapeDiagramProps = {
  measure: GeometryMeasure;
  shape: GeometryShape;
  width?: number;
  height?: number;
};

export function GeometryShapeDiagram({
  measure,
  shape,
  width = 200,
  height = 160,
}: GeometryShapeDiagramProps) {
  const xml = buildGeometryDiagramSvg(measure, shape);

  return (
    <View style={[styles.frame, { width, height }]}>
      <SvgXml xml={xml} width={width} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    borderRadius: radii.sm,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
});
