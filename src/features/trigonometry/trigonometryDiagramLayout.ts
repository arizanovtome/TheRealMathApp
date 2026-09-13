import type {
  TrigDiagramTarget,
  TrigSideRole,
  TrigonometryDiagram,
} from '@/features/trigonometry/trigonometry.types';
import { TRIGONOMETRY_STANDARD_THETA_CORNER } from '@/features/trigonometry/trigonometry.types';

export const TRIG_DIAGRAM_SIZE = 200;
const SIZE = TRIG_DIAGRAM_SIZE;
const PAD = 28;

export type TrigDiagramPoint = { x: number; y: number };

export type TrigDiagramLine = {
  role: TrigSideRole;
  from: TrigDiagramPoint;
  to: TrigDiagramPoint;
  highlighted: boolean;
};

export type TrigDiagramSideLabel = {
  role: TrigSideRole;
  text: string;
  position: TrigDiagramPoint;
  highlight: boolean;
};

export type TrigonometryDiagramLayout = {
  size: number;
  lines: TrigDiagramLine[];
  rightAnglePoints: string;
  thetaArcPath: string;
  thetaLabel: TrigDiagramPoint;
  thetaText: string;
  thetaHighlight: boolean;
  sideLabels: TrigDiagramSideLabel[];
};

/** Right triangle: A bottom-left (θ), C bottom-right (90°), B top-right. */
function trianglePoints(): { a: TrigDiagramPoint; b: TrigDiagramPoint; c: TrigDiagramPoint } {
  return {
    a: { x: PAD, y: SIZE - PAD },
    c: { x: SIZE - PAD, y: SIZE - PAD },
    b: { x: SIZE - PAD, y: PAD },
  };
}

function sideSegment(role: TrigSideRole): { from: TrigDiagramPoint; to: TrigDiagramPoint } {
  const { a, b, c } = trianglePoints();
  switch (role) {
    case 'opposite':
      return { from: c, to: b };
    case 'adjacent':
      return { from: a, to: c };
    case 'hypotenuse':
      return { from: a, to: b };
  }
}

