import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { BasicShapeDiagram } from '@/components/shapes/BasicShapeDiagram';
import type { ColoredShapeItem } from '@/features/questions/question.types';
import { SHAPE_COLOR_HEX } from '@/features/shapes/shapeColors';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

function Shapes({ items }: { items: ColoredShapeItem[] }) {
  return <View style={styles.shapes}>{items.map((item, index) => <BasicShapeDiagram key={`${item.color}-${item.shape}-${index}`} shape={item.shape} fill={SHAPE_COLOR_HEX[item.color]} size={42} />)}</View>;
}
export function ShapeCountingVisual({ items }: { items: ColoredShapeItem[] }) {
  return <View style={styles.countWrap}><Shapes items={items}/></View>;
}
export function ShapeQuantityComparisonVisual({ first, second }: { first: ColoredShapeItem[]; second: ColoredShapeItem[] }) {
  const { t } = useAppTranslation(['common']);
  return <View style={styles.row}><View style={styles.group}><AppText variant="label">{t('common:groupA')}</AppText><Shapes items={first}/></View><View style={styles.group}><AppText variant="label">{t('common:groupB')}</AppText><Shapes items={second}/></View></View>;
}
const styles = StyleSheet.create({countWrap:{gap:spacing.sm,paddingVertical:spacing.sm},row:{flexDirection:'row',gap:spacing.sm,paddingVertical:spacing.sm},group:{flex:1,minHeight:150,borderWidth:2,borderColor:colors.borderStrong,borderRadius:radii.lg,padding:spacing.xs,alignItems:'center'},shapes:{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',alignContent:'center',gap:2}});
