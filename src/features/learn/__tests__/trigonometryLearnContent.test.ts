import {
  buildTrigonometryCommonValuesTable,
  buildTrigonometryFormulaTables,
} from '@/features/learn/trigonometryLearnContent';
import { getLearnTopic } from '@/features/learn/learnTopics';

describe('trigonometryLearnContent', () => {
  it('includes common sin and cos values for special angles', () => {
    const table = buildTrigonometryCommonValuesTable();
    expect(table.rows.map((row) => row.shape)).toEqual(['30°', '45°', '60°', '90°']);
    expect(table.rows[0]?.formula).toContain('sin 30° = 1/2');
    expect(table.rows[0]?.formula).toContain('cos 30° = √3/2');
    expect(table.rows[1]?.formula).toContain('√2/2');
    expect(table.rows[3]?.formula).toContain('sin 90° = 1');
    expect(table.rows[3]?.formula).toContain('cos 90° = 0');
  });

  it('wires both formula tables into the learn topic', () => {
    const tables = buildTrigonometryFormulaTables();
    expect(tables).toHaveLength(2);
    expect(tables[0]?.heading).toContain('SOH-CAH-TOA');
    expect(tables[1]?.heading).toContain('Common sin & cos');

    const topic = getLearnTopic('trigonometry');
    expect(topic?.formulaTables).toHaveLength(2);
    expect(topic?.sections.some((s) => s.heading === 'Special angles')).toBe(true);
  });
});
