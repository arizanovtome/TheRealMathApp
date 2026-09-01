export function capitalizeFirst(text: string, locale?: string): string {
  if (text.length === 0) return text;
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}
