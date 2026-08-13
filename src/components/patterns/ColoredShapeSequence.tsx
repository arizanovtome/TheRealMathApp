import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { BasicShapeDiagram } from '@/components/shapes/BasicShapeDiagram';
import type { BasicShape } from '@/features/shapes/shapeRecognition.types';
import { SHAPE_COLOR_HEX, type ShapeColor } from '@/features/shapes/shapeColors';
import { spacing } from '@/theme/spacing';

export function ColoredShapeSequence({
  items,
}: {
  items: { shape: BasicShape; color: ShapeColor }[];
}) {
  return (
    <View style={styles.row}>
      {items.map((item, index) => (
        <BasicShapeDiagram
          key={`${item.color}-${item.shape}-${index}`}
          shape={item.shape}
          fill={SHAPE_COLOR_HEX[item.color]}
          size={52}
        />
      ))}
      <AppText variant="title">?</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
});
