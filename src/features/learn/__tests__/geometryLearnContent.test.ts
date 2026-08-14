import { buildGeometryFormulaTables } from '@/features/learn/geometryLearnContent';
import { getLearnTopic } from '@/features/learn/learnTopics';
import { i18n } from '@/i18n';

describe('geometryLearnContent', () => {
  it('lists every shape formula used in questions', () => {
    const tables = buildGeometryFormulaTables('en');
    expect(tables).toHaveLength(3);

    const perimeter = tables.find((t) => t.heading === 'Perimeter')!;
    expect(perimeter.rows.map((r) => r.shape)).toEqual([
      'Square',
      'Rectangle',
      'Triangle',
      'Circle',
      'Rhombus',
      'Kite',
      'Parallelogram',
      'Trapezoid',
    ]);
    expect(perimeter.rows.find((r) => r.shape === 'Circle')?.formula).toContain('π');

    const area = tables.find((t) => t.heading === 'Area')!;
    expect(area.rows).toHaveLength(8);
    expect(area.rows.some((r) => r.shape === 'Parallelogram')).toBe(true);

    const volume = tables.find((t) => t.heading === 'Volume')!;
    expect(volume.rows).toHaveLength(7);
    expect(volume.rows.map((r) => r.shape)).toEqual([
      'Cube',
      'Cuboid',
      'Square pyramid',
      'Triangular pyramid',
      'Cone',
      'Cylinder',
      'Triangular prism',
    ]);
    expect(volume.rows.find((r) => r.shape === 'Cone')?.hint).toBeTruthy();
  });

  it('localizes geometry formula tables for Macedonian', async () => {
    try {
      await i18n.changeLanguage('mk');
      const tables = buildGeometryFormulaTables('mk');
      expect(tables.map((t) => t.heading)).toEqual(['Обиколка', 'Плоштина', 'Волумен']);
      expect(tables[0]?.rows[0]?.shape).toBe('Квадрат');
      expect(tables[1]?.rows.find((r) => r.shape === 'Квадрат')?.formula).toBe('страна × страна');
      expect(tables[0]?.intro).toMatch(/Обиколката/);
    } finally {
      await i18n.changeLanguage('en');
    }
  });

  it('geometry tutorial includes formula tables', () => {
    const tutorial = getLearnTopic('geometry');
    expect(tutorial?.formulaTables?.length).toBe(3);
    const totalRows =
      tutorial?.formulaTables?.reduce((n, t) => n + t.rows.length, 0) ?? 0;
    expect(totalRows).toBe(23);
  });

  it('each geometry row has an explanation and diagram', () => {
    const tables = buildGeometryFormulaTables('en');
    const rows = tables.flatMap((t) => t.rows);
    expect(rows.every((r) => r.explanation && r.explanation.length > 10)).toBe(true);
    expect(rows.every((r) => r.diagram?.measure && r.diagram?.shape)).toBe(true);
  });
});
