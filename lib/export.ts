"use client";

// Styled .xlsx report generation (Bank Mandiri navy/gold theme) using ExcelJS.
// Workbook builders are DOM-free (testable in Node); the download helpers wrap
// them with logo fetching + a browser download. ExcelJS is dynamically imported
// so it stays out of the initial bundle.

import type ExcelJS from "exceljs";
import { todayLabel } from "./format";
import { BRANCH, CREATOR } from "./config";
import {
  FEE_CATEGORIES,
  type FeeRates,
  type SplitMix,
  categoryVolumes,
  feeBreakdown,
  totalFee,
} from "./feeModel";

const splitText = (left: number) => `${left}% / ${100 - left}%`;

type Workbook = ExcelJS.Workbook;
type Worksheet = ExcelJS.Worksheet;
type Cell = ExcelJS.Cell;

const C = {
  navy: "FF003B79",
  navyDark: "FF002A57",
  gold: "FFF5B301",
  goldSoft: "FFFCEFC7",
  green: "FF059669",
  greenSoft: "FFD1FAE5",
  band: "FFEAF1F8",
  zebra: "FFF8FAFC",
  border: "FFD8E1EC",
  text: "FF1E293B",
  subtle: "FF64748B",
  white: "FFFFFFFF",
  redSoft: "FFFEE2E2",
  red: "FFB91C1C",
};

const MONEY = '"Rp"\\ #,##0';
const PCT = '0.0"%"';
const PERIODS = [1, 3, 6, 12];

const periodLabel = (m: number) => (m === 12 ? "12 bulan (1 tahun)" : `${m} bulan`);

function colLetter(n: number): string {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

const thin = (argb = C.border) => ({ style: "thin" as const, color: { argb } });
const allBorders = (argb = C.border) => ({
  top: thin(argb),
  left: thin(argb),
  bottom: thin(argb),
  right: thin(argb),
});

function fill(cell: Cell, argb: string) {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb } };
}

async function getExcelJS(): Promise<typeof ExcelJS> {
  const mod: unknown = await import("exceljs");
  return ((mod as { default?: typeof ExcelJS }).default ?? mod) as typeof ExcelJS;
}

// ---------- shared header ----------

function writeHeader(
  ws: Worksheet,
  title: string,
  spanCols: number,
  logoImageId?: number
): number {
  const last = colLetter(spanCols);
  const { day, date } = todayLabel();

  ws.mergeCells(`A1:${last}1`);
  const t = ws.getCell("A1");
  t.value = title;
  t.font = { name: "Calibri", size: 15, bold: true, color: { argb: C.navy } };
  t.alignment = { vertical: "middle", horizontal: "left" };
  ws.getRow(1).height = 30;

  ws.mergeCells(`A2:${last}2`);
  const s = ws.getCell("A2");
  s.value = "Bank Mandiri · Portal Merchant Acquiring";
  s.font = { name: "Calibri", size: 9, color: { argb: C.subtle } };
  ws.getRow(2).height = 14;

  const meta: [string, string][] = [
    ["Cabang", `${BRANCH.label} · ${BRANCH.area}`],
    ["Disiapkan oleh", `${CREATOR.name} · ${CREATOR.program}`],
    ["Tanggal", `${day}, ${date}`],
  ];
  meta.forEach(([k, v], i) => {
    const row = 3 + i;
    const kc = ws.getCell(`A${row}`);
    kc.value = k;
    kc.font = { name: "Calibri", size: 10, bold: true, color: { argb: C.navy } };
    ws.mergeCells(`B${row}:${last}${row}`);
    const vc = ws.getCell(`B${row}`);
    vc.value = v;
    vc.font = { name: "Calibri", size: 10, color: { argb: C.text } };
    ws.getRow(row).height = 15;
  });

  // gold rule
  for (let c = 1; c <= spanCols; c++) {
    ws.getCell(`${colLetter(c)}6`).border = { bottom: { style: "medium", color: { argb: C.gold } } };
  }
  ws.getRow(6).height = 6;

  if (logoImageId !== undefined) {
    ws.addImage(logoImageId, {
      tl: { col: spanCols - 1.05, row: 0.15 },
      ext: { width: 118, height: 34 },
    });
  }

  return 8; // first content row
}

