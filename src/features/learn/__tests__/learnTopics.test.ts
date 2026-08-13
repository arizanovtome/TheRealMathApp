import {
  getAllLearnTopicIds,
  getLearnTopic,
  LEARN_TOPIC_ORDER,
  LEARN_TOPICS,
} from '@/features/learn/learnTopics';
import {
  LEARN_TOPIC_ID_BY_OPERATION,
  LEARN_TOPIC_IDS_EASIEST_TO_HARDEST,
} from '@/constants/topicOrder';

describe('learnTopics', () => {
  it('registry includes all expected topics', () => {
    expect(LEARN_TOPICS.length).toBeGreaterThanOrEqual(10);
    expect(getAllLearnTopicIds()).toContain('addition');
    expect(getAllLearnTopicIds()).toContain('geometry');
    expect(getAllLearnTopicIds()).toContain('trigonometry');
    expect(getAllLearnTopicIds()).toContain('comparison');
    expect(getAllLearnTopicIds()).toContain('equivalent_expressions');
    expect(getAllLearnTopicIds()).toContain('shapes');
  });

  it('documents every equivalent-expression subtype and updated order of operations', () => {
    const equivalent = getLearnTopic('equivalent_expressions');
    const equivalentText = JSON.stringify(equivalent);
    expect(equivalent?.tryInPractice).toEqual({
      kind: 'operation',
      operation: 'equivalent_expressions',
    });
    expect(equivalentText).toContain('(a + b)²');
    expect(equivalentText).toContain('(a − b)²');
    expect(equivalentText).toContain('100 − (50 + 20)');
    expect(equivalentText).toContain('a(b + c)');
    expect(equivalentText).toContain('a² − b²');
    expect(equivalentText).toContain('Factorization');

    const order = getLearnTopic('order_of_operations');
    const orderText = JSON.stringify(order);
    expect(orderText).toContain('4²');
    expect(orderText).toContain('√16');
  });

  it('lists topics easiest to hardest', () => {
    expect(getAllLearnTopicIds()).toEqual([...LEARN_TOPIC_IDS_EASIEST_TO_HARDEST]);
    expect(LEARN_TOPICS.map((t) => t.id)).toEqual([...LEARN_TOPIC_ORDER]);
    expect(LEARN_TOPICS[0]?.id).toBe('shapes');
    expect(LEARN_TOPICS.at(-1)?.id).toBe('integration');
    expect(getAllLearnTopicIds()).toContain('differentiation');
  });

  it('keeps every mapped question operation connected to a Learn topic', () => {
    const ids = new Set(getAllLearnTopicIds());
    for (const topicId of Object.values(LEARN_TOPIC_ID_BY_OPERATION)) {
      expect(ids.has(topicId)).toBe(true);
    }
  });

  it('getLearnTopic returns content for valid id', () => {
    const t = getLearnTopic('addition');
    expect(t?.title).toBe('Addition');
    expect(t?.sections.length).toBeGreaterThan(0);
  });

  it('returns undefined for unknown id', () => {
    expect(getLearnTopic('not-a-topic')).toBeUndefined();
  });
});
