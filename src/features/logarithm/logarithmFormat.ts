import { formatPower } from '@/features/calculus/calculusFormat';

const LOG_BASE_SUBSCRIPTS: Record<number, string> = {
  2: '₂',
  3: '₃',
  5: '₅',
  10: '₁₀',
};

export function formatLogBaseLabel(base: number): string {
  const sub = LOG_BASE_SUBSCRIPTS[base];
  return sub ? `log${sub}` : `log_${base}`;
}

export function formatNumericLogPrompt(base: number, value: number): string {
  return `${formatLogBaseLabel(base)}(${value}) = ?`;
}

export function formatNumericLogProductPrompt(base: number, a: number, b: number): string {
  return `${formatLogBaseLabel(base)}(${a} × ${b}) = ?`;
}

export function formatLnPrompt(inner: string): string {
  return `ln(${inner}) = ?`;
}

export function formatLogProductPrompt(a: number, b: number): string {
  return `log(${a} × ${b}) = ?`;
}

export function formatLogQuotientPrompt(dividend: number, divisor: number): string {
  return `log(${dividend} ÷ ${divisor}) = ?`;
}

export function formatLogPowerPrompt(exponent: number): string {
  return `log(${formatPower('x', exponent)}) = ?`;
}

export function formatLogProductAnswer(a: number, b: number): string {
  return `log ${a} + log ${b}`;
}

export function formatLogQuotientAnswer(dividend: number, divisor: number): string {
  return `log ${dividend} − log ${divisor}`;
}

export function formatLogPowerAnswer(exponent: number): string {
  return `${exponent} log x`;
}

export function formatLnPowerAnswer(exponent: number): string {
  return String(exponent);
}

/** Normalize symbolic log answers for comparison. */
export function normalizeLogAnswer(raw: string): string {
  let s = raw.trim().toLowerCase();
  s = s.replace(/\s+/g, ' ');
  s = s.replace(/−/g, '-');
  s = s.replace(/\s*\+\s*/g, ' + ');
  s = s.replace(/\s*-\s*/g, ' - ');
  return s.trim();
}

function parseLogSumPair(raw: string): [number, number] | null {
  const s = normalizeLogAnswer(raw);
  const match = s.match(/^log (\d+) \+ log (\d+)$/);
  if (!match) return null;
  const terms = [Number(match[1]), Number(match[2])].sort((a, b) => a - b) as [
    number,
    number,
  ];
  return terms;
}

function parseLogDifferencePair(raw: string): [number, number] | null {
  const s = normalizeLogAnswer(raw);
  const match = s.match(/^log (\d+) - log (\d+)$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

function parseSingleLogValue(raw: string): number | null {
  const s = normalizeLogAnswer(raw);
  const match = s.match(/^log (\d+)$/);
  return match ? Number(match[1]) : null;
}

/** True when two symbolic answers must not both appear as MC choices. */
export function logAnswersEquivalentForMc(a: string, b: string): boolean {
  if (logAnswersMatch(a, b)) return true;

  const sumA = parseLogSumPair(a);
  const singleB = parseSingleLogValue(b);
  if (sumA && singleB !== null && sumA[0] * sumA[1] === singleB) return true;

  const sumB = parseLogSumPair(b);
  const singleA = parseSingleLogValue(a);
  if (sumB && singleA !== null && sumB[0] * sumB[1] === singleA) return true;

  const diffA = parseLogDifferencePair(a);
  const singleFromDiffB = parseSingleLogValue(b);
  if (diffA && singleFromDiffB !== null) {
    const quotient = diffA[0] / diffA[1];
    if (Number.isInteger(quotient) && quotient === singleFromDiffB) return true;
  }

  return false;
}

export function logAnswersMatch(a: string, b: string): boolean {
  if (normalizeLogAnswer(a) === normalizeLogAnswer(b)) return true;

  const sumA = parseLogSumPair(a);
  const sumB = parseLogSumPair(b);
  if (sumA && sumB && sumA[0] === sumB[0] && sumA[1] === sumB[1]) return true;

  return false;
}
