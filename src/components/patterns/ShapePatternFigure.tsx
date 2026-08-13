import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { BasicShapeDiagram } from '@/components/shapes/BasicShapeDiagram';
import type { BasicShape } from '@/features/shapes/shapeRecognition.types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const ICON_TO_SHAPE: Record<string, BasicShape> = {
  '○': 'circle',
  '△': 'triangle',
  '□': 'square',
  '★': 'star',
};

export function ShapePatternFigure({ icon, size = 58 }: { icon: string; size?: number }) {
  const shape = ICON_TO_SHAPE[icon] ?? (icon as BasicShape);
  if (!shape) return null;

  return (
    <BasicShapeDiagram
      shape={shape}
      size={size}
      fill="transparent"
      stroke={colors.text}
    />
  );
}

export function ShapePatternSequence({ icons }: { icons: string[] }) {
  return (
    <View style={styles.row}>
      {icons.map((icon, index) => (
        <ShapePatternFigure key={`${icon}-${index}`} icon={icon} size={52} />
      ))}
      <AppText variant="title">?</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
});
