const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

export function formatPower(base: string, exponent: number): string {
  if (exponent === 0) return '1';
  if (exponent === 1) return base;
  const expStr = String(exponent);
  const superscript = [...expStr].map((d) => SUPERSCRIPT[d] ?? d).join('');
  return `${base}${superscript}`;
}

export function formatCoefficientTimesPower(
  coefficient: number,
  exponent: number,
): string {
  if (coefficient === 1) return formatPower('x', exponent);
  if (coefficient === -1) return `−${formatPower('x', exponent)}`;
  return `${coefficient}${formatPower('x', exponent)}`;
}

export function formatDerivativePrompt(inner: string): string {
  return `(${inner})' = ?`;
}

export function formatIntegralPrompt(inner: string): string {
  return `∫${inner} dx = ?`;
}

/** Normalize symbolic calculus answers for comparison. */
export function normalizeCalculusAnswer(raw: string): string {
  let s = raw.trim().toLowerCase();
  s = s.replace(/\s+/g, '');
  s = s.replace(/−/g, '-');
  s = s.replace(/\^(\d)/g, (_, d: string) => SUPERSCRIPT[d] ?? d);
  s = s.replace(/\+c/g, '+c');
  if (s.endsWith('c') && !s.includes('+c')) {
    s = s.replace(/c$/, '+c');
  }
  return s;
}

export function calculusAnswersMatch(a: string, b: string): boolean {
  return normalizeCalculusAnswer(a) === normalizeCalculusAnswer(b);
}

export function formatDerivativePowerAnswer(coefficient: number, exponent: number): string {
  const derivedCoeff = coefficient * exponent;
  const derivedExp = exponent - 1;
  if (derivedExp === 0) return String(derivedCoeff);
  if (derivedCoeff === 1) return formatPower('x', derivedExp);
  if (derivedCoeff === -1) return `−${formatPower('x', derivedExp)}`;
  return formatCoefficientTimesPower(derivedCoeff, derivedExp);
}

export function formatIntegralPowerAnswer(coefficient: number, exponent: number): string {
  const newExp = exponent + 1;
  const denom = newExp;
  if (coefficient === 1) {
    return `${formatPower('x', newExp)}/${denom} + C`;
  }
  if (coefficient % denom === 0) {
    const whole = coefficient / denom;
    if (whole === 1) return `${formatPower('x', newExp)} + C`;
    return `${whole}${formatPower('x', newExp)} + C`;
  }
  return `${coefficient}${formatPower('x', newExp)}/${denom} + C`;
}

export function formatIntegralConstantAnswer(constant: number): string {
  return `${constant}x + C`;
}

export type TrigFn = 'sin' | 'cos';

export function formatTrigFn(fn: TrigFn, inner = 'x'): string {
  return `${fn} ${inner}`;
}

export function formatCoefficientTimesTrig(
  coefficient: number,
  fn: TrigFn,
  inner = 'x',
): string {
  const body = formatTrigFn(fn, inner);
  if (coefficient === 1) return body;
  if (coefficient === -1) return `−${body}`;
  return `${coefficient} ${body}`;
}

export function formatQuotientFraction(
  numeratorCoeff: number,
  numeratorExp: number,
  denominatorExp: number,
): string {
  const num =
    numeratorCoeff === 1
      ? formatPower('x', numeratorExp)
      : formatCoefficientTimesPower(numeratorCoeff, numeratorExp);
  const den = formatPower('x', denominatorExp);
  return `${num}/${den}`;
}

export type DifferentiationQuotientSpec =
  | { kind: 'x_over_shift'; shift: number }
  | { kind: 'kx_over_shift'; coeff: number; shift: number }
  | { kind: 'k_over_shift'; coeff: number; shift: number };

export function formatShiftedLinear(shift: number): string {
  return shift === 0 ? 'x' : `x + ${shift}`;
}

function formatQuotientDenominator(shift: number): string {
  return shift === 0 ? 'x' : `(x + ${shift})`;
}

/** Fraction that cannot be reduced to a single power of x before differentiating. */
export function formatDifferentiationQuotientExpression(
  spec: DifferentiationQuotientSpec,
): string {
  const den = formatQuotientDenominator(spec.shift);
  switch (spec.kind) {
    case 'x_over_shift':
      return `x/${den}`;
    case 'kx_over_shift':
      return spec.coeff === 1 ? `x/${den}` : `${spec.coeff}x/${den}`;
    case 'k_over_shift':
      return `${spec.coeff}/${den}`;
  }
}

export function formatDifferentiationQuotientAnswer(
  spec: DifferentiationQuotientSpec,
): string {
  const den = formatShiftedLinear(spec.shift);
  switch (spec.kind) {
    case 'x_over_shift':
      return `${spec.shift}/(${den})²`;
    case 'kx_over_shift':
      return `${spec.coeff * spec.shift}/(${den})²`;
    case 'k_over_shift':
      return `${-spec.coeff}/(${den})²`;
  }
}

/** Legacy helper — power over power (used only for integration simplify-first). */
export function formatDerivativePowerQuotientAnswer(
  numeratorCoeff: number,
  numeratorExp: number,
  denominatorExp: number,
): string {
  const derivedCoeff = numeratorCoeff * (numeratorExp - denominatorExp);
  const derivedExp = numeratorExp - denominatorExp - 1;
  if (derivedExp < 0) return '0';
  if (derivedExp === 0) return String(derivedCoeff);
  return formatCoefficientTimesPower(derivedCoeff, derivedExp);
}

export function formatDerivativeTrigAnswer(fn: TrigFn, coefficient = 1): string {
  if (fn === 'sin') {
    if (coefficient === 1) return 'cos x';
    if (coefficient === -1) return '−cos x';
    return `${coefficient} cos x`;
  }
  if (coefficient === 1) return '−sin x';
  if (coefficient === -1) return 'sin x';
  return `${-coefficient} sin x`;
}

export function formatIntegralTrigAnswer(fn: TrigFn, coefficient = 1): string {
  if (fn === 'sin') {
    if (coefficient === 1) return '−cos x + C';
    if (coefficient === -1) return 'cos x + C';
    return `${-coefficient} cos x + C`;
  }
  if (coefficient === 1) return 'sin x + C';
  if (coefficient === -1) return '−sin x + C';
  return `${coefficient} sin x + C`;
}

/** (k·x^a / x^b)' simplified to a polynomial term — integration only. */
export function formatDerivativeQuotientAnswer(
  numeratorCoeff: number,
  numeratorExp: number,
  denominatorExp: number,
): string {
  return formatDerivativePowerQuotientAnswer(
    numeratorCoeff,
    numeratorExp,
    denominatorExp,
  );
}

/** ∫ (k·x^a / x^b) dx after simplifying the fraction. */
export function formatIntegralQuotientAnswer(
  numeratorCoeff: number,
  numeratorExp: number,
  denominatorExp: number,
): string {
  const simplifiedExp = numeratorExp - denominatorExp;
  return formatIntegralPowerAnswer(numeratorCoeff, simplifiedExp);
}
