// Display formatting. All money is CAD.

const CAD = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const CAD0 = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 0, maximumFractionDigits: 0 });

/** $1,234.50 */
export function money(n: number | null | undefined): string {
  return CAD.format(Number(n ?? 0));
}

/** $1,235, for headline figures where cents are noise. */
export function money0(n: number | null | undefined): string {
  return CAD0.format(Number(n ?? 0));
}

function toDate(d: string | Date): Date {
  return typeof d === "string" ? new Date(d.length === 10 ? `${d}T00:00:00` : d) : d;
}

/** "May 20, 2026", or a dash. */
export function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = toDate(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

/** "2026-07" → "Jul 2026". */
export function fmtMonth(period: string | null | undefined): string {
  if (!period) return "—";
  const [y, m] = period.split("-").map(Number);
  if (!y || !m) return period;
  return new Date(y, m - 1, 1).toLocaleDateString("en-CA", { year: "numeric", month: "short" });
}

/** Whole days from today until d (negative means past), or null. */
export function daysUntil(d: string | Date | null | undefined, today = new Date()): number | null {
  if (!d) return null;
  const date = toDate(d);
  if (Number.isNaN(date.getTime())) return null;
  const a = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const b = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((a - b) / 86_400_000);
}

/** "2026-07" for the month containing today. */
export function currentPeriod(today = new Date()): string {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

/** YYYY-MM-DD for today in local time. */
export function isoToday(today = new Date()): string {
  return `${currentPeriod(today)}-${String(today.getDate()).padStart(2, "0")}`;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
