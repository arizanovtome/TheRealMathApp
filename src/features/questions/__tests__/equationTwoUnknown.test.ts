import { getRecommendedLearningPlan } from '@/features/learning-plan/recommendedLearningPlan';
import {
  finalizeEquationTwoUnknownQuestion,
  generateEquationTwoUnknownQuestion,
  parseSolveForFromQuestionText,
} from '@/features/questions/equationTwoUnknown';

describe('equationTwoUnknown', () => {
  const base = getRecommendedLearningPlan(10);
  const config = {
    ...base,
    equationTwoUnknowns: {
      enabled: true,
      operators: {
        addition: true,
        subtraction: true,
        multiplication: true,
        division: true,
      },
    },
  };

  function assertTwoEquationSystem(
    draft: NonNullable<ReturnType<typeof generateEquationTwoUnknownQuestion>>,
  ) {
    expect(draft.questionText).not.toMatch(/,\s*y\s*=\s*\d+/);
    const lines = draft.questionText.split('\n');
    expect(lines.length).toBe(3);
    expect(lines[0]).toMatch(/x.*y\s*=/);
    expect(lines[1]).toMatch(/x.*y\s*=/);
    expect(lines[2]).toMatch(/Find [xy]\./);

    const solveFor = parseSolveForFromQuestionText(draft.questionText)!;
    const sumMatch = /^x \+ y = (-?\d+)$/.exec(lines[0]!);
    const diffMatch = /^x − y = (-?\d+)$/.exec(lines[0]!);
    const prodMatch = /^x × y = (-?\d+)$/.exec(lines[0]!);
    const divMatch = /^x ÷ y = (-?\d+)$/.exec(lines[0]!);

    if (sumMatch && /^x − y = (-?\d+)$/.exec(lines[1]!)) {
      const s = Number(sumMatch[1]);
      const d = Number(/^x − y = (-?\d+)$/.exec(lines[1]!)![1]);
      const x = (s + d) / 2;
      const y = (s - d) / 2;
      expect(Number.isInteger(x)).toBe(true);
      expect(Number.isInteger(y)).toBe(true);
      expect(draft.correctAnswer).toBe(solveFor === 'x' ? x : y);
      return;
    }

    if (diffMatch && /^x \+ y = (-?\d+)$/.exec(lines[1]!)) {
      const d = Number(diffMatch[1]);
      const s = Number(/^x \+ y = (-?\d+)$/.exec(lines[1]!)![1]);
      const x = (s + d) / 2;
      const y = (s - d) / 2;
      expect(Number.isInteger(x)).toBe(true);
      expect(Number.isInteger(y)).toBe(true);
      expect(draft.correctAnswer).toBe(solveFor === 'x' ? x : y);
      return;
    }

    if (prodMatch && /^x − y = (-?\d+)$/.exec(lines[1]!)) {
      const p = Number(prodMatch[1]);
      const d = Number(/^x − y = (-?\d+)$/.exec(lines[1]!)![1]);
      const x = (d + Math.sqrt(d * d + 4 * p)) / 2;
      const y = x - d;
      expect(Number.isInteger(x)).toBe(true);
      expect(Number.isInteger(y)).toBe(true);
      expect(x * y).toBe(p);
      expect(x - y).toBe(d);
      expect(draft.correctAnswer).toBe(solveFor === 'x' ? x : y);
      return;
    }

    if (prodMatch && /^x \+ y = (-?\d+)$/.exec(lines[1]!)) {
      throw new Error('Product + sum systems are ambiguous; use x − y instead');
    }

    if (divMatch && /^x \+ y = (-?\d+)$/.exec(lines[1]!)) {
      const q = Number(divMatch[1]);
      const s = Number(/^x \+ y = (-?\d+)$/.exec(lines[1]!)![1]);
      expect(q).toBeGreaterThan(0);
      expect(s).toBeGreaterThan(q);
      return;
    }

    throw new Error(`Unrecognized equation system: ${draft.questionText}`);
  }

  it.each(['addition', 'subtraction', 'multiplication', 'division'] as const)(
    'generates a two-equation system for %s',
    (operation) => {
      const draft = generateEquationTwoUnknownQuestion(config, operation);
      expect(draft).not.toBeNull();
      assertTwoEquationSystem(draft!);
      const finalized = finalizeEquationTwoUnknownQuestion(config, {
        ...draft!,
        id: 'test',
      });
      expect(finalized).not.toBeNull();
      expect(finalized!.answerOptions.length).toBeGreaterThanOrEqual(2);
    },
  );

  it('multiplication systems have a unique solution for the asked variable', () => {
    for (let i = 0; i < 40; i++) {
      const draft = generateEquationTwoUnknownQuestion(config, 'multiplication');
      expect(draft).not.toBeNull();
      assertTwoEquationSystem(draft!);
      expect(draft!.questionText).not.toMatch(/x \+ y =/);
    }
  });

  it('keyboard mode has no MC options', () => {
    const draft = generateEquationTwoUnknownQuestion(config, 'multiplication');
    expect(draft).not.toBeNull();
    const finalized = finalizeEquationTwoUnknownQuestion(
      { ...config, answerEntryMode: 'keyboard' },
      { ...draft!, id: 'test' },
    );
    expect(finalized!.answerOptions).toEqual([]);
  });
});
