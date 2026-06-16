"use client";

import { useMemo, useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import {
  StepCard,
  Label,
  CurrencyInput,
  UnitInput,
  StatBox,
  PercentSlider,
} from "@/components/ui";
import {
  CalculatorIcon,
  CardIcon,
  QrisIcon,
  ChevronDownIcon,
  FilePdfIcon,
} from "@/components/icons";
import { DonutChart } from "@/components/charts/DonutChart";
import { DownloadButton } from "@/components/DownloadButton";
import { formatRupiah, formatRupiahCompact, formatPercent } from "@/lib/format";
import { downloadFeeReport } from "@/lib/export";
import { downloadFeePdf } from "@/lib/pdf";
import {
  FEE_CATEGORIES,
  type FeeKey,
  type FeeRates,
  DEFAULT_MIX,
  MANDIRI_RATES,
  categoryVolumes,
  feeBreakdown,
  totalFee,
} from "@/lib/feeModel";

const PERIODS = [1, 3, 6, 12];

const FEE_COLOR: Record<FeeKey, { hex: string; dot: string }> = {
  debitOn: { hex: "#003B79", dot: "bg-navy" },
  debitOff: { hex: "#F5B301", dot: "bg-gold" },
  kreditOn: { hex: "#2563EB", dot: "bg-blue-600" },
  kreditOff: { hex: "#FCD34D", dot: "bg-amber-300" },
  qris: { hex: "#059669", dot: "bg-emerald-500" },
};

export default function CalculatorPage() {
  const [volume, setVolume] = useState(0);

  const [kartuPct, setKartuPct] = useState(DEFAULT_MIX.kartuPct);
  const [debitPct, setDebitPct] = useState(DEFAULT_MIX.debitPct);
  const [debitOnPct, setDebitOnPct] = useState(DEFAULT_MIX.debitOnPct);
  const [kreditOnPct, setKreditOnPct] = useState(DEFAULT_MIX.kreditOnPct);

  const [rates, setRates] = useState<FeeRates>(MANDIRI_RATES);

  const [estOpen, setEstOpen] = useState(false);
  const [avgTicket, setAvgTicket] = useState(0);
  const [custPerDay, setCustPerDay] = useState(0);
  const [daysPerMonth, setDaysPerMonth] = useState(26);

  const [busy, setBusy] = useState<null | "xlsx" | "pdf">(null);

  const mix = { kartuPct, debitPct, debitOnPct, kreditOnPct };
  const setRate = (key: FeeKey, n: number) =>
    setRates((prev) => ({ ...prev, [key]: n }));

  const r = useMemo(() => {
    const vols = categoryVolumes(volume, mix);
    const breakdown = feeBreakdown(vols, rates);
    const total = totalFee(vols, rates);
    const cats = FEE_CATEGORIES.map((c) => ({
      ...c,
      color: FEE_COLOR[c.key],
      vol: vols[c.key],
      fee: breakdown[c.key],
      pct: total > 0 ? (breakdown[c.key] / total) * 100 : 0,
    }));
    return { vols, total, cats };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, kartuPct, debitPct, debitOnPct, kreditOnPct, rates]);

  const estVolume = avgTicket * custPerDay * daysPerMonth;
  const ready = volume > 0;

  const handleExport = async (kind: "xlsx" | "pdf") => {
    setBusy(kind);
    try {
      const data = { volume, mix, mandiriRates: rates };
      await (kind === "xlsx" ? downloadFeeReport(data) : downloadFeePdf(data));
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeading
        title="Kalkulator Fee"
        subtitle="Rincian fee MDR yang dibayar merchant ke Mandiri"
        iconClass="bg-navy-50 text-navy"
        icon={<CalculatorIcon className="h-5 w-5" />}
      />

      {/* Step 1: volume */}
      <StepCard step={1} title="Volume Transaksi Merchant">
        <Label>Total Volume Transaksi / Bulan</Label>
        <CurrencyInput value={volume} onChange={setVolume} />
        <p className="mt-2 text-xs text-slate-400">
          💡 Tanyakan langsung ke owner, atau gunakan estimator di bawah.
        </p>

        <button
          type="button"
          onClick={() => setEstOpen((v) => !v)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 transition hover:text-navy-900"
        >
          <ChevronDownIcon className={"h-4 w-4 transition " + (estOpen ? "rotate-180" : "")} />
          Bantu hitung dari data pelanggan
        </button>

        {estOpen && (
          <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div>
              <Label>Rata-rata nilai transaksi</Label>
              <CurrencyInput value={avgTicket} onChange={setAvgTicket} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pelanggan / hari</Label>
                <UnitInput value={custPerDay} onChange={setCustPerDay} unit="org" />
              </div>
              <div>
                <Label>Hari operasi / bln</Label>
                <UnitInput value={daysPerMonth} onChange={setDaysPerMonth} unit="hari" max={31} />
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-lg bg-white p-3 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-500">
                Estimasi volume:{" "}
                <span className="font-bold text-navy-900">{formatRupiah(estVolume)}</span>
              </span>
              <button
                type="button"
                disabled={estVolume <= 0}
                onClick={() => setVolume(Math.round(estVolume))}
                className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-40"
              >
                Gunakan estimasi
              </button>
            </div>
          </div>
        )}
      </StepCard>

      {/* Step 2: Kartu vs QRIS */}
      <StepCard step={2} title="Split Kartu vs QRIS">
        <PercentSlider value={kartuPct} onChange={setKartuPct} leftLabel="Kartu" rightLabel="QRIS" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatBox
            label="Kartu"
            tone="navy"
            value={formatRupiah(r.vols.kartu)}
            icon={<CardIcon className="h-4 w-4" />}
          />
          <StatBox
            label="QRIS"
            tone="green"
            value={formatRupiah(r.vols.qrisVol)}
            icon={<QrisIcon className="h-4 w-4" />}
          />
        </div>
      </StepCard>

      {/* Step 3: card breakdown */}
      <StepCard step={3} title="Rincian Jenis Kartu">
        <div className="space-y-4">
          <PercentSlider value={debitPct} onChange={setDebitPct} leftLabel="Debit" rightLabel="Kredit" />
          <div className="grid gap-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                Debit · {formatRupiahCompact(r.vols.debit)}
              </p>
              <PercentSlider value={debitOnPct} onChange={setDebitOnPct} leftLabel="On-Us" rightLabel="Off-Us" />
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                Kredit · {formatRupiahCompact(r.vols.kredit)}
              </p>
              <PercentSlider value={kreditOnPct} onChange={setKreditOnPct} leftLabel="On-Us" rightLabel="Off-Us" />
            </div>
          </div>
        </div>
      </StepCard>

      {/* Step 4: per-category fee */}
      <StepCard step={4} title="Rincian Fee per Kategori">
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-navy-700">
          ✏️ Tarif bisa diedit — sesuaikan untuk simulasi tarif yang berlaku.
        </p>
        <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
          <div className="grid grid-cols-[1fr_92px_auto] items-center gap-2 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500 sm:grid-cols-[1fr_110px_auto]">
            <span>Kategori</span>
            <span className="text-center">Tarif</span>
            <span className="min-w-[92px] text-right sm:min-w-[120px]">Fee / bulan</span>
          </div>
          {r.cats.map((cat, i) => (
            <div
              key={cat.key}
              className={
                "grid grid-cols-[1fr_92px_auto] items-center gap-2 px-3 py-2 sm:grid-cols-[1fr_110px_auto] " +
                (i % 2 ? "bg-white" : "bg-slate-50/40")
              }
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className={"h-2.5 w-2.5 rounded-full " + cat.color.dot} />
                {cat.label}
              </span>
              <UnitInput
                value={rates[cat.key]}
                onChange={(n) => setRate(cat.key, n)}
                unit="%"
                step={0.05}
              />
              <span className="min-w-[92px] text-right text-sm font-bold tabular-nums text-navy-900 sm:min-w-[120px]">
                {ready ? formatRupiah(cat.fee) : "—"}
              </span>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_92px_auto] items-center gap-2 border-t border-slate-200 bg-navy-50 px-3 py-2.5 sm:grid-cols-[1fr_110px_auto]">
            <span className="text-sm font-bold text-navy-900">Total Fee / Bulan</span>
            <span />
            <span className="min-w-[92px] text-right text-base font-extrabold tabular-nums text-navy-900 sm:min-w-[120px]">
              {ready ? formatRupiah(r.total) : "—"}
            </span>
          </div>
        </div>
      </StepCard>

      {/* Result */}
      {!ready ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-6 py-10 text-center">
          <CalculatorIcon className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-400">Masukkan volume transaksi</p>
          <p className="text-sm text-slate-400">untuk melihat rincian fee MDR dengan Mandiri</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-900 p-6 text-white shadow-card">
            <p className="text-sm text-white/75">Estimasi Fee MDR / Bulan dengan Mandiri</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums sm:text-4xl">
              {formatRupiah(r.total)}
            </p>
            <p className="mt-1 text-sm text-white/75">
              ≈ <span className="font-bold text-gold-300">{formatRupiah(r.total * 12)}</span> /
              tahun · efektif{" "}
              <span className="font-bold text-white">
                {formatPercent(volume > 0 ? (r.total / volume) * 100 : 0, 2)}
              </span>{" "}
              dari volume
            </p>
          </div>

          {/* Composition */}
          <div className="rounded-2xl bg-white p-5 shadow-card-sm ring-1 ring-slate-100 sm:p-6">
            <h2 className="mb-4 text-base font-bold text-navy-900">Komposisi Sumber Fee</h2>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
              <DonutChart
                segments={r.cats.map((c) => ({
                  label: c.label,
                  value: c.fee,
                  color: c.color.hex,
                }))}
                centerTop="Total"
                centerMain={formatRupiahCompact(r.total)}
                centerSub="/ bulan"
              />
              <div className="w-full flex-1 space-y-2">
                {r.cats.map((c) => (
                  <div key={c.key} className="flex items-center gap-3 text-sm">
                    <span className={"h-3 w-3 shrink-0 rounded-full " + c.color.dot} />
                    <span className="flex-1 font-semibold text-slate-600">{c.label}</span>
                    <span className="w-12 text-right tabular-nums text-slate-400">
                      {formatPercent(c.pct, 0)}
                    </span>
                    <span className="w-24 text-right font-bold tabular-nums text-navy-900">
                      {formatRupiah(c.fee)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projection */}
          <div className="rounded-2xl bg-white p-5 shadow-card-sm ring-1 ring-slate-100 sm:p-6">
            <h2 className="mb-4 text-base font-bold text-navy-900">Proyeksi Fee Kumulatif</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PERIODS.map((m) => (
                <div
                  key={m}
                  className="rounded-xl bg-slate-50 px-3 py-3 text-center ring-1 ring-slate-100"
                >
                  <p className="text-xs font-semibold text-slate-500">
                    {m === 12 ? "1 tahun" : `${m} bulan`}
                  </p>
                  <p className="mt-1 text-base font-extrabold tabular-nums text-navy-800">
                    {formatRupiahCompact(r.total * m)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DownloadButton
              onClick={() => handleExport("xlsx")}
              loading={busy === "xlsx"}
              disabled={busy !== null}
              label="Unduh .xlsx"
            />
            <DownloadButton
              onClick={() => handleExport("pdf")}
              loading={busy === "pdf"}
              disabled={busy !== null}
              variant="secondary"
              label="Unduh PDF"
              icon={<FilePdfIcon className="h-4 w-4" />}
            />
          </div>
        </>
      )}
    </main>
  );
}
