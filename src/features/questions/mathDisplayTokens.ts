export type MathDisplayToken =
  | { kind: 'text'; value: string }
  | { kind: 'fraction'; numerator: number; denominator: number };

const FRACTION_PATTERN = /(-?\d+)\/(-?\d+)/g;

export function tokenizeMathDisplayText(text: string): MathDisplayToken[] {
  const tokens: MathDisplayToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(FRACTION_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ kind: 'text', value: text.slice(lastIndex, index) });
    }
    tokens.push({
      kind: 'fraction',
      numerator: Number(match[1]),
      denominator: Number(match[2]),
    });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push({ kind: 'text', value: text.slice(lastIndex) });
  }

  return tokens;
}

export function mathDisplayTextHasFractions(text: string): boolean {
  return /(-?\d+)\/(-?\d+)/.test(text);
}
