export function ensureString(value: any): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
} 