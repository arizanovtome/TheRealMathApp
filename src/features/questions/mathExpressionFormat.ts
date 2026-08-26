const MINUS = "\u2212";

export function formatInteger(n: number): string {
  return n < 0 ? `${MINUS}${Math.abs(n)}` : String(n);
}

/** Formats whole numbers or decimals (one decimal place when needed). */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  const rounded = Math.round(n * 10) / 10;
  if (Number.isInteger(rounded)) return formatInteger(rounded);
  const text = Math.abs(rounded).toFixed(1);
  return rounded < 0 ? `${MINUS}${text}` : text;
}

export function formatAddExpression(left: number | string, right: number): string {
  const leftText = typeof left === "number" ? formatNumber(left) : left;
  const op = right < 0 ? MINUS : "+";
  const rightAbs = typeof right === "number" ? formatNumber(Math.abs(right)) : String(Math.abs(right));
  return `${leftText} ${op} ${rightAbs}`;
}

export function formatSubtractExpression(left: number | string, right: number): string {
  const leftText = typeof left === "number" ? formatNumber(left) : left;
  const op = right < 0 ? "+" : MINUS;
  const rightAbs = typeof right === "number" ? formatNumber(Math.abs(right)) : String(Math.abs(right));
  return `${leftText} ${op} ${rightAbs}`;
}

export function formatSubtractUnknownExpression(left: number): string {
  return `${formatInteger(left)} ${MINUS} x`;
}

export function formatMultiplyExpression(left: number | string, right: number | string): string {
  const leftText = typeof left === "number" ? formatNumber(left) : left;
  const rightText = typeof right === "number" ? formatNumber(right) : right;
  return `${leftText} × ${rightText}`;
}

export function formatDivideExpression(left: number | string, right: number | string): string {
  const leftText = typeof left === "number" ? formatNumber(left) : left;
  const rightText = typeof right === "number" ? formatNumber(right) : right;
  const formattedRight = typeof right === "number" && right < 0 ? `(${rightText})` : rightText;
  return `${leftText} ÷ ${formattedRight}`;
}

export function formatColonExpression(left: number, right: number): string {
  const rightText = formatInteger(right);
  return `${formatInteger(left)}:${right < 0 ? `(${rightText})` : rightText}`;
}

export function formatEquationAnswerExpression(expression: string): string {
  const normalized = expression.replace(/\s+/g, "").replace(/\u2212/g, "-");
  const ratio = /^(-?\d+):\(?(-?\d+)\)?$/.exec(normalized);
  if (ratio) return formatColonExpression(Number(ratio[1]), Number(ratio[2]));

  const product = /^(-?\d+)[×*]\(?(-?\d+)\)?$/.exec(normalized);
  if (product) {
    return formatMultiplyExpression(Number(product[1]), Number(product[2]));
  }

  const subtraction = /^(-?\d+)-(-?\d+)$/.exec(normalized);
  if (subtraction) {
    return formatSubtractExpression(Number(subtraction[1]), Number(subtraction[2]));
  }

  const addition = /^(-?\d+)\+(-?\d+)$/.exec(normalized);
  if (addition) {
    return formatAddExpression(Number(addition[1]), Number(addition[2]));
  }

  const integer = /^-?\d+$/.exec(normalized);
  if (integer) return formatInteger(Number(normalized));

  return expression;
}

export function formatRoundingNumber(value: number, nearest?: string | number): string {
  if (nearest === "hundredth") return value.toFixed(2);
  if (nearest === "tenth") return value.toFixed(1);
  if (nearest === "whole" || nearest === 10 || nearest === 100) return String(Math.round(value));
  return Number.isInteger(value) ? String(value) : String(value);
}
