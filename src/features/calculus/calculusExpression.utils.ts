import {
  calculusAnswersMatch,
  formatCoefficientTimesPower,
  formatCoefficientTimesTrig,
  formatDerivativePowerAnswer,
  formatDerivativePowerQuotientAnswer,
  formatDerivativeQuotientAnswer,
  formatDerivativeTrigAnswer,
  formatDifferentiationQuotientAnswer,
  formatDifferentiationQuotientExpression,
  formatIntegralConstantAnswer,
  formatIntegralPowerAnswer,
  formatIntegralQuotientAnswer,
  formatIntegralTrigAnswer,
  formatPower,
  formatQuotientFraction,
  formatShiftedLinear,
  formatTrigFn,
  type DifferentiationQuotientSpec,
  type TrigFn,
} from '@/features/calculus/calculusFormat';
import {
  CALCULUS_COEFFICIENT_MAX,
  CALCULUS_COEFFICIENT_MIN,
  CALCULUS_CONSTANT_MAX,
  CALCULUS_CONSTANT_MIN,
  CALCULUS_POWER_MAX,
  CALCULUS_POWER_MIN,
} from '@/features/calculus/calculus.types';
import { pickRandom, randomIntInclusive } from '@/utils/random';

export type PowerTerm = { coefficient: number; exponent: number };

export function randomPowerExponent(): number {
  return randomIntInclusive(CALCULUS_POWER_MIN, CALCULUS_POWER_MAX);
}

export function randomCoefficient(): number {
  return randomIntInclusive(CALCULUS_COEFFICIENT_MIN, CALCULUS_COEFFICIENT_MAX);
}

export function randomConstant(): number {
  return randomIntInclusive(CALCULUS_CONSTANT_MIN, CALCULUS_CONSTANT_MAX);
}

export function formatSumExpression(terms: PowerTerm[]): string {
  return terms
    .map((t, i) => {
      const part =
        t.coefficient === 1
          ? formatPower('x', t.exponent)
          : formatCoefficientTimesPower(t.coefficient, t.exponent);
      if (i === 0) return part;
      return ` + ${part}`;
    })
    .join('');
}

export function derivativeOfSum(terms: PowerTerm[]): string {
  const parts = terms.map((t) => formatDerivativePowerAnswer(t.coefficient, t.exponent));
  if (parts.length === 1) return parts[0]!;
  return parts.join(' + ');
}

export function integralOfSum(terms: PowerTerm[]): string {
  const parts = terms.map((t) => {
    const inner = formatIntegralPowerAnswer(t.coefficient, t.exponent);
    return inner.replace(' + C', '');
  });
  return `${parts.join(' + ')} + C`;
}

