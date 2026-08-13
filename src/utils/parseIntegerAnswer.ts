/** Parses a typed integer answer (optional leading +/−). Returns null if empty or invalid. */
export function parseIntegerAnswer(raw: string): number | null {
  const t = raw.trim().replace(/\u2212/g, '-');
  if (t === '' || t === '-' || t === '+') return null;
  if (!/^[-+]?\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isSafeInteger(n) ? n : null;
}

/** Parses a typed numeric answer (optional leading +/−, optional decimal). */
export function parseNumberAnswer(raw: string): number | null {
  const t = raw.trim().replace(/\u2212/g, '-');
  if (t === '' || t === '-' || t === '+' || t === '.' || t === '-.' || t === '+.') {
    return null;
  }
  if (!/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