function sectionTitle(ws: Worksheet, row: number, span: number, text: string) {
  ws.mergeCells(`A${row}:${colLetter(span)}${row}`);
  const c = ws.getCell(`A${row}`);
  c.value = text;
  c.font = { name: "Calibri", size: 11, bold: true, color: { argb: C.white } };
  c.alignment = { vertical: "middle", horizontal: "left" };
  fill(c, C.navy);
  ws.getRow(row).height = 22;
}

function tableHeader(ws: Worksheet, row: number, headers: string[]) {
  headers.forEach((h, i) => {
    const c = ws.getCell(`${colLetter(i + 1)}${row}`);
    c.value = h;
    c.font = { name: "Calibri", size: 10, bold: true, color: { argb: C.navy } };
    c.alignment = { vertical: "middle", horizontal: i === 0 ? "left" : "right", wrapText: true };
    fill(c, C.band);
    c.border = allBorders();
  });
  ws.getRow(row).height = 20;
}

type CellSpec = {
  v: string | number;
  money?: boolean;
  pct?: boolean;
  bold?: boolean;
  fillArgb?: string;
  color?: string;
  align?: "left" | "right" | "center";
};

function dataRow(ws: Worksheet, row: number, cells: CellSpec[], zebra = false) {
  cells.forEach((spec, i) => {
    const c = ws.getCell(`${colLetter(i + 1)}${row}`);
    c.value = spec.v;
    if (spec.money) c.numFmt = MONEY;
    if (spec.pct) c.numFmt = PCT;
    c.font = {
      name: "Calibri",
      size: 10,
      bold: !!spec.bold,
      color: { argb: spec.color ?? C.text },
    };
    c.alignment = {
      vertical: "middle",
      horizontal: spec.align ?? (i === 0 ? "left" : "right"),
    };
    c.border = allBorders();
    if (spec.fillArgb) fill(c, spec.fillArgb);
    else if (zebra) fill(c, C.zebra);
  });
  ws.getRow(row).height = 18;
}

// ---------- Fee report ----------

export interface FeeReportData {
  volume: number;
  mix: SplitMix;
  mandiriRates: FeeRates;
}

export async function buildFeeWorkbook(
  d: FeeReportData,
  logoBuffer?: ArrayBuffer
): Promise<Workbook> {
  const ExcelJSLib = await getExcelJS();
  const wb = new ExcelJSLib.Workbook();
  wb.creator = CREATOR.name;
  wb.created = new Date();
  const ws = wb.addWorksheet("Fee MDR Mandiri", {
    properties: { defaultColWidth: 18 },
    pageSetup: { fitToPage: true, orientation: "portrait" },
  });

  ws.getColumn(1).width = 30;
  [2, 3, 4].forEach((c) => (ws.getColumn(c).width = 20));

  let logoId: number | undefined;
  if (logoBuffer) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logoId = wb.addImage({ buffer: logoBuffer as any, extension: "png" });
  }
  let r = writeHeader(ws, "Laporan Rincian Fee MDR Mandiri", 4, logoId);

  const vols = categoryVolumes(d.volume, d.mix);
  const breakdown = feeBreakdown(vols, d.mandiriRates);
  const total = totalFee(vols, d.mandiriRates);

  // Input
  sectionTitle(ws, r, 4, "Asumsi Transaksi Merchant");
  r++;
  dataRow(ws, r++, [
    { v: "Volume transaksi / bulan" },
    { v: d.volume, money: true },
    { v: "" },
    { v: "" },
  ]);
  const splits: [string, number][] = [
    ["Porsi Kartu / QRIS", d.mix.kartuPct],
    ["Porsi Debit / Kredit (dari Kartu)", d.mix.debitPct],
    ["Debit On-Us / Off-Us", d.mix.debitOnPct],
    ["Kredit On-Us / Off-Us", d.mix.kreditOnPct],
  ];
  splits.forEach(([label, pct], i) =>
    dataRow(
      ws,
      r++,
      [{ v: label }, { v: splitText(pct), align: "right" }, { v: "" }, { v: "" }],
      i % 2 === 0
    )
  );
  r++;

  // Per-category fee
  sectionTitle(ws, r, 4, "Rincian Fee per Kategori");
  r++;
  tableHeader(ws, r, ["Kategori", "Tarif", "Volume", "Fee / bulan"]);
  r++;
  FEE_CATEGORIES.forEach((c, i) =>
    dataRow(
      ws,
      r++,
      [
        { v: c.label },
        { v: d.mandiriRates[c.key], pct: true },
        { v: vols[c.key], money: true },
        { v: breakdown[c.key], money: true, bold: true },
      ],
      i % 2 === 1
    )
  );
  dataRow(ws, r++, [
    { v: "Total Fee / Bulan", bold: true },
    { v: "", align: "right" },
    { v: d.volume, money: true, bold: true },
    { v: total, money: true, bold: true, color: C.navy, fillArgb: C.goldSoft },
  ]);
  r++;

  // Projection
  sectionTitle(ws, r, 4, "Proyeksi Fee Kumulatif");
  r++;
  tableHeader(ws, r, ["Periode", "Estimasi Fee Kumulatif", "", ""]);
  r++;
  PERIODS.forEach((m, i) => {
    dataRow(
      ws,
      r++,
      [
        { v: periodLabel(m) },
        { v: total * m, money: true, bold: true, color: C.navy },
        { v: "" },
        { v: "" },
      ],
      i % 2 === 1
    );
  });

  return wb;
}