export function buildCalculusMcOptions(
  correct: string,
  distractors: string[],
  count: number,
): string[] {
  const pool = new Set<string>();
  for (const d of distractors) {
    if (!calculusAnswersMatch(d, correct)) pool.add(d);
  }
  const options = [correct];
  const available = [...pool];
  while (options.length < count && available.length > 0) {
    const idx = randomIntInclusive(0, available.length - 1);
    options.push(available.splice(idx, 1)[0]!);
  }
  while (options.length < count) {
    options.push(`${randomIntInclusive(1, 9)}x + C`);
  }
  return options.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export function powerRuleDistractors(coefficient: number, exponent: number): string[] {
  const correct = formatDerivativePowerAnswer(coefficient, exponent);
  return [
    correct,
    formatDerivativePowerAnswer(coefficient, exponent + 1),
    formatDerivativePowerAnswer(coefficient, Math.max(1, exponent - 1)),
    formatCoefficientTimesPower(coefficient, exponent),
    formatDerivativePowerAnswer(1, exponent),
    '0',
  ];
}

export function integralPowerDistractors(coefficient: number, exponent: number): string[] {
  const correct = formatIntegralPowerAnswer(coefficient, exponent);
  return [
    correct,
    formatIntegralPowerAnswer(coefficient, exponent - 1),
    formatIntegralPowerAnswer(coefficient, exponent + 1),
    formatDerivativePowerAnswer(coefficient, exponent),
    formatCoefficientTimesPower(coefficient, exponent + 1),
    `${formatPower('x', exponent + 1)} + C`,
  ];
}

export function pickRandomPowerTerm(): PowerTerm {
  return { coefficient: randomCoefficient(), exponent: randomPowerExponent() };
}

export function pickDistinctPowerTerms(count: number): PowerTerm[] {
  const terms: PowerTerm[] = [];
  for (let attempt = 0; attempt < 40 && terms.length < count; attempt++) {
    const t = pickRandomPowerTerm();
    if (terms.some((x) => x.exponent === t.exponent)) continue;
    terms.push(t);
  }
  if (terms.length < count) {
    for (let e = CALCULUS_POWER_MIN; e <= CALCULUS_POWER_MAX && terms.length < count; e++) {
      if (!terms.some((t) => t.exponent === e)) {
        terms.push({ coefficient: randomCoefficient(), exponent: e });
      }
    }
  }
  return terms.sort((a, b) => b.exponent - a.exponent);
}

export function pickRandomTrigFn(): TrigFn {
  return pickRandom(['sin', 'cos'] as const);
}

export function pickDifferentiationQuotientSpec(): DifferentiationQuotientSpec {
  const kind = pickRandom([
    'x_over_shift',
    'kx_over_shift',
    'k_over_shift',
  ] as const);
  const shift = randomIntInclusive(1, 5);
  switch (kind) {
    case 'x_over_shift':
      return { kind, shift };
    case 'kx_over_shift':
      return { kind, coeff: randomCoefficient(), shift };
    case 'k_over_shift':
      return { kind, coeff: randomConstant(), shift };
  }
}

/** Power over power — only for integration (simplify first, then integrate). */
export function pickIntegrationFractionTerms(): {
  numeratorCoeff: number;
  numeratorExp: number;
  denominatorExp: number;
} {
  const denominatorExp = randomIntInclusive(1, CALCULUS_POWER_MAX - 1);
  const numeratorExp = randomIntInclusive(
    denominatorExp + 1,
    CALCULUS_POWER_MAX + 1,
  );
  return {
    numeratorCoeff: randomCoefficient(),
    numeratorExp,
    denominatorExp,
  };
}

export function trigDerivativeDistractors(fn: TrigFn, coefficient = 1): string[] {
  const correct = formatDerivativeTrigAnswer(fn, coefficient);
  const otherFn: TrigFn = fn === 'sin' ? 'cos' : 'sin';
  return [
    correct,
    formatDerivativeTrigAnswer(otherFn, coefficient),
    formatDerivativeTrigAnswer(fn, -coefficient),
    formatCoefficientTimesTrig(coefficient, fn),
    formatTrigFn(fn),
    '0',
    '1',
  ];
}

export function trigIntegralDistractors(fn: TrigFn, coefficient = 1): string[] {
  const correct = formatIntegralTrigAnswer(fn, coefficient);
  const otherFn: TrigFn = fn === 'sin' ? 'cos' : 'sin';
  return [
    correct,
    formatIntegralTrigAnswer(otherFn, coefficient),
    formatIntegralTrigAnswer(fn, -coefficient),
    formatDerivativeTrigAnswer(fn, coefficient) + ' + C',
    formatCoefficientTimesTrig(coefficient, fn) + ' + C',
    '0',
  ];
}

export function differentiationQuotientDistractors(
  spec: DifferentiationQuotientSpec,
): string[] {
  const correct = formatDifferentiationQuotientAnswer(spec);
  const den = formatShiftedLinear(spec.shift);
  const wrongDen = formatShiftedLinear(spec.shift + 1);
  switch (spec.kind) {
    case 'x_over_shift':
      return [
        correct,
        `${spec.shift}/(${wrongDen})²`,
        `1/(${den})²`,
        `${spec.shift + 1}/(${den})²`,
        '0',
        `x/(${den})²`,
      ];
    case 'kx_over_shift':
      return [
        correct,
        `${spec.coeff}/(${den})²`,
        `${spec.coeff * spec.shift + 1}/(${den})²`,
        `${spec.coeff * spec.shift}/(${wrongDen})²`,
        formatCoefficientTimesPower(spec.coeff, 1),
        '0',
      ];
    case 'k_over_shift':
      return [
        correct,
        `${spec.coeff}/(${den})²`,
        `${-spec.coeff - 1}/(${den})²`,
        `${-spec.coeff}/(${wrongDen})²`,
        `${spec.coeff}x/(${den})²`,
        '0',
      ];
  }
}

export function quotientDerivativeDistractors(
  numeratorCoeff: number,
  numeratorExp: number,
  denominatorExp: number,
): string[] {
  const correct = formatDerivativePowerQuotientAnswer(
    numeratorCoeff,
    numeratorExp,
    denominatorExp,
  );
  return [
    correct,
    formatDerivativePowerQuotientAnswer(numeratorCoeff, numeratorExp + 1, denominatorExp),
    formatDerivativePowerQuotientAnswer(numeratorCoeff, numeratorExp, denominatorExp + 1),
    formatQuotientFraction(numeratorCoeff, numeratorExp, denominatorExp),
    formatDerivativePowerAnswer(numeratorCoeff, numeratorExp),
    '0',
  ];
}

export function quotientIntegralDistractors(
  numeratorCoeff: number,
  numeratorExp: number,
  denominatorExp: number,
): string[] {
  const correct = formatIntegralQuotientAnswer(
    numeratorCoeff,
    numeratorExp,
    denominatorExp,
  );
  const simplifiedExp = numeratorExp - denominatorExp;
  return [
    correct,
    formatIntegralPowerAnswer(numeratorCoeff, simplifiedExp - 1),
    formatIntegralPowerAnswer(numeratorCoeff, simplifiedExp + 1),
    formatQuotientFraction(numeratorCoeff, numeratorExp, denominatorExp),
    formatDerivativeQuotientAnswer(numeratorCoeff, numeratorExp, denominatorExp) + ' + C',
    `${formatPower('x', simplifiedExp + 1)} + C`,
  ];
}

export { pickRandom };
