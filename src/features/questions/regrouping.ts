/** Whole-number addition that needs carrying in at least one column. */
export function additionRequiresRegrouping(a: number, b: number): boolean {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return false;
  if (a < 0 || b < 0) return false;

  let x = a;
  let y = b;
  let carry = 0;

  while (x > 0 || y > 0 || carry > 0) {
    const sum = (x % 10) + (y % 10) + carry;
    if (sum >= 10) return true;
    carry = Math.floor(sum / 10);
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }

  return false;
}

/** Whole-number subtraction that needs borrowing in at least one column. */
export function subtractionRequiresRegrouping(minuend: number, subtrahend: number): boolean {
  if (!Number.isInteger(minuend) || !Number.isInteger(subtrahend)) return false;
  if (minuend < 0 || subtrahend < 0) return false;

  let a = minuend;
  let b = subtrahend;

  while (b > 0) {
    const top = a % 10;
    const bottom = b % 10;
    if (top < bottom) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }

  return false;
}

export function matchesRegroupingPreference(
  regroupingEnabled: boolean,
  operation: 'addition' | 'subtraction',
  operands: { left: number; right: number } | { first: number; second: number },
): boolean {
  if (regroupingEnabled) return true;

  if (operation === 'addition') {
    const { left, right } = operands as { left: number; right: number };
    if (left < 0 || right < 0) return true;
    return !additionRequiresRegrouping(left, right);
  }

  const { first, second } = operands as { first: number; second: number };
  if (first < 0 || second < 0) return true;
  return !subtractionRequiresRegrouping(first, second);
}
