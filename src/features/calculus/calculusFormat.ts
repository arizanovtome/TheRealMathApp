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
