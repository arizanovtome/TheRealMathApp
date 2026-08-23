import { buildMultiplicationFormulaTables } from '@/features/learn/multiplicationLearnContent';
import { getLearnTopic } from '@/features/learn/learnTopics';
import { i18n } from '@/i18n';

describe('multiplicationLearnContent', () => {
  it('builds ten multiplication tables with ten rows each', () => {
    const tables = buildMultiplicationFormulaTables('en');
    expect(tables).toHaveLength(10);
    expect(tables.map((t) => t.heading)).toEqual([
      'Table of 1',
      'Table of 2',
      'Table of 3',
      'Table of 4',
      'Table of 5',
      'Table of 6',
      'Table of 7',
      'Table of 8',
      'Table of 9',
      'Table of 10',
    ]);

    for (const table of tables) {
      expect(table.rows).toHaveLength(10);
      expect(table.intro).toMatch(/Multiplying \d+ by each number from 1 to 10\./);
    }

    const tableOf3 = tables[2]!;
    expect(tableOf3.rows.map((r) => r.formula)).toEqual([
      '3 × 1 = 3',
      '3 × 2 = 6',
      '3 × 3 = 9',
      '3 × 4 = 12',
      '3 × 5 = 15',
      '3 × 6 = 18',
      '3 × 7 = 21',
      '3 × 8 = 24',
      '3 × 9 = 27',
      '3 × 10 = 30',
    ]);
  });

  it('localizes multiplication tables for Macedonian', async () => {
    try {
      await i18n.changeLanguage('mk');
      const tables = buildMultiplicationFormulaTables('mk');
      expect(tables[0]?.heading).toBe('Таблица за 1');
      expect(tables[2]?.heading).toBe('Таблица за 3');
      expect(tables[2]?.intro).toMatch(/Множење на 3/);
    } finally {
      await i18n.changeLanguage('en');
    }
  });

  it('injects multiplication tables through getLearnTopic', () => {
    const multiplication = getLearnTopic('multiplication', 'en');
    expect(multiplication?.formulaTables).toHaveLength(10);
    expect(multiplication?.sections.some((s) => s.body.includes('repeated addition'))).toBe(true);
  });
});