// ---------- EDC report ----------

export interface EdcBankData {
  name: string;
  rates: FeeRates;
}

export interface EdcReportData {
  volume: number;
  mix: SplitMix;
  banks: EdcBankData[]; // [0] = Mandiri
}

export async function buildEdcWorkbook(
  d: EdcReportData,
  logoBuffer?: ArrayBuffer
): Promise<Workbook> {
  const ExcelJSLib = await getExcelJS();
  const wb = new ExcelJSLib.Workbook();
  wb.creator = CREATOR.name;
  wb.created = new Date();
  const ws = wb.addWorksheet("Perbandingan EDC", {
    pageSetup: { fitToPage: true, orientation: "landscape" },
  });

  const vols = categoryVolumes(d.volume, d.mix);

  const computed = d.banks.map((b) => ({ ...b, total: totalFee(vols, b.rates) }));
  const mandiri = computed[0];
  const competitors = computed.slice(1);
  const baseline =
    competitors.length > 0
      ? competitors.reduce((a, b) => (b.total > a.total ? b : a))
      : mandiri;
  const saving = baseline.total - mandiri.total;

  const span = 1 + computed.length;
  ws.getColumn(1).width = 26;
  for (let i = 0; i < computed.length; i++) ws.getColumn(i + 2).width = 18;

  let logoId: number | undefined;
  if (logoBuffer) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logoId = wb.addImage({ buffer: logoBuffer as any, extension: "png" });
  }
  let r = writeHeader(ws, "Laporan Perbandingan Biaya EDC", span, logoId);

  // Inputs
  sectionTitle(ws, r, span, "Asumsi Transaksi Merchant");
  r++;
  const blanks = () => Array(computed.length - 1).fill({ v: "" });
  dataRow(ws, r++, [
    { v: "Volume transaksi / bulan" },
    { v: d.volume, money: true },
    ...blanks(),
  ]);
  const splits: [string, number][] = [
    ["Porsi Kartu / QRIS", d.mix.kartuPct],
    ["Porsi Debit / Kredit (dari Kartu)", d.mix.debitPct],
    ["Debit On-Us / Off-Us", d.mix.debitOnPct],
    ["Kredit On-Us / Off-Us", d.mix.kreditOnPct],
  ];
  splits.forEach(([label, pct], i) =>
    dataRow(ws, r++, [{ v: label }, { v: splitText(pct), align: "right" }, ...blanks()], i % 2 === 0)
  );
  r++;

  // Comparison table
  sectionTitle(ws, r, span, "Perbandingan Biaya per Bulan");
  r++;
  // header with bank names (Mandiri highlighted gold)
  const headRow = r;
  const h0 = ws.getCell(`A${headRow}`);
  h0.value = "Komponen";
  h0.font = { name: "Calibri", size: 10, bold: true, color: { argb: C.navy } };
  h0.alignment = { vertical: "middle", horizontal: "left" };
  fill(h0, C.band);
  h0.border = allBorders();
  computed.forEach((m, i) => {
    const c = ws.getCell(`${colLetter(i + 2)}${headRow}`);
    c.value = i === 0 ? `${m.name} (Kami)` : m.name;
    c.font = { name: "Calibri", size: 10, bold: true, color: { argb: i === 0 ? C.navy : C.text } };
    c.alignment = { vertical: "middle", horizontal: "right" };
    fill(c, i === 0 ? C.gold : C.band);
    c.border = allBorders();
  });
  ws.getRow(headRow).height = 20;
  r++;

  const minTotal = Math.min(...computed.map((m) => m.total));
  const rowDefs: { label: string; get: (m: (typeof computed)[0]) => CellSpec; bold?: boolean }[] = [
    ...FEE_CATEGORIES.map((c) => ({
      label: `MDR ${c.label}`,
      get: (m: (typeof computed)[0]) => ({ v: m.rates[c.key], pct: true }),
    })),
    {
      label: "Total biaya / bulan",
      bold: true,
      get: (m) => ({
        v: m.total,
        money: true,
        bold: true,
        color: m.total === minTotal ? C.green : C.text,
        fillArgb: m.total === minTotal ? C.greenSoft : undefined,
      }),
    },
    {
      label: "Selisih vs Mandiri",
      get: (m) => {
        const diff = m.total - mandiri.total;
        return {
          v: diff === 0 ? "—" : diff,
          money: diff !== 0,
          color: diff > 0 ? C.green : diff < 0 ? C.red : C.subtle,
          align: "right" as const,
        };
      },
    },
  ];
  rowDefs.forEach((def, idx) => {
    const cells: CellSpec[] = [{ v: def.label, bold: def.bold }];
    computed.forEach((m, i) => {
      const spec = def.get(m);
      if (i === 0 && !spec.fillArgb && def.label !== "Selisih vs Mandiri")
        spec.fillArgb = C.goldSoft;
      cells.push(spec);
    });
    dataRow(ws, r++, cells, idx % 2 === 1);
  });
  r++;

  // Projection
  sectionTitle(ws, r, span, `Proyeksi Penghematan dengan Mandiri (vs ${baseline.name})`);
  r++;
  tableHeader(ws, r, ["Periode", "Biaya Mandiri", `Biaya ${baseline.name}`, "Total Hemat"]);
  r++;
  PERIODS.forEach((m, i) => {
    const cells: CellSpec[] = [
      { v: periodLabel(m) },
      { v: mandiri.total * m, money: true },
      { v: baseline.total * m, money: true },
      { v: saving * m, money: true, bold: true, color: C.green },
    ];
    dataRow(ws, r++, cells, i % 2 === 1);
  });

  return wb;
}

// ---------- browser download helpers ----------

async function fetchLogo(): Promise<ArrayBuffer | undefined> {
  try {
    const res = await fetch("/mandiri-logo.png");
    if (!res.ok) return undefined;
    return await res.arrayBuffer();
  } catch {
    return undefined;
  }
}

async function download(wb: Workbook, filename: string) {
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function stamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function downloadFeeReport(d: FeeReportData) {
  const logo = await fetchLogo();
  const wb = await buildFeeWorkbook(d, logo);
  await download(wb, `Rincian-Fee-MDR-Mandiri_${stamp()}.xlsx`);
}

export async function downloadEdcReport(d: EdcReportData) {
  const logo = await fetchLogo();
  const wb = await buildEdcWorkbook(d, logo);
  await download(wb, `Perbandingan-EDC-Mandiri_${stamp()}.xlsx`);
}
