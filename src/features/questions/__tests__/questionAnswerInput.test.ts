import type { MathQuestion } from '@/features/questions/question.types';
import {
  NUMBER_SENSE_KEYBOARD_INPUT,
  QUESTION_KEYBOARD_INPUT,
  keyboardAnswerIsReady,
  supportsKeyboardInput,
} from '@/features/questions/questionAnswerInput';

function makeQuestion(partial: Partial<MathQuestion> & Pick<MathQuestion, 'kind'>): MathQuestion {
  return partial as MathQuestion;
}

describe('questionAnswerInput', () => {
  describe('QUESTION_KEYBOARD_INPUT map', () => {
    it('documents every question kind', () => {
      const kinds = [
        'arithmetic',
        'equation_unknown',
        'equation_two_unknown',
        'geometry',
        'comparison',
        'equivalent_expression',
        'fraction_visual',
        'shape_recognition',
        'clock',
        'pattern',
        'calculus',
        'trigonometry',
        'number_sense',
      ] as const;
      for (const kind of kinds) {
        expect(QUESTION_KEYBOARD_INPUT[kind]).toBeDefined();
      }
    });
  });

  describe('NUMBER_SENSE_KEYBOARD_INPUT', () => {
    it('marks oddEven and compareQuantities as multiple-choice only', () => {
      expect(NUMBER_SENSE_KEYBOARD_INPUT.oddEven).toBe('multiple_choice_only');
      expect(NUMBER_SENSE_KEYBOARD_INPUT.compareQuantities).toBe('multiple_choice_only');
    });

    it('allows keyboard for numeric number-sense subtypes', () => {
      expect(NUMBER_SENSE_KEYBOARD_INPUT.countObjects).toBe('keyboard');
      expect(NUMBER_SENSE_KEYBOARD_INPUT.beforeAfter).toBe('keyboard');
      expect(NUMBER_SENSE_KEYBOARD_INPUT.missingNumber).toBe('keyboard');
    });
  });

  describe('supportsKeyboardInput', () => {
    it('allows keyboard for standard arithmetic', () => {
      expect(
        supportsKeyboardInput(
          makeQuestion({
            kind: 'arithmetic',
            id: '1',
            operation: 'addition',
            questionStyle: 'standard',
            answerKind: 'number',
            questionText: '1+1',
            correctAnswer: 2,
            answerOptions: [],
          }),
        ),
      ).toBe(true);
    });

    it('disallows keyboard for division remainders', () => {
      expect(
        supportsKeyboardInput(
          makeQuestion({
            kind: 'arithmetic',
            id: '1',
            operation: 'division',
            questionStyle: 'standard',
            answerKind: 'quotient_remainder',
            questionText: '7÷3',
            correctAnswer: 2,
            answerOptions: ['2 R1'],
          }),
        ),
      ).toBe(false);
    });

    it('disallows keyboard for odd/even number sense', () => {
      expect(
        supportsKeyboardInput(
          makeQuestion({
            kind: 'number_sense',
            id: '1',
            operation: 'number_sense',
            subtype: 'oddEven',
            questionText: 'Is 44 even or odd?',
            correctAnswer: 'Even',
            answerOptions: ['Even', 'Odd'],
            requiresMultipleChoice: true,
          }),
        ),
      ).toBe(false);
    });

    it('disallows keyboard for compare-quantities number sense', () => {
      expect(
        supportsKeyboardInput(
          makeQuestion({
            kind: 'number_sense',
            id: '1',
            operation: 'number_sense',
            subtype: 'compareQuantities',
            questionText: 'Which group has more?',
            correctAnswer: 'Group A',
            answerOptions: ['Group A', 'Group B', 'Same'],
            requiresMultipleChoice: true,
          }),
        ),
      ).toBe(false);
    });

    it('allows keyboard for before/after number sense', () => {
      expect(
        supportsKeyboardInput(
          makeQuestion({
            kind: 'number_sense',
            id: '1',
            operation: 'number_sense',
            subtype: 'beforeAfter',
            questionText: 'What comes after 5?',
            correctAnswer: '6',
            answerOptions: ['4', '5', '6', '7'],
            requiresMultipleChoice: false,
          }),
        ),
      ).toBe(true);
    });

    it('allows keyboard for visual fraction questions', () => {
      expect(
        supportsKeyboardInput(
          makeQuestion({
            kind: 'fraction_visual',
            id: 'fraction-visual-1',
            operation: 'fraction_visual',
            model: 'circle',
            shaded: { numerator: 4, denominator: 5 },
            questionText: 'What fraction is shaded?',
            correctAnswer: '4/5',
            answerOptions: ['2/5', '4/5', '1/2', '9/10'],
            requiresMultipleChoice: false,
          }),
        ),
      ).toBe(true);
    });

    it('respects geometry requiresMultipleChoice flag', () => {
      expect(
        supportsKeyboardInput(
          makeQuestion({
            kind: 'geometry',
            id: '1',
            operation: 'geometry',
            measure: 'area',
            shape: 'rectangle',
            subtype: 'formula',
            answerKind: 'formula',
            questionText: 'Area formula?',
            correctAnswer: 'A = l × w',
            answerOptions: ['A = l × w', 'A = 2(l+w)'],
            requiresMultipleChoice: true,
            dimensions: { length: 4, width: 5 },
          }),
        ),
      ).toBe(false);

      expect(
        supportsKeyboardInput(
          makeQuestion({
            kind: 'geometry',
            id: '2',
            operation: 'geometry',
            measure: 'area',
            shape: 'rectangle',
            subtype: 'calculate',
            answerKind: 'number',
            questionText: 'Area?',
            correctAnswer: 20,
            answerOptions: ['18', '20', '22'],
            requiresMultipleChoice: false,
            dimensions: { length: 4, width: 5 },
          }),
        ),
      ).toBe(true);
    });

    it('disallows keyboard for comparison questions', () => {
      expect(
        supportsKeyboardInput(
          makeQuestion({
            kind: 'comparison',
            id: '1',
            operation: 'comparison',
            subtype: 'relational',
            questionText: '3 __ 5',
            correctAnswer: '<',
            answerOptions: ['<', '>', '='],
            requiresMultipleChoice: true,
          }),
        ),
      ).toBe(false);
    });
  });

  describe('keyboardAnswerIsReady', () => {
    it('accepts a complete fraction for a visual fraction question', () => {
      const question = makeQuestion({
        kind: 'fraction_visual',
        id: 'fraction-visual-ready',
        operation: 'fraction_visual',
        model: 'bar',
        shaded: { numerator: 3, denominator: 4 },
        questionText: 'What fraction is shaded?',
        correctAnswer: '3/4',
        answerOptions: ['1/4', '2/4', '3/4', '4/4'],
        requiresMultipleChoice: false,
      });

      expect(keyboardAnswerIsReady(question, '3/')).toBe(false);
      expect(keyboardAnswerIsReady(question, '3/4')).toBe(true);
    });

    it('enables numeric number-sense questions when a valid answer is typed', () => {
      const question = makeQuestion({
        kind: 'number_sense',
        id: 'before-17',
        operation: 'number_sense',
        subtype: 'beforeAfter',
        questionText: 'What number comes before 17?',
        correctAnswer: '16',
        answerOptions: ['15', '16', '17', '18'],
        requiresMultipleChoice: false,
      });

      expect(keyboardAnswerIsReady(question, '')).toBe(false);
      expect(keyboardAnswerIsReady(question, '16')).toBe(true);
    });
  });
});
