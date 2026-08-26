import { buildDifferentiationFormulaTables } from '@/features/learn/calculusLearnContent';
import { getLearnTopic } from '@/features/learn/learnTopics';

describe('calculusLearnContent', () => {
  it('includes the quotient rule formula table on differentiation', () => {
    const tables = buildDifferentiationFormulaTables();
    expect(tables[0]?.heading).toContain('Quotient rule');
    expect(tables[0]?.rows[0]?.formula).toContain("(f/g)'");
    expect(tables[0]?.intro).toMatch(/Low d-High/i);
  });

  it('wires formula tables into the differentiation learn topic', () => {
    const topic = getLearnTopic('differentiation');
    expect(topic?.formula).toBeUndefined();
    expect(topic?.formulaTables?.length).toBeGreaterThan(0);
    expect(topic?.formulaTables?.[0]?.rows[0]?.formula).toContain("(f/g)'");
  });
});
