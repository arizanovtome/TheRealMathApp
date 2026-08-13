import Svg, { Line, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

import {
  getTrigonometryDiagramLayout,
  TRIG_DIAGRAM_SIZE,
} from '@/features/trigonometry/trigonometryDiagramLayout';
import type { TrigonometryDiagram } from '@/features/trigonometry/trigonometry.types';
import { radii, spacing } from '@/theme/spacing';

const STROKE = '#1A1A1A';
const HIGHLIGHT = '#FF8A00';
const FILL = '#FFFFFF';

export type TrigonometryShapeDiagramProps = {
  diagram: TrigonometryDiagram;
  width?: number;
  height?: number;
};

/** Right-triangle diagram — same rendering in Learn and practice. */
export function TrigonometryShapeDiagram({
  diagram,
  width = TRIG_DIAGRAM_SIZE,
  height = TRIG_DIAGRAM_SIZE,
}: TrigonometryShapeDiagramProps) {
  const layout = getTrigonometryDiagramLayout(diagram);

  return (
    <View style={[styles.frame, { width, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${TRIG_DIAGRAM_SIZE} ${TRIG_DIAGRAM_SIZE}`}>
        <Rect width="100%" height="100%" fill={FILL} />
        {layout.lines.map((line) => (
          <Line
            key={line.role}
            x1={line.from.x}
            y1={line.from.y}
            x2={line.to.x}
            y2={line.to.y}
            stroke={line.highlighted ? HIGHLIGHT : STROKE}
            strokeWidth={line.highlighted ? 4 : 2.5}
            strokeLinecap="round"
          />
        ))}
        <Polyline
          points={layout.rightAnglePoints}
          fill="none"
          stroke={STROKE}
          strokeWidth={2}
        />
        <Path d={layout.thetaArcPath} fill="none" stroke={STROKE} strokeWidth={2} />
        <SvgText
          x={layout.thetaLabel.x}
          y={layout.thetaLabel.y}
          fontSize={layout.thetaHighlight ? 18 : 16}
          fontWeight="600"
          fill={layout.thetaHighlight ? HIGHLIGHT : STROKE}
        >
          {layout.thetaText}
        </SvgText>
        {layout.sideLabels.map((label) => (
          <SvgText
            key={label.role}
            x={label.position.x}
            y={label.position.y}
            textAnchor="middle"
            fontSize={label.highlight ? 18 : 15}
            fontWeight={label.highlight ? '700' : '600'}
            fill={label.highlight ? HIGHLIGHT : STROKE}
          >
            {label.text}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    borderRadius: radii.sm,
    overflow: 'hidden',
    marginVertical: spacing.xs,
    backgroundColor: FILL,
  },
});
