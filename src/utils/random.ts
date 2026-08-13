/** Inclusive integer in [min, max]. Assumes min <= max. */
export function randomIntInclusive(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error('pickRandom requires a non-empty array');
  }
  return items[randomIntInclusive(0, items.length - 1)]!;
}
