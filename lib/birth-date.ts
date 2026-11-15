export const BIRTH_MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** Keep only MM-DD. February 29 is valid for an anniversary without a year. */
export function normalizeBirthDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let anniversary = value;
  // Older accounts and already-open signup forms may contain a full date.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value
      || value < "0001-01-01" || value > new Date().toISOString().slice(0, 10)) return null;
    anniversary = value.slice(5);
  }
  if (!/^\d{2}-\d{2}$/.test(anniversary)) return null;
  const [month, day] = anniversary.split("-").map(Number);
  const maxDay = BIRTH_MONTH_DAYS[month - 1];
  return maxDay && day >= 1 && day <= maxDay ? anniversary : null;
}

export function isValidBirthDate(value: string): boolean {
  return normalizeBirthDate(value) !== null;
}
