import {
  getAllLearnTopicIds,
  getLearnTopic,
  LEARN_TOPIC_ORDER,
  LEARN_TOPICS,
} from '@/features/learn/learnTopics';
import {
  CURRICULUM_SECTION_IDS_EASIEST_TO_HARDEST,
  LEARN_TOPIC_ID_BY_OPERATION,
  LEARN_TOPIC_IDS_EASIEST_TO_HARDEST,
} from '@/constants/topicOrder';

describe('learnTopics', () => {
  it('registry includes all expected topics', () => {
    expect(LEARN_TOPICS.length).toBeGreaterThanOrEqual(10);
    expect(getAllLearnTopicIds()).toContain('addition');
    expect(getAllLearnTopicIds()).toContain('geometry');
    expect(getAllLearnTopicIds()).toContain('trigonometry');
    expect(getAllLearnTopicIds()).toContain('logarithm');
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
    expect(getAllLearnTopicIds()).toEqual([...CURRICULUM_SECTION_IDS_EASIEST_TO_HARDEST]);
    expect(getAllLearnTopicIds()).not.toContain('equations_x');
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

  it.each(['en', 'mk'] as const)('provides complete contextual learning content in %s', (locale) => {
    for (const id of LEARN_TOPIC_ORDER) {
      const topic = getLearnTopic(id, locale);
      expect(topic?.introduction?.heading).toBeTruthy();
      expect(topic?.introduction?.body).toBeTruthy();
      expect(topic?.mathUses?.heading).toBeTruthy();
      expect(topic?.mathUses?.body).toBeTruthy();
      expect(topic?.realLifeUses?.heading).toBeTruthy();
      expect(topic?.realLifeUses?.body).toBeTruthy();
      expect(topic?.sections.some((section) => section.example || section.examples?.length)).toBe(true);
      expect(topic?.tryInPractice).toBeTruthy();
    }
  });

  it('places examples beside their concepts from simpler to more complex', () => {
    const fractions = getLearnTopic('fractions');
    expect(fractions?.examples).toBeUndefined();
    expect(fractions?.sections[0]?.heading).toBe('Parts of a whole');
    expect(fractions?.sections[0]?.examples?.[0]?.prompt).toContain('fraction is shaded');
    expect(fractions?.sections[1]?.heading).toBe('Adding fractions');
    expect(fractions?.sections[1]?.examples?.[0]?.prompt).toContain('1/4 + 2/4');

    const equivalent = getLearnTopic('equivalent_expressions');
    expect(equivalent?.sections.map((section) => section.heading)).toEqual([
      'Removing parentheses',
      'Distribution and factorization',
      'Squares of binomials',
      'Difference of squares',
    ]);

    const differentiation = getLearnTopic('differentiation');
    expect(differentiation?.sections.map((section) => section.heading)).toEqual([
      'What is a derivative?',
      'Same idea, different notation',
      'Power rule',
      'Constants',
      'Sums',
      'Natural log',
      'Trigonometric functions',
      'Quotient rule (division rule)',
    ]);
    expect(differentiation?.sections[2]?.examples?.[0]?.prompt).toBe("(x²)' = ?");
    expect(differentiation?.sections[7]?.examples?.[0]?.prompt).toContain('2x/(x + 3)');
  });

  it('keeps localized examples attached to matching Macedonian sections', () => {
    const comparison = getLearnTopic('comparison', 'mk');
    expect(comparison?.sections[0]?.examples?.[0]?.prompt).toBe('7 __ 12');
    expect(comparison?.sections[1]?.examples?.[0]?.prompt).toContain('3 + 4');
    expect(comparison?.sections[2]?.examples?.[0]?.prompt).toContain('3/4');

    const clock = getLearnTopic('clock', 'mk');
    expect(clock?.sections[0]?.examples?.[0]?.prompt).toContain('3:30');
    expect(clock?.sections[1]?.examples?.[0]?.prompt).toContain('2:15');
  });

  it('documents every Limits subtype with an adjacent example and applications', () => {
    const limits = getLearnTopic('limits');
    const practicedSections = limits?.sections.slice(0, 4) ?? [];
    expect(practicedSections.map((section) => section.heading)).toEqual([
      'Direct substitution',
      'Factor and cancel',
      'Limits at infinity',
      'Rationalization (limits with roots)',
    ]);
    expect(practicedSections.every((section) => section.example)).toBe(true);
    expect(practicedSections.every((section) => section.example?.limitExpression)).toBe(true);
    expect(practicedSections.every((section) => section.example?.solutionSteps?.length)).toBe(true);
    expect(practicedSections.every((section) => section.example?.solutionSteps?.some((step) => step.fraction))).toBe(true);
    expect(practicedSections[3]?.example?.solutionFraction).toEqual({ numerator: 1, denominator: 2 });
    expect(limits?.mathUses?.heading).toContain('mathematics');
    expect(limits?.realLifeUses?.heading).toContain('real life');
    const mkLimits = getLearnTopic('limits', 'mk');
    expect(mkLimits?.mathUses?.heading).toContain('математиката');
    expect(mkLimits?.realLifeUses?.heading).toContain('реалниот живот');
    expect(mkLimits?.sections.slice(0, 4).every((section) => section.example?.limitExpression)).toBe(true);
    expect(mkLimits?.sections.slice(0, 4).every((section) => section.example?.solutionSteps?.length)).toBe(true);
  });

  it('returns undefined for unknown id', () => {
    expect(getLearnTopic('not-a-topic')).toBeUndefined();
  });

  it('applies Macedonian overrides for numbers topic', () => {
    const numbers = getLearnTopic('numbers', 'mk');
    expect(numbers?.title).toBe('Броеви');
    expect(numbers?.summary).toContain('парни');
  });

  it('applies Macedonian overrides for multiplication topic with tables', () => {
    const multiplication = getLearnTopic('multiplication', 'mk');
    expect(multiplication?.title).toBe('Множење');
    expect(multiplication?.sections.some((s) => s.body.includes('повторено собирање'))).toBe(true);
    expect(multiplication?.formulaTables).toHaveLength(10);
    expect(multiplication?.formulaTables?.[2]?.heading).toBe('Таблица за 3');
  });
});