function midPoint(p1: TrigDiagramPoint, p2: TrigDiagramPoint): TrigDiagramPoint {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

function offsetLabel(point: TrigDiagramPoint, dx: number, dy: number): TrigDiagramPoint {
  return { x: point.x + dx, y: point.y + dy };
}

function sideLabelPosition(role: TrigSideRole): TrigDiagramPoint {
  const seg = sideSegment(role);
  const mid = midPoint(seg.from, seg.to);
  if (role === 'opposite') {
    return offsetLabel(mid, -14, 0);
  }
  if (role === 'adjacent') {
    return offsetLabel(mid, 0, 14);
  }
  return offsetLabel(mid, -12, -8);
}

function pointOnRay(from: TrigDiagramPoint, to: TrigDiagramPoint, distance: number): TrigDiagramPoint {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return from;
  return {
    x: from.x + (dx / len) * distance,
    y: from.y + (dy / len) * distance,
  };
}

function buildThetaArcPath(): string {
  const { a, b, c } = trianglePoints();
  const r = 20;
  const onAdjacent = pointOnRay(a, c, r);
  const onHypotenuse = pointOnRay(a, b, r);
  return `M ${onAdjacent.x} ${onAdjacent.y} A ${r} ${r} 0 0 0 ${onHypotenuse.x} ${onHypotenuse.y}`;
}

function thetaLabelPosition(): TrigDiagramPoint {
  const { a, b, c } = trianglePoints();
  const r = 14;
  const onAdjacent = pointOnRay(a, c, r);
  const onHypotenuse = pointOnRay(a, b, r);
  const mid = midPoint(onAdjacent, onHypotenuse);
  return offsetLabel(mid, 12, -2);
}

function resolveUnknown(diagram: TrigonometryDiagram): TrigDiagramTarget | undefined {
  if (diagram.unknown) return diagram.unknown;
  if (diagram.unknownSide) return diagram.unknownSide;
  return undefined;
}

function isSideHighlighted(role: TrigSideRole, diagram: TrigonometryDiagram): boolean {
  const unknown = resolveUnknown(diagram);
  if (unknown === role) return true;
  return diagram.highlightedSide === role;
}

function buildSideLabels(diagram: TrigonometryDiagram): TrigDiagramSideLabel[] {
  const unknown = resolveUnknown(diagram);
  const roles: TrigSideRole[] = ['opposite', 'adjacent', 'hypotenuse'];
  const labels: TrigDiagramSideLabel[] = [];

  for (const role of roles) {
    const known = diagram.knownValues?.[role];
    const isUnknown = unknown === role;
    const isNamedSideQuiz = diagram.highlightedSide !== undefined && diagram.knownValues === undefined;

    if (isUnknown) {
      labels.push({
        role,
        text: '?',
        position: sideLabelPosition(role),
        highlight: true,
      });
      continue;
    }

    if (known !== undefined) {
      labels.push({
        role,
        text: String(known),
        position: sideLabelPosition(role),
        highlight: false,
      });
      continue;
    }

    if (isNamedSideQuiz && diagram.highlightedSide === role) {
      continue;
    }
  }

  return labels;
}

/** Always render the standard Learn layout (θ bottom-left). */
export function normalizeTrigonometryDiagram(diagram: TrigonometryDiagram): TrigonometryDiagram {
  return {
    ...diagram,
    thetaCorner: TRIGONOMETRY_STANDARD_THETA_CORNER,
  };
}

export function getTrigonometryDiagramLayout(diagram: TrigonometryDiagram): TrigonometryDiagramLayout {
  const normalized = normalizeTrigonometryDiagram(diagram);
  const { c } = trianglePoints();
  const roles: TrigSideRole[] = ['opposite', 'adjacent', 'hypotenuse'];
  const rightAngleSize = 14;
  const unknown = resolveUnknown(normalized);
  const findingAngle = unknown === 'angle';
  const knownAngle = normalized.knownAngleDegrees;
  const thetaText = findingAngle
    ? '?'
    : knownAngle !== undefined
      ? `${knownAngle}°`
      : 'θ';

  return {
    size: SIZE,
    lines: roles.map((role) => {
      const seg = sideSegment(role);
      return {
        role,
        from: seg.from,
        to: seg.to,
        highlighted: isSideHighlighted(role, normalized),
      };
    }),
    rightAnglePoints: `${c.x - rightAngleSize},${c.y} ${c.x - rightAngleSize},${c.y - rightAngleSize} ${c.x},${c.y - rightAngleSize}`,
    thetaArcPath: buildThetaArcPath(),
    thetaLabel: thetaLabelPosition(),
    thetaText,
    thetaHighlight: findingAngle,
    sideLabels: buildSideLabels(normalized),
  };
}

/** SVG string (used in tests). */
export function buildTrigonometryDiagramSvg(diagram: TrigonometryDiagram): string {
  const layout = getTrigonometryDiagramLayout(diagram);
  const lines = layout.lines
    .map((line) => {
      const stroke = line.highlighted ? '#FF8A00' : '#1A1A1A';
      const strokeWidth = line.highlighted ? 4 : 2.5;
      return `<line x1="${line.from.x}" y1="${line.from.y}" x2="${line.to.x}" y2="${line.to.y}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
    })
    .join('');

  const sideMarkers = layout.sideLabels
    .map((label) => {
      const fill = label.highlight ? '#FF8A00' : '#1A1A1A';
      const weight = label.highlight ? '700' : '600';
      const size = label.highlight ? 18 : 15;
      return `<text x="${label.position.x}" y="${label.position.y}" text-anchor="middle" font-size="${size}" font-weight="${weight}" fill="${fill}">${label.text}</text>`;
    })
    .join('');

  const { x, y } = layout.thetaLabel;
  const thetaFill = layout.thetaHighlight ? '#FF8A00' : '#1A1A1A';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  ${lines}
  <polyline points="${layout.rightAnglePoints}" fill="none" stroke="#1A1A1A" stroke-width="2"/>
  <path d="${layout.thetaArcPath}" fill="none" stroke="#1A1A1A" stroke-width="2"/>
  <text x="${x}" y="${y}" font-size="16" font-weight="600" fill="${thetaFill}">${layout.thetaText}</text>
  ${sideMarkers}
</svg>`;
}
