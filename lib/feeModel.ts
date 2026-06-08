// Shared MDR fee model mirroring the reference calculator's variable hierarchy:
//   Volume → Kartu vs QRIS → (Kartu) Debit vs Kredit → On-Us vs Off-Us
// Five leaf fee categories: Debit On/Off-Us, Kredit On/Off-Us, QRIS.
// Used by the calculator page, the EDC benchmark, and the .xlsx exporters so
// the math stays identical everywhere.

export type FeeKey = "debitOn" | "debitOff" | "kreditOn" | "kreditOff" | "qris";

export interface FeeRates {
  debitOn: number;
  debitOff: number;
  kreditOn: number;
  kreditOff: number;
  qris: number;
}

export interface SplitMix {
  kartuPct: number; // Kartu vs QRIS
  debitPct: number; // Debit vs Kredit (within Kartu)
  debitOnPct: number; // On-Us vs Off-Us (within Debit)
  kreditOnPct: number; // On-Us vs Off-Us (within Kredit)
}

// Labels + ordering for the five leaf categories (reference wording).
export const FEE_CATEGORIES: { key: FeeKey; label: string }[] = [
  { key: "debitOn", label: "Debit On-Us" },
  { key: "debitOff", label: "Debit Off-Us" },
  { key: "kreditOn", label: "Kredit On-Us" },
  { key: "kreditOff", label: "Kredit Off-Us" },
  { key: "qris", label: "QRIS" },
];

// Defaults copied from https://merchanthunterplgsudirman.web.id/calculator
export const DEFAULT_MIX: SplitMix = {
  kartuPct: 60,
  debitPct: 70,
  debitOnPct: 50,
  kreditOnPct: 40,
};

export const MANDIRI_RATES: FeeRates = {
  debitOn: 0.15,
  debitOff: 1.0,
  kreditOn: 1.8,
  kreditOff: 1.8,
  qris: 0.7,
};

// A representative "other provider/bank" baseline (always editable in the UI).
export const COMPETITOR_RATES: FeeRates = {
  debitOn: 0.2,
  debitOff: 1.8,
  kreditOn: 2.2,
  kreditOff: 2.2,
  qris: 0.7,
};

export type CategoryVolumes = Record<FeeKey, number> & {
  kartu: number;
  qrisVol: number;
  debit: number;
  kredit: number;
};

/** Distribute a monthly volume across the five leaf categories. */
export function categoryVolumes(volume: number, m: SplitMix): CategoryVolumes {
  const kartu = (volume * m.kartuPct) / 100;
  const qris = volume - kartu;
  const debit = (kartu * m.debitPct) / 100;
  const kredit = kartu - debit;
  const debitOn = (debit * m.debitOnPct) / 100;
  const debitOff = debit - debitOn;
  const kreditOn = (kredit * m.kreditOnPct) / 100;
  const kreditOff = kredit - kreditOn;
  return { debitOn, debitOff, kreditOn, kreditOff, qris, kartu, qrisVol: qris, debit, kredit };
}

/** Per-category cost = category volume × its rate (%). */
export function feeBreakdown(vol: CategoryVolumes, r: FeeRates): Record<FeeKey, number> {
  return {
    debitOn: (vol.debitOn * r.debitOn) / 100,
    debitOff: (vol.debitOff * r.debitOff) / 100,
    kreditOn: (vol.kreditOn * r.kreditOn) / 100,
    kreditOff: (vol.kreditOff * r.kreditOff) / 100,
    qris: (vol.qris * r.qris) / 100,
  };
}

export function totalFee(vol: CategoryVolumes, r: FeeRates): number {
  const b = feeBreakdown(vol, r);
  return b.debitOn + b.debitOff + b.kreditOn + b.kreditOff + b.qris;
}
