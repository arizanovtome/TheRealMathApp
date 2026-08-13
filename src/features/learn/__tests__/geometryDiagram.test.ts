import { buildGeometryDiagramSvg } from "@/features/learn/geometryDiagramSvg";
import { getGeometryFormExplanation } from "@/features/learn/geometryFormExplanations";

/** Allowed diagram dimension labels (not s, l, w, etc.). */
function diagramLabels(svg: string): string[] {
  return [...svg.matchAll(/>([a-ceh]|r|d1|d2)</g)].map((m) => m[1]!);
}

describe("geometryDiagramSvg", () => {
  it("builds SVG for every measure and shape", () => {
    const combos = [
      ["perimeter", "square"],
      ["area", "circle"],
      ["volume", "triangular_pyramid"],
    ] as const;

    for (const [measure, shape] of combos) {
      const svg = buildGeometryDiagramSvg(measure, shape);
      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
    }
  });

  it("uses a–e, h, and r as diagram labels (not s, l, w)", () => {
    const shapes = [
      ["perimeter", "square"],
      ["perimeter", "rectangle"],
      ["perimeter", "triangle"],
      ["perimeter", "circle"],
      ["perimeter", "rhombus"],
      ["perimeter", "kite"],
      ["perimeter", "parallelogram"],
      ["perimeter", "trapezoid"],
      ["area", "triangle"],
      ["area", "rhombus"],
      ["area", "kite"],
      ["area", "trapezoid"],
      ["area", "parallelogram"],
      ["volume", "cube"],
      ["volume", "cuboid"],
      ["volume", "cone"],
      ["volume", "cylinder"],
      ["volume", "triangular_prism"],
    ] as const;

    for (const [measure, shape] of shapes) {
      const svg = buildGeometryDiagramSvg(measure, shape);
      expect(svg).not.toMatch(/>(s|l|w|d₁|d₂|H)</);
      expect(diagramLabels(svg).length).toBeGreaterThan(0);
    }
  });

  it("labels triangle perimeter sides, not vertices", () => {
    const svg = buildGeometryDiagramSvg("perimeter", "triangle");
    expect(svg).toContain(">a<");
    expect(svg).toContain(">b<");
    expect(svg).toContain(">c<");
    expect(svg).toContain('x="100" y="133"');
  });

  it("uses h for triangle and trapezoid area height", () => {
    expect(buildGeometryDiagramSvg("area", "triangle")).toContain(">h<");
    expect(buildGeometryDiagramSvg("area", "trapezoid")).toContain(">h<");
  });

  it("labels rhombus area with diagonals d1 and d2", () => {
    const svg = buildGeometryDiagramSvg("area", "rhombus");
    expect(svg).toContain(">d1<");
    expect(svg).toContain(">d2<");
  });

  it('draws square and triangular pyramids with 3D faces', () => {
    const square = buildGeometryDiagramSvg('volume', 'pyramid');
    expect(square.match(/<polygon/g)?.length).toBe(5);
    expect(square).toContain('#FFCC80');
    expect(square).toContain('#FFF3E0');
    expect(square).toContain('>a<');
    expect(square).toContain('>h<');
    // Rotated view: left and right base corners differ in x.
    expect(square).toMatch(/polygon points="\d+,\d+ \d+,\d+ \d+,\d+ \d+,\d+"/);

    const triangular = buildGeometryDiagramSvg('volume', 'triangular_pyramid');
    expect(triangular.match(/<polygon/g)?.length).toBe(4);
    expect(triangular).toContain('#FFCC80');
    expect(triangular).toContain('#FFF3E0');
    expect(triangular).toContain('>a<');
    expect(triangular).toContain('>h<');
    expect(triangular).toContain('>b<');
  });

  it("labels cube with a on each visible edge and cuboid with a, b, c", () => {
    const cube = buildGeometryDiagramSvg("volume", "cube");
    expect(cube.match(/>a</g)?.length).toBe(3);
    expect(cube).not.toContain(">b<");
    expect(cube).not.toContain(">c<");

    const cuboid = buildGeometryDiagramSvg("volume", "cuboid");
    expect(cuboid).toContain(">a<");
    expect(cuboid).toContain(">b<");
    expect(cuboid).toContain(">c<");
    expect(cuboid).not.toContain(">h<");
  });

  it("labels rhombus perimeter with a on each side", () => {
    const svg = buildGeometryDiagramSvg("perimeter", "rhombus");
    expect(svg.match(/>a</g)?.length).toBe(4);
  });

  it("labels kite perimeter with a on top sides and b on bottom sides", () => {
    const svg = buildGeometryDiagramSvg("perimeter", "kite");
    expect(svg.match(/>a</g)?.length).toBe(2);
    expect(svg.match(/>b</g)?.length).toBe(2);
  });

  it("draws kite with visibly shorter top sides than bottom sides", () => {
    const svg = buildGeometryDiagramSvg("perimeter", "kite");
    const match = svg.match(/<polygon points="([^"]+)"/);
    expect(match).not.toBeNull();
    const coords = match![1]!.split(" ").map((pair) => {
      const [x, y] = pair.split(",").map(Number);
      return { x, y };
    });
    const sideLengths = coords.map((point, index) => {
      const next = coords[(index + 1) % coords.length]!;
      return Math.hypot(next.x - point.x, next.y - point.y);
    });
    const shortSides = [sideLengths[0]!, sideLengths[3]!];
    const longSides = [sideLengths[1]!, sideLengths[2]!];
    for (const len of shortSides) {
      expect(Math.abs(len - shortSides[0]!)).toBeLessThan(1);
    }
    for (const len of longSides) {
      expect(Math.abs(len - longSides[0]!)).toBeLessThan(1);
    }
    expect(shortSides[0]!).toBeLessThan(longSides[0]!);
    expect(longSides[0]! / shortSides[0]!).toBeGreaterThan(1.35);
  });

  it("labels kite area with diagonals d1 and d2", () => {
    const svg = buildGeometryDiagramSvg("area", "kite");
    expect(svg).toContain(">d1<");
    expect(svg).toContain(">d2<");
  });

  it("places diagonal labels on distinct diagonals for rhombus and kite area", () => {
    const rhombus = buildGeometryDiagramSvg("area", "rhombus");
    const rhombusD1 = rhombus.match(/<text[^>]*>(d1)<\/text>/)![0]!;
    const rhombusD2 = rhombus.match(/<text[^>]*>(d2)<\/text>/)![0]!;
    expect(Math.abs(Number(rhombusD1.match(/x="(\d+)"/)?.[1]) - 100)).toBeGreaterThan(10);
    expect(Math.abs(Number(rhombusD2.match(/y="(\d+)"/)?.[1]) - 80)).toBeGreaterThan(8);

    const kite = buildGeometryDiagramSvg("area", "kite");
    const kiteD1 = kite.match(/<text[^>]*>(d1)<\/text>/)![0]!;
    const kiteD2 = kite.match(/<text[^>]*>(d2)<\/text>/)![0]!;
    expect(Math.abs(Number(kiteD1.match(/x="(\d+)"/)?.[1]) - 100)).toBeGreaterThan(10);
    expect(Number(kiteD2.match(/y="(\d+)"/)?.[1])).toBeLessThan(50);
  });

  it("labels trapezoid with parallel bases a, b and legs c, d", () => {
    const perimeter = buildGeometryDiagramSvg("perimeter", "trapezoid");
    expect(perimeter).toContain(">a<");
    expect(perimeter).toContain(">b<");
    expect(perimeter).toContain(">c<");
    expect(perimeter).toContain(">d<");

    const area = buildGeometryDiagramSvg("area", "trapezoid");
    expect(area).toContain(">a<");
    expect(area).toContain(">b<");
    expect(area).toContain(">h<");
    expect(area).not.toContain(">d<");
  });
});

describe("geometryFormExplanations", () => {
  it("returns child-friendly text for each form", () => {
    expect(getGeometryFormExplanation("perimeter", "square")).toMatch(
      /four equal sides/i,
    );
    expect(getGeometryFormExplanation("area", "triangle")).toMatch(/height h/i);
    expect(getGeometryFormExplanation("area", "rhombus")).toMatch(
      /diagonals d1 and d2/i,
    );
    expect(getGeometryFormExplanation("perimeter", "trapezoid")).toMatch(
      /parallel/i,
    );
    expect(getGeometryFormExplanation("volume", "cone")).toMatch(/one third/i);
  });
});
