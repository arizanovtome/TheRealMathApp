import type {
  GeometryMeasure,
  GeometryShape,
} from "@/features/geometry/geometry.types";

const W = 200;
const H = 160;
const STROKE = "#1A1A1A";
const STROKE_W = 2;
const PERIMETER = "#FF8A00";
const AREA_FILL = "rgba(255,138,0,0.38)";
const FACE_FRONT = "#FFF3E0";
const FACE_SIDE = "#FFE0B2";
const FACE_TOP = "#FFCC80";
const FACE_BACK = "#FFD099";
const LABEL = `font-family="system-ui,sans-serif" font-size="11" fill="${STROKE}"`;

/** Isometric scale factors (y-up in 3D → smaller SVG y). */
const ISO_SCALE_X = 0.55;
const ISO_SCALE_Z = 0.32;
const ISO_SCALE_Y = 0.72;
/** Y-axis rotation (~26°) so front + both side faces are visible. */
const PYRAMID_ROT_Y = 0.45;

function isoPoint(
  x: number,
  y: number,
  z: number,
  cx: number,
  cy: number,
  rotY: number,
): [number, number] {
  const c = Math.cos(rotY);
  const s = Math.sin(rotY);
  const xr = x * c + z * s;
  const zr = -x * s + z * c;
  const px = cx + (xr - zr) * ISO_SCALE_X;
  const py = cy + (xr + zr) * ISO_SCALE_Z - y * ISO_SCALE_Y;
  return [Math.round(px), Math.round(py)];
}

function midPoint(a: [number, number], b: [number, number]): [number, number] {
  return [Math.round((a[0] + b[0]) / 2), Math.round((a[1] + b[1]) / 2)];
}

function pt(p: [number, number]): string {
  return `${p[0]},${p[1]}`;
}

