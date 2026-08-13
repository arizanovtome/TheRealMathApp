import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import type { ClockTime } from '@/features/clock/clockFormat';

type AnalogClockFaceProps = {
  time: ClockTime;
  size?: number;
};

/** Simple analog clock face with hour and minute hands. */
export function AnalogClockFace({ time, size = 180 }: AnalogClockFaceProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;
  const minuteAngle = (time.minute / 60) * 360 - 90;
  const hourAngle = ((time.hour % 12) / 12) * 360 + (time.minute / 60) * 30 - 90;
  const minuteRad = (minuteAngle * Math.PI) / 180;
  const hourRad = (hourAngle * Math.PI) / 180;
  const minuteX = cx + Math.cos(minuteRad) * radius * 0.88;
  const minuteY = cy + Math.sin(minuteRad) * radius * 0.88;
  const hourX = cx + Math.cos(hourRad) * radius * 0.55;
  const hourY = cy + Math.sin(hourRad) * radius * 0.55;

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const inner = radius * 0.82;
    const outer = radius * 0.95;
    return {
      x1: cx + Math.cos(rad) * inner,
      y1: cy + Math.sin(rad) * inner,
      x2: cx + Math.cos(rad) * outer,
      y2: cy + Math.sin(rad) * outer,
    };
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy} r={radius} stroke="#1A1A1A" strokeWidth={2} fill="#FFF8E7" />
      {ticks.map((t, i) => (
        <Line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="#1A1A1A"
          strokeWidth={2}
        />
      ))}
      <Line x1={cx} y1={cy} x2={hourX} y2={hourY} stroke="#1A1A1A" strokeWidth={4} strokeLinecap="round" />
      <Line x1={cx} y1={cy} x2={minuteX} y2={minuteY} stroke="#FF8A00" strokeWidth={3} strokeLinecap="round" />
      <Circle cx={cx} cy={cy} r={4} fill="#1A1A1A" />
      {[12, 3, 6, 9].map((label, i) => {
        const angle = (i / 4) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const lx = cx + Math.cos(rad) * radius * 0.68;
        const ly = cy + Math.sin(rad) * radius * 0.68 + 4;
        return (
          <SvgText
            key={label}
            x={lx}
            y={ly}
            fill="#1A1A1A"
            fontSize={14}
            fontWeight="600"
            textAnchor="middle"
          >
            {label}
          </SvgText>
        );
      })}
    </Svg>
  );
}
