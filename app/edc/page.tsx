"use client";

import { useMemo, useState } from "react";
import { PageHeading } from "@/components/PageHeading";
import { StepCard, Label, CurrencyInput, UnitInput, PercentSlider } from "@/components/ui";
import { LayersIcon, PlusIcon, TrashIcon, TrophyIcon } from "@/components/icons";
import { DownloadButton } from "@/components/DownloadButton";
import { formatRupiah, formatRupiahCompact, formatPercent } from "@/lib/format";
import { downloadEdcReport } from "@/lib/export";
import {
  FEE_CATEGORIES,
  type FeeKey,
  type FeeRates,
  DEFAULT_MIX,
  MANDIRI_RATES,
  COMPETITOR_RATES,
  categoryVolumes,
  totalFee,
} from "@/lib/feeModel";

type Bank = { id: number; name: string; rates: FeeRates };

let nextId = 2;
const initialBanks: Bank[] = [
  { id: 0, name: "Mandiri", rates: { ...MANDIRI_RATES } },
  { id: 1, name: "Bank Lain", rates: { ...COMPETITOR_RATES } },
];

const PERIODS = [1, 3, 6, 12];

// Fixed row heights so the label column and bank columns stay aligned.
const ROW = {
  head: "h-[76px]",
  input: "h-[68px]",
  calc: "h-[56px]",
};

