import Svg, { Circle, Ellipse, Polygon, Rect } from 'react-native-svg';

import type { BasicShape } from '@/features/shapes/shapeRecognition.types';

type BasicShapeDiagramProps = {
  shape: BasicShape;
  size?: number;
  fill?: string;
  stroke?: string;
};

const FILL = '#FF8A00';
const STROKE = '#1A1A1A';
const STROKE_WIDTH = 2.5;

function starPoints(cx: number, cy: number, outerR: number, innerR: number): string {
  const coords: string[] = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    coords.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }
  return coords.join(' ');
}

/** Simple filled shape for preschool shape-naming questions. */
export function BasicShapeDiagram({
  shape,
  size = 168,
  fill = FILL,
  stroke = STROKE,
}: BasicShapeDiagramProps) {
  const cx = size / 2;
  const cy = size / 2;
  const pad = size * 0.14;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {shape === 'circle' ? (
        <Circle
          cx={cx}
          cy={cy}
          r={size / 2 - pad}
          fill={fill}
          stroke={stroke}
          strokeWidth={STROKE_WIDTH}
        />
      ) : null}
      {shape === 'oval' ? (
        <Ellipse
          cx={cx}
          cy={cy}
          rx={size / 2 - pad}
          ry={size * 0.28}
          fill={fill}
          stroke={stroke}
          strokeWidth={STROKE_WIDTH}
        />
      ) : null}
      {shape === 'square' ? (
        <Rect
          x={pad}
          y={pad}
          width={size - pad * 2}
          height={size - pad * 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={STROKE_WIDTH}
        />
      ) : null}
      {shape === 'rectangle' ? (
        <Rect
          x={pad * 0.55}
          y={pad * 1.35}
          width={size - pad * 1.1}
          height={size - pad * 2.7}
          fill={fill}
          stroke={stroke}
          strokeWidth={STROKE_WIDTH}
        />
      ) : null}
      {shape === 'triangle' ? (
        <Polygon
          points={`${cx},${pad} ${size - pad},${size - pad} ${pad},${size - pad}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={STROKE_WIDTH}
        />
      ) : null}
      {shape === 'star' ? (
        <Polygon
          points={starPoints(cx, cy, size / 2 - pad, size * 0.18)}
          fill={fill}
          stroke={stroke}
          strokeWidth={STROKE_WIDTH}
        />
      ) : null}
    </Svg>
  );
}
