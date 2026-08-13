import { buildTrigonometryDiagramSvg, getTrigonometryDiagramLayout, TRIG_DIAGRAM_SIZE } from '@/features/trigonometry/trigonometryDiagramLayout';

describe('trigonometryDiagramSvg', () => {
  it('builds svg with theta and unknown marker', () => {
    const svg = buildTrigonometryDiagramSvg({
      thetaCorner: 'bottom_left',
      unknown: 'opposite',
      knownValues: { hypotenuse: 13, adjacent: 5 },
    });
    expect(svg).toContain('<svg');
    expect(svg).toContain('θ');
    expect(svg).toContain('?');
    expect(svg).toContain('13');
    expect(svg).toContain('5');
  });

  it('builds svg for name-side highlight', () => {
    const svg = buildTrigonometryDiagramSvg({
      thetaCorner: 'bottom_left',
      highlightedSide: 'adjacent',
    });
    expect(svg).toContain('#FF8A00');
  });

  it('shows ? at angle when finding θ', () => {
    const svg = buildTrigonometryDiagramSvg({
      thetaCorner: 'bottom_left',
      unknown: 'angle',
      knownValues: { opposite: 8, hypotenuse: 10 },
    });
    expect(svg).toContain('>?<');
    expect(svg).toContain('8');
    expect(svg).toContain('10');
  });

  it('shows known angle degrees when finding a side', () => {
    const svg = buildTrigonometryDiagramSvg({
      thetaCorner: 'bottom_left',
      unknown: 'hypotenuse',
      knownValues: { adjacent: 3 },
      knownAngleDegrees: 42,
    });
    expect(svg).toContain('42°');
    expect(svg).toContain('3');
    expect(svg).toContain('?');
    expect(svg).not.toContain('>θ<');
  });

  it('shows both leg labels for find-angle with opposite and adjacent', () => {
    const svg = buildTrigonometryDiagramSvg({
      thetaCorner: 'bottom_left',
      unknown: 'angle',
      knownValues: { opposite: 3, adjacent: 11 },
    });
    expect(svg).toContain('3');
    expect(svg).toContain('11');
  });

  it('places the adjacent side label below the base', () => {
    const layout = getTrigonometryDiagramLayout({
      thetaCorner: 'bottom_left',
      unknown: 'hypotenuse',
      knownValues: { adjacent: 4 },
      knownAngleDegrees: 44,
    });
    const adjacent = layout.sideLabels.find((label) => label.role === 'adjacent');
    expect(adjacent?.text).toBe('4');
    expect(adjacent?.position.y).toBeGreaterThan(172);
  });

  it('keeps side labels inside the diagram bounds', () => {
    const layout = getTrigonometryDiagramLayout({
      thetaCorner: 'bottom_left',
      unknown: 'angle',
      knownValues: { opposite: 3, adjacent: 11 },
    });
    for (const label of layout.sideLabels) {
      expect(label.position.x).toBeGreaterThanOrEqual(8);
      expect(label.position.x).toBeLessThanOrEqual(TRIG_DIAGRAM_SIZE - 8);
      expect(label.position.y).toBeGreaterThanOrEqual(8);
      expect(label.position.y).toBeLessThanOrEqual(TRIG_DIAGRAM_SIZE - 8);
    }
  });
});