function wrap(svgBody: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${svgBody}</svg>`;
}

function label(text: string, x: number, y: number, anchor = "middle"): string {
  return `<text ${LABEL} text-anchor="${anchor}" x="${x}" y="${y}">${text}</text>`;
}

/** Place a label on a diagonal at fraction `t` (0–1), nudged perpendicular to the line. */
function diagonalLabel(
  text: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number,
  offsetX: number,
  offsetY: number,
): string {
  const px = x1 + (x2 - x1) * t;
  const py = y1 + (y2 - y1) * t;
  const lx = Math.round(px + offsetX);
  const ly = Math.round(py + offsetY);
  let anchor = "middle";
  if (offsetX <= -8) anchor = "end";
  else if (offsetX >= 8) anchor = "start";
  return label(text, lx, ly, anchor);
}

function perimeterStyle(measure: GeometryMeasure): string {
  if (measure === "perimeter") {
    return `fill="none" stroke="${PERIMETER}" stroke-width="2.5" stroke-dasharray="6 4"`;
  }
  if (measure === "area") {
    return `fill="${AREA_FILL}" stroke="${STROKE}" stroke-width="${STROKE_W}"`;
  }
  return `fill="${FACE_FRONT}" stroke="${STROKE}" stroke-width="${STROKE_W}"`;
}

function drawSquare(measure: GeometryMeasure): string {
  const style = perimeterStyle(measure);
  const sideLabels =
    measure === "area"
      ? `${label("a", 100, 28)} ${label("a", 138, 68, "start")}`
      : `${label("a", 100, 28)}
         ${label("a", 138, 68, "start")}
         ${label("a", 100, 108)}
         ${label("a", 62, 68, "end")}`;
  return `
    <rect x="70" y="35" width="60" height="60" ${style} />
    ${sideLabels}
  `;
}

function drawRectangle(measure: GeometryMeasure): string {
  const style = perimeterStyle(measure);
  const sideLabels =
    measure === "area"
      ? `${label("a", 100, 42)} ${label("b", 165, 80, "start")}`
      : `${label("a", 100, 42)}
         ${label("b", 165, 80, "start")}
         ${label("a", 100, 118)}
         ${label("b", 35, 80, "end")}`;
  return `
    <rect x="45" y="50" width="110" height="55" ${style} />
    ${sideLabels}
  `;
}

function drawTriangle(measure: GeometryMeasure): string {
  const style = perimeterStyle(measure);
  const pts = "100,30 155,120 45,120";

  if (measure === "area") {
    return `
    <polygon points="${pts}" ${style} />
    <line x1="100" y1="30" x2="100" y2="120" stroke="${PERIMETER}" stroke-width="1.5" stroke-dasharray="4 3"/>
    ${label("a", 100, 132)}
    ${label("h", 108, 78, "start")}
  `;
  }

  return `
    <polygon points="${pts}" ${style} />
    ${label("a", 100, 133)}
    ${label("b", 58, 78, "end")}
    ${label("c", 142, 78, "start")}
  `;
}

function drawCircle(measure: GeometryMeasure): string {
  const fill =
    measure === "area"
      ? `fill="${AREA_FILL}"`
      : measure === "perimeter"
        ? 'fill="none"'
        : `fill="${FACE_FRONT}"`;
  const ring =
    measure === "perimeter"
      ? `<circle cx="100" cy="80" r="50" fill="none" stroke="${PERIMETER}" stroke-width="2.5" stroke-dasharray="6 4"/>`
      : "";
  return `
    <circle cx="100" cy="80" r="50" ${fill} stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    ${ring}
    <line x1="100" y1="80" x2="145" y2="80" stroke="${STROKE}" stroke-width="1.5"/>
    ${label("r", 122, 74)}
  `;
}

function drawRhombus(measure: GeometryMeasure): string {
  const style = perimeterStyle(measure);
  const pts = "100,32 168,80 100,128 32,80";

  if (measure === "area") {
    const vertTop = 32;
    const vertBottom = 128;
    const horizLeft = 32;
    const horizRight = 168;
    const horizY = 80;
    return `
    <polygon points="${pts}" ${style} />
    <line x1="100" y1="${vertTop}" x2="100" y2="${vertBottom}" stroke="${PERIMETER}" stroke-width="1.5"/>
    <line x1="${horizLeft}" y1="${horizY}" x2="${horizRight}" y2="${horizY}" stroke="${PERIMETER}" stroke-width="1.5"/>
    ${diagonalLabel("d1", 100, vertTop, 100, vertBottom, 0.32, -20, 4)}
    ${diagonalLabel("d2", horizLeft, horizY, horizRight, horizY, 0.68, 0, -18)}
  `;
  }

  return `
    <polygon points="${pts}" ${style} />
    ${label("a", 142, 52, "start")}
    ${label("a", 142, 112, "start")}
    ${label("a", 58, 112, "end")}
    ${label("a", 58, 52, "end")}
  `;
}

function drawKite(measure: GeometryMeasure): string {
  const style = perimeterStyle(measure);
  // Wing points sit high so top pair (a) is clearly shorter than bottom pair (b).
  const pts = "100,28 158,58 100,132 42,58";

  if (measure === "area") {
    const vertTop = 28;
    const vertBottom = 132;
    const horizLeft = 42;
    const horizRight = 158;
    const horizY = 58;
    return `
    <polygon points="${pts}" ${style} />
    <line x1="100" y1="${vertTop}" x2="100" y2="${vertBottom}" stroke="${PERIMETER}" stroke-width="1.5"/>
    <line x1="${horizLeft}" y1="${horizY}" x2="${horizRight}" y2="${horizY}" stroke="${PERIMETER}" stroke-width="1.5"/>
    ${diagonalLabel("d1", 100, vertTop, 100, vertBottom, 0.28, -20, 4)}
    ${diagonalLabel("d2", horizLeft, horizY, horizRight, horizY, 0.72, 0, -16)}
  `;
  }

  return `
    <polygon points="${pts}" ${style} />
    ${label("a", 134, 38, "start")}
    ${label("a", 66, 38, "end")}
    ${label("b", 134, 102, "start")}
    ${label("b", 66, 102, "end")}
  `;
}

function drawTrapezoid(measure: GeometryMeasure): string {
  const style = perimeterStyle(measure);
  const pts = "55,120 145,120 125,45 75,45";

  if (measure === "area") {
    return `
    <polygon points="${pts}" ${style} />
    <line x1="100" y1="45" x2="100" y2="120" stroke="${PERIMETER}" stroke-width="1.5" stroke-dasharray="4 3"/>
    ${label("a", 100, 38)}
    ${label("b", 100, 132)}
    ${label("h", 108, 85, "start")}
  `;
  }

  return `
    <polygon points="${pts}" ${style} />
    ${label("a", 100, 38)}
    ${label("b", 100, 132)}
    ${label("c", 52, 85, "end")}
    ${label("d", 148, 85, "start")}
  `;
}

function drawParallelogram(measure: GeometryMeasure): string {
  const style = perimeterStyle(measure);
  const pts = "50,120 150,120 130,45 30,45";

  if (measure === "area") {
    return `
    <polygon points="${pts}" ${style} />
    <line x1="110" y1="45" x2="110" y2="120" stroke="${PERIMETER}" stroke-width="1.5" stroke-dasharray="4 3"/>
    ${label("a", 100, 132)}
    ${label("h", 118, 85, "start")}
  `;
  }

  return `
    <polygon points="${pts}" ${style} />
    ${label("a", 100, 38)}
    ${label("a", 100, 132)}
    ${label("b", 165, 85, "start")}
    ${label("b", 35, 85, "end")}
  `;
}

function drawCube(): string {
  return `
    <polygon points="70,95 110,75 150,95 110,115" fill="${FACE_TOP}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <polygon points="70,95 70,55 110,35 110,75" fill="${FACE_SIDE}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <polygon points="110,75 110,35 150,55 150,95" fill="${FACE_FRONT}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    ${label("a", 62, 78, "end")}
    ${label("a", 158, 78, "start")}
    ${label("a", 128, 52)}
  `;
}

function drawCuboid(): string {
  return `
    <polygon points="55,100 100,78 165,100 120,122" fill="${FACE_TOP}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <polygon points="55,100 55,55 100,33 100,78" fill="${FACE_SIDE}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <polygon points="100,78 100,33 165,55 165,100" fill="${FACE_FRONT}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    ${label("a", 132, 102)}
    ${label("b", 72, 42, "end")}
    ${label("c", 172, 78, "start")}
  `;
}

function drawPyramid(): string {
  const cx = 100;
  const cy = 118;
  const rot = PYRAMID_ROT_Y;
  const s = 40;
  const h = 84;

  const apex = isoPoint(0, h, 0, cx, cy, rot);
  const fl = isoPoint(-s, 0, -s, cx, cy, rot);
  const fr = isoPoint(s, 0, -s, cx, cy, rot);
  const br = isoPoint(s, 0, s, cx, cy, rot);
  const bl = isoPoint(-s, 0, s, cx, cy, rot);
  const baseCenter = isoPoint(0, 0, 0, cx, cy, rot);
  const frontMid = midPoint(fl, fr);

  return `
    <polygon points="${pt(bl)} ${pt(br)} ${pt(apex)}" fill="${FACE_BACK}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <polygon points="${pt(fl)} ${pt(bl)} ${pt(apex)}" fill="${FACE_SIDE}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <polygon points="${pt(fr)} ${pt(br)} ${pt(apex)}" fill="${FACE_SIDE}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <polygon points="${pt(fl)} ${pt(fr)} ${pt(br)} ${pt(bl)}" fill="${FACE_TOP}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <polygon points="${pt(fl)} ${pt(fr)} ${pt(apex)}" fill="${FACE_FRONT}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <line x1="${bl[0]}" y1="${bl[1]}" x2="${br[0]}" y2="${br[1]}" stroke="${STROKE}" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="${apex[0]}" y1="${apex[1]}" x2="${baseCenter[0]}" y2="${baseCenter[1]}" stroke="${PERIMETER}" stroke-width="1.5" stroke-dasharray="4 3"/>
    ${label('a', frontMid[0], frontMid[1] + 10)}
    ${label('h', apex[0] + 8, Math.round((apex[1] + baseCenter[1]) / 2), 'start')}
  `;
}

function drawCone(): string {
  return `
    <ellipse cx="100" cy="118" rx="48" ry="12" fill="${FACE_SIDE}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <line x1="52" y1="118" x2="100" y2="35" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <line x1="148" y1="118" x2="100" y2="35" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <line x1="100" y1="35" x2="100" y2="118" stroke="${PERIMETER}" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="100" y1="118" x2="145" y2="118" stroke="${STROKE}" stroke-width="1.5"/>
    ${label("r", 122, 112)}
    ${label("h", 108, 78, "start")}
  `;
}

function drawCylinder(): string {
  return `
    <ellipse cx="100" cy="45" rx="42" ry="11" fill="${FACE_TOP}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <rect x="58" y="45" width="84" height="70" fill="${FACE_FRONT}" stroke="none"/>
    <line x1="58" y1="45" x2="58" y2="115" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <line x1="142" y1="45" x2="142" y2="115" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <ellipse cx="100" cy="115" rx="42" ry="11" fill="${FACE_SIDE}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <line x1="100" y1="45" x2="100" y2="115" stroke="${PERIMETER}" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="100" y1="115" x2="138" y2="115" stroke="${STROKE}" stroke-width="1.5"/>
    ${label("r", 118, 112)}
    ${label("h", 108, 82, "start")}
  `;
}

function drawTriangularPrism(): string {
  return `
    <polygon points="45,95 85,45 125,95" fill="${FACE_FRONT}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <polygon points="75,105 115,55 155,105" fill="${FACE_SIDE}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <line x1="45" y1="95" x2="75" y2="105" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <line x1="85" y1="45" x2="115" y2="55" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <line x1="125" y1="95" x2="155" y2="105" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <line x1="85" y1="45" x2="85" y2="95" stroke="${PERIMETER}" stroke-width="1.5" stroke-dasharray="4 3"/>
    ${label("a", 85, 102)}
    ${label("h", 92, 72, "start")}
    ${label("c", 130, 118, "start")}
  `;
}

function drawTriangularPyramid(): string {
  const cx = 100;
  const cy = 118;
  const rot = PYRAMID_ROT_Y;
  const h = 84;
  const halfBase = 44;

  const apex = isoPoint(0, h, 0, cx, cy, rot);
  const bl = isoPoint(-halfBase, 0, -28, cx, cy, rot);
  const br = isoPoint(halfBase, 0, -28, cx, cy, rot);
  const back = isoPoint(0, 0, 38, cx, cy, rot);
  const baseCenter = isoPoint(0, 0, 0, cx, cy, rot);
  const frontMid = midPoint(bl, br);
  const leftMid = midPoint(bl, back);

  return `
    <polygon points="${pt(bl)} ${pt(back)} ${pt(apex)}" fill="${FACE_SIDE}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <polygon points="${pt(br)} ${pt(back)} ${pt(apex)}" fill="${FACE_BACK}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <polygon points="${pt(bl)} ${pt(br)} ${pt(back)}" fill="${FACE_TOP}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <polygon points="${pt(bl)} ${pt(br)} ${pt(apex)}" fill="${FACE_FRONT}" stroke="${STROKE}" stroke-width="${STROKE_W}"/>
    <line x1="${apex[0]}" y1="${apex[1]}" x2="${baseCenter[0]}" y2="${baseCenter[1]}" stroke="${PERIMETER}" stroke-width="1.5" stroke-dasharray="4 3"/>
    ${label('a', frontMid[0], frontMid[1] + 10)}
    ${label('h', apex[0] + 8, Math.round((apex[1] + baseCenter[1]) / 2), 'start')}
    ${label('b', leftMid[0] - 8, leftMid[1], 'end')}
  `;
}

function draw2D(measure: GeometryMeasure, shape: GeometryShape): string {
  switch (shape) {
    case "square":
      return drawSquare(measure);
    case "rectangle":
      return drawRectangle(measure);
    case "triangle":
      return drawTriangle(measure);
    case "circle":
      return drawCircle(measure);
    case "rhombus":
      return drawRhombus(measure);
    case "kite":
      return drawKite(measure);
    case "parallelogram":
      return drawParallelogram(measure);
    case "trapezoid":
      return drawTrapezoid(measure);
    default:
      return "";
  }
}

function draw3D(shape: GeometryShape): string {
  switch (shape) {
    case "cube":
      return drawCube();
    case "cuboid":
      return drawCuboid();
    case "pyramid":
      return drawPyramid();
    case "cone":
      return drawCone();
    case "cylinder":
      return drawCylinder();
    case "triangular_prism":
      return drawTriangularPrism();
    case "triangular_pyramid":
      return drawTriangularPyramid();
    default:
      return "";
  }
}

/** SVG string for a geometry form diagram (used in-app). */
export function buildGeometryDiagramSvg(
  measure: GeometryMeasure,
  shape: GeometryShape,
): string {
  const body = measure === "volume" ? draw3D(shape) : draw2D(measure, shape);
  return wrap(
    `<rect width="${W}" height="${H}" fill="#FFFFFF" rx="8"/>${body}`,
  );
}
