// Currency + number formatting helpers (Indonesian Rupiah).

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const idrCompact = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Format a number as "Rp 1.234.567". */
export function formatRupiah(value: number): string {
  if (!isFinite(value)) return "Rp 0";
  return idr.format(Math.round(value));
}

/** Compact currency, e.g. "Rp 1,2 jt". */
export function formatRupiahCompact(value: number): string {
  if (!isFinite(value)) return "Rp 0";
  return "Rp " + idrCompact.format(Math.round(value));
}

/** Parse free-form currency input ("Rp 1.250.000", "1250000") into a number. */
export function parseRupiah(input: string): number {
  const digits = (input || "").replace(/[^0-9]/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10);
}

/** Format a number with thousands separators (no currency symbol). */
export function formatNumber(value: number): string {
  if (!isFinite(value)) return "0";
  return new Intl.NumberFormat("id-ID").format(Math.round(value));
}

/** Format a percentage value (already in percent units), e.g. 1.5 -> "1,5%". */
export function formatPercent(value: number, digits = 2): string {
  return (
    new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    }).format(value) + "%"
  );
}

/** Today's date in Indonesian, e.g. "Senin, 1 Jun 2026". */
export function todayLabel(date = new Date()): { day: string; date: string } {
  const day = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(date);
  const d = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
  return { day, date: d };
}