export default function EdcPage() {
  const [volume, setVolume] = useState(0);
  const [kartuPct, setKartuPct] = useState(DEFAULT_MIX.kartuPct);
  const [debitPct, setDebitPct] = useState(DEFAULT_MIX.debitPct);
  const [debitOnPct, setDebitOnPct] = useState(DEFAULT_MIX.debitOnPct);
  const [kreditOnPct, setKreditOnPct] = useState(DEFAULT_MIX.kreditOnPct);
  const [banks, setBanks] = useState<Bank[]>(initialBanks);
  const [downloading, setDownloading] = useState(false);

  const mix = { kartuPct, debitPct, debitOnPct, kreditOnPct };

  const setRate = (id: number, key: FeeKey, n: number) =>
    setBanks((bs) =>
      bs.map((b) => (b.id === id ? { ...b, rates: { ...b.rates, [key]: n } } : b))
    );
  const setName = (id: number, name: string) =>
    setBanks((bs) => bs.map((b) => (b.id === id ? { ...b, name } : b)));

  const addBank = () =>
    setBanks((bs) =>
      bs.length >= 4
        ? bs
        : [
            ...bs,
            {
              id: nextId++,
              name: `Bank ${String.fromCharCode(65 + bs.length - 1)}`,
              rates: { ...COMPETITOR_RATES },
            },
          ]
    );

  const removeBank = (id: number) =>
    setBanks((bs) => (bs.length <= 2 ? bs : bs.filter((b) => b.id !== id)));

  const vols = useMemo(
    () => categoryVolumes(volume, mix),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [volume, kartuPct, debitPct, debitOnPct, kreditOnPct]
  );

  const results = useMemo(() => {
    const rows = banks.map((b) => ({ ...b, total: totalFee(vols, b.rates) }));
    const mandiri = rows[0];
    const competitors = rows.slice(1);
    const baseline =
      competitors.length > 0
        ? competitors.reduce((a, b) => (b.total > a.total ? b : a))
        : mandiri;
    const min = Math.min(...rows.map((x) => x.total));
    const max = Math.max(...rows.map((x) => x.total));
    const saving = baseline.total - mandiri.total;
    return {
      rows,
      mandiri,
      baseline,
      min,
      max,
      saving,
      savingPct: baseline.total > 0 ? (saving / baseline.total) * 100 : 0,
      mandiriWins: mandiri.total <= min,
    };
  }, [banks, vols]);

  const ready = volume > 0;
  const showWin = ready && results.mandiriWins && results.saving > 0;
  const showTie = ready && results.mandiriWins && results.saving === 0;
  const showWorse = ready && !results.mandiriWins;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadEdcReport({
        volume,
        mix,
        banks: banks.map((b) => ({ name: b.name, rates: b.rates })),
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeading
        title="Perbandingan Biaya EDC"
        subtitle="Buktikan biaya EDC Mandiri lebih murah, side-by-side"
        iconClass="bg-emerald-50 text-emerald-600"
        icon={<LayersIcon className="h-5 w-5" />}
      />

      <StepCard step={1} title="Asumsi Transaksi Merchant / Bulan">
        <Label>Total Volume Transaksi / Bulan</Label>
        <CurrencyInput value={volume} onChange={setVolume} />

        <div className="mt-4 space-y-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <PercentSlider value={kartuPct} onChange={setKartuPct} leftLabel="Kartu" rightLabel="QRIS" />
          <PercentSlider value={debitPct} onChange={setDebitPct} leftLabel="Debit" rightLabel="Kredit" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                Debit · {formatRupiahCompact(vols.debit)}
              </p>
              <PercentSlider
                value={debitOnPct}
                onChange={setDebitOnPct}
                leftLabel="On-Us"
                rightLabel="Off-Us"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                Kredit · {formatRupiahCompact(vols.kredit)}
              </p>
              <PercentSlider
                value={kreditOnPct}
                onChange={setKreditOnPct}
                leftLabel="On-Us"
                rightLabel="Off-Us"
              />
            </div>
          </div>
          {ready && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-200 pt-3 text-xs text-slate-500">
              {FEE_CATEGORIES.map((c) => (
                <span key={c.key}>
                  {c.label}{" "}
                  <span className="font-bold text-navy-800">
                    {formatRupiahCompact(vols[c.key])}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </StepCard>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-navy-900">Perbandingan Bank ({banks.length})</h2>
        <button
          type="button"
          onClick={addBank}
          disabled={banks.length >= 4}
          className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-40"
        >
          <PlusIcon className="h-4 w-4" /> Tambah Bank Lain
        </button>
      </div>

      {/* Benchmark table */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <div className="flex min-w-max divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card-sm">
          {/* Label column */}
          <div className="sticky left-0 z-20 w-36 shrink-0 bg-white sm:w-48">
            <LabelCell h={ROW.head}>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Bank</span>
            </LabelCell>
            {FEE_CATEGORIES.map((c) => (
              <LabelCell key={c.key} h={ROW.input}>
                MDR {c.label}
              </LabelCell>
            ))}
            <LabelCell h={ROW.calc} strong>
              Total / bulan
            </LabelCell>
            <LabelCell h={ROW.calc} muted last>
              Selisih vs Mandiri
            </LabelCell>
          </div>

          {/* Bank columns */}
          {results.rows.map((row, i) => {
            const isMandiri = i === 0;
            const isCheapest = ready && row.total === results.min;
            const diff = row.total - results.mandiri.total;
            return (
              <div
                key={row.id}
                className={"w-40 shrink-0 sm:w-52 " + (isMandiri ? "bg-amber-50/60" : "bg-white")}
              >
                {/* Header */}
                <div
                  className={
                    "flex flex-col justify-center gap-1.5 border-b border-slate-100 px-3 " +
                    ROW.head +
                    (isMandiri ? " bg-amber-50" : "")
                  }
                >
                  <div className="flex items-center justify-between gap-1">
                    {isMandiri ? (
                      <span className="font-extrabold text-navy-900">Mandiri</span>
                    ) : (
                      <input
                        value={row.name}
                        onChange={(e) => setName(row.id, e.target.value)}
                        className="min-w-0 flex-1 rounded-md bg-slate-50 px-2 py-1 text-sm font-bold text-navy-900 outline-none ring-1 ring-transparent focus:bg-white focus:ring-navy/20"
                        aria-label="Nama bank"
                      />
                    )}
                    {!isMandiri && (
                      <button
                        type="button"
                        onClick={() => removeBank(row.id)}
                        disabled={banks.length <= 2}
                        aria-label="Hapus bank"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {isMandiri && (
                      <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-navy-900">
                        KAMI
                      </span>
                    )}
                    {isCheapest && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <TrophyIcon className="h-3 w-3" /> Termurah
                      </span>
                    )}
                  </div>
                </div>

                {/* Rate inputs */}
                {FEE_CATEGORIES.map((c) => (
                  <InputCell key={c.key} h={ROW.input}>
                    <UnitInput
                      value={row.rates[c.key]}
                      onChange={(n) => setRate(row.id, c.key, n)}
                      unit="%"
                      step={0.05}
                    />
                  </InputCell>
                ))}

                {/* Computed */}
                <CalcCell
                  h={ROW.calc}
                  className={
                    "text-base font-extrabold " +
                    (isCheapest ? "text-emerald-600" : "text-navy-900")
                  }
                >
                  {ready ? formatRupiah(row.total) : "—"}
                </CalcCell>
                <CalcCell h={ROW.calc} last>
                  {!ready || isMandiri ? (
                    <span className="text-xs text-slate-400">{isMandiri ? "Acuan" : "—"}</span>
                  ) : diff > 0 ? (
                    <span className="text-xs font-bold text-emerald-600">
                      Hemat {formatRupiahCompact(diff)}
                    </span>
                  ) : diff < 0 ? (
                    <span className="text-xs font-bold text-red-500">
                      +{formatRupiahCompact(-diff)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Setara</span>
                  )}
                </CalcCell>
              </div>
            );
          })}
        </div>
      </div>

      {!ready && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-6 py-8 text-center">
          <LayersIcon className="h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-400">Masukkan volume transaksi</p>
          <p className="text-sm text-slate-400">untuk membandingkan total biaya EDC</p>
        </div>
      )}

      {showWorse && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-3xl">🤔</p>
          <p className="mt-2 text-lg font-bold text-amber-800">
            Hmmm… biaya Bank Mandiri lebih tinggi dari biaya saat ini.
          </p>
          <p className="mt-1 text-sm text-amber-700">
            Coba periksa lagi tarif MDR-nya — turunkan rate Mandiri agar lebih kompetitif
            sebelum menawarkan ke merchant.
          </p>
        </div>
      )}

      {(showWin || showTie) && (
        <>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Kesimpulan</p>
            {showWin ? (
              <>
                <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold">
                  <TrophyIcon className="h-6 w-6 text-gold-400" />
                  Mandiri lebih murah
                </p>
                <p className="mt-2 text-sm text-white/85">
                  Merchant hemat{" "}
                  <span className="font-bold text-white">{formatRupiah(results.saving)}</span>{" "}
                  / bulan ({formatPercent(results.savingPct, 1)}) dibanding{" "}
                  <span className="font-bold text-white">{results.baseline.name}</span> — setara{" "}
                  <span className="font-bold text-white">{formatRupiah(results.saving * 12)}</span>{" "}
                  / tahun.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-white/85">
                Biaya Mandiri setara dengan {results.baseline.name}. Menangkan dengan layanan,
                kecepatan settlement, atau bundling.
              </p>
            )}
          </div>

          {showWin && (
            <>
              {/* Comparison bar chart */}
              <div className="rounded-2xl bg-white p-5 shadow-card-sm ring-1 ring-slate-100 sm:p-6">
                <h2 className="mb-4 text-base font-bold text-navy-900">
                  Perbandingan total biaya / bulan
                </h2>
                <div className="space-y-3">
                  {[...results.rows]
                    .sort((a, b) => a.total - b.total)
                    .map((row) => {
                      const best = row.total === results.min;
                      const isMandiri = row.id === results.mandiri.id;
                      const width = (row.total / (results.max || 1)) * 100;
                      return (
                        <div key={row.id}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                              {best && <TrophyIcon className="h-3.5 w-3.5 text-emerald-600" />}
                              {row.name}
                              {isMandiri && (
                                <span className="rounded-full bg-gold px-1.5 py-px text-[10px] font-bold text-navy-900">
                                  KAMI
                                </span>
                              )}
                            </span>
                            <span className="font-bold tabular-nums text-navy-900">
                              {formatRupiah(row.total)}
                            </span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={
                                "h-full rounded-full transition-all duration-500 " +
                                (best ? "bg-emerald-500" : isMandiri ? "bg-gold" : "bg-navy")
                              }
                              style={{ width: `${Math.max(width, 2)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Projection */}
              <div className="rounded-2xl bg-white p-5 shadow-card-sm ring-1 ring-slate-100 sm:p-6">
                <h2 className="text-base font-bold text-navy-900">
                  Proyeksi penghematan dengan Mandiri
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">Kumulatif vs {results.baseline.name}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PERIODS.map((m) => (
                    <div
                      key={m}
                      className="rounded-xl bg-slate-50 px-3 py-3 text-center ring-1 ring-slate-100"
                    >
                      <p className="text-xs font-semibold text-slate-500">
                        {m === 12 ? "1 tahun" : `${m} bulan`}
                      </p>
                      <p className="mt-1 text-base font-extrabold tabular-nums text-emerald-600">
                        {formatRupiahCompact(results.saving * m)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <DownloadButton onClick={handleDownload} loading={downloading} />
            </>
          )}
        </>
      )}
    </main>
  );
}

function LabelCell({
  children,
  h,
  muted,
  strong,
  last,
}: {
  children: React.ReactNode;
  h: string;
  muted?: boolean;
  strong?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={
        "flex items-center px-3 " +
        h +
        (last ? "" : " border-b border-slate-100") +
        " " +
        (strong
          ? "text-sm font-bold text-navy-900"
          : muted
            ? "text-xs font-semibold text-slate-500"
            : "text-sm font-semibold text-slate-600")
      }
    >
      {children}
    </div>
  );
}

function InputCell({ children, h }: { children: React.ReactNode; h: string }) {
  return (
    <div className={"flex items-center border-b border-slate-100 px-2.5 " + h}>
      <div className="w-full">{children}</div>
    </div>
  );
}

function CalcCell({
  children,
  h,
  muted,
  last,
  className = "",
}: {
  children: React.ReactNode;
  h: string;
  muted?: boolean;
  last?: boolean;
  className?: string;
}) {
  return (
    <div
      className={
        "flex items-center px-3 tabular-nums " +
        h +
        (last ? "" : " border-b border-slate-100") +
        " " +
        (muted ? "text-sm text-slate-500 " : "") +
        className
      }
    >
      {children}
    </div>
  );
}
