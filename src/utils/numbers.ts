export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Groups digits in threes with `.` (e.g. 1000 → `1.000`, 1000000 → `1.000.000`). */
export function formatThousandsDots(n: number): string {
  if (!Number.isFinite(n)) return '';
  const s = String(Math.trunc(Math.abs(n)));
  const groups: string[] = [];
  let i = s.length;
  while (i > 0) {
    const start = Math.max(0, i - 3);
    groups.unshift(s.slice(start, i));
    i = start;
  }
  return groups.join('.');
}
