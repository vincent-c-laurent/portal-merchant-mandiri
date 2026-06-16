"use client";

// Branded PDF report generation (Bank Mandiri navy/gold theme) using jsPDF +
// jspdf-autotable. Mirrors the .xlsx reports in lib/export.ts. Both libraries
// are dynamically imported so they stay out of the initial bundle.

import type { jsPDF as JsPDFType } from "jspdf";
import type { UserOptions, CellHookData } from "jspdf-autotable";
import { todayLabel, formatRupiah, formatPercent } from "./format";
import { BRANCH, CREATOR } from "./config";
import {
  FEE_CATEGORIES,
  categoryVolumes,
  feeBreakdown,
  totalFee,
} from "./feeModel";
import type { FeeReportData, EdcReportData } from "./export";

type RGB = [number, number, number];
const NAVY: RGB = [0, 59, 121];
const GOLD: RGB = [245, 179, 1];
const GREEN: RGB = [5, 150, 105];
const RED: RGB = [185, 28, 28];
const TEXT: RGB = [30, 41, 59];
const SUBTLE: RGB = [100, 116, 139];
const BAND: RGB = [234, 241, 248];
const ZEBRA: RGB = [248, 250, 252];
const BORDER: RGB = [216, 225, 236];
const GOLD_SOFT: RGB = [252, 239, 199];
const GREEN_SOFT: RGB = [209, 250, 229];
const WHITE: RGB = [255, 255, 255];

const M = 40; // page margin (pt)
const PERIODS = [1, 3, 6, 12];
const periodLabel = (m: number) => (m === 12 ? "12 bulan (1 tahun)" : `${m} bulan`);
const splitText = (left: number) => `${left}% / ${100 - left}%`;
const pct = (n: number) => formatPercent(n, 2);
const stamp = () => new Date().toISOString().slice(0, 10);

type AutoTableFn = (doc: JsPDFType, options: UserOptions) => void;

async function getPdf(): Promise<{ jsPDF: typeof import("jspdf").jsPDF; autoTable: AutoTableFn }> {
  const [{ jsPDF }, at] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  return { jsPDF, autoTable: at.default as unknown as AutoTableFn };
}

async function fetchLogoDataUrl(): Promise<string | undefined> {
  try {
    const res = await fetch("/mandiri-logo.png");
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return await new Promise<string | undefined>((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => resolve(undefined);
      fr.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

function drawHeader(doc: JsPDFType, title: string, logo?: string): number {
  const pageW = doc.internal.pageSize.getWidth();
  const { day, date } = todayLabel();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...NAVY);
  doc.text(title, M, 44);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SUBTLE);
  doc.text("Bank Mandiri · Portal Merchant Acquiring", M, 58);

  const meta: [string, string][] = [
    ["Cabang", `${BRANCH.label} · ${BRANCH.area}`],
    ["Disiapkan oleh", `${CREATOR.name} · ${CREATOR.program}`],
    ["Tanggal", `${day}, ${date}`],
  ];
  let y = 76;
  meta.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.setFontSize(9);
    doc.text(k, M, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT);
    doc.text(v, M + 72, y);
    y += 13;
  });

  if (logo) {
    try {
      doc.addImage(logo, "PNG", pageW - M - 110, 28, 110, 32);
    } catch {
      /* logo optional */
    }
  }

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(2);
  doc.line(M, y + 2, pageW - M, y + 2);

  return y + 20;
}

function sectionTitle(doc: JsPDFType, y: number, text: string): number {
  const w = doc.internal.pageSize.getWidth() - M * 2;
  doc.setFillColor(...NAVY);
  doc.rect(M, y, w, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text(text, M + 6, y + 12.5);
  return y + 18 + 4;
}

function drawFooter(doc: JsPDFType) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...SUBTLE);
  doc.text(
    `© ${new Date().getFullYear()} Bank Mandiri · Alat bantu internal — estimasi, hasil akhir mengikuti ketentuan resmi.`,
    M,
    pageH - 24
  );
  doc.text(`${BRANCH.label}`, pageW - M, pageH - 24, { align: "right" });
}

function finalY(doc: JsPDFType): number {
  // jspdf-autotable stores the last table on the doc instance.
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}

const baseStyles = {
  font: "helvetica" as const,
  fontSize: 9,
  textColor: TEXT,
  lineColor: BORDER,
  lineWidth: 0.5,
  cellPadding: 5,
};

// ---------------- Fee report (Mandiri-only breakdown) ----------------

export async function downloadFeePdf(d: FeeReportData) {
  const { jsPDF, autoTable } = await getPdf();
  const logo = await fetchLogoDataUrl();
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const vols = categoryVolumes(d.volume, d.mix);
  const breakdown = feeBreakdown(vols, d.mandiriRates);
  const total = totalFee(vols, d.mandiriRates);

  let y = drawHeader(doc, "Laporan Rincian Fee MDR Mandiri", logo);

  y = sectionTitle(doc, y, "Asumsi Transaksi Merchant");
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: "grid",
    styles: baseStyles,
    body: [
      ["Volume transaksi / bulan", formatRupiah(d.volume)],
      ["Porsi Kartu / QRIS", splitText(d.mix.kartuPct)],
      ["Porsi Debit / Kredit (dari Kartu)", splitText(d.mix.debitPct)],
      ["Debit On-Us / Off-Us", splitText(d.mix.debitOnPct)],
      ["Kredit On-Us / Off-Us", splitText(d.mix.kreditOnPct)],
    ],
    columnStyles: { 0: { cellWidth: 260 }, 1: { halign: "right" } },
  });
  y = finalY(doc) + 16;

  y = sectionTitle(doc, y, "Rincian Fee per Kategori");
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: "striped",
    styles: baseStyles,
    alternateRowStyles: { fillColor: ZEBRA },
    headStyles: { fillColor: BAND, textColor: NAVY, fontStyle: "bold", lineColor: BORDER, lineWidth: 0.5 },
    footStyles: { fillColor: GOLD_SOFT, textColor: NAVY, fontStyle: "bold", lineColor: BORDER, lineWidth: 0.5 },
    head: [["Kategori", "Tarif", "Volume", "Fee / bulan"]],
    body: FEE_CATEGORIES.map((c) => [
      c.label,
      pct(d.mandiriRates[c.key]),
      formatRupiah(vols[c.key]),
      formatRupiah(breakdown[c.key]),
    ]),
    foot: [["Total Fee / Bulan", "", formatRupiah(d.volume), formatRupiah(total)]],
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right", fontStyle: "bold" },
    },
  });
  y = finalY(doc) + 16;

  y = sectionTitle(doc, y, "Proyeksi Fee Kumulatif");
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: "striped",
    styles: baseStyles,
    alternateRowStyles: { fillColor: ZEBRA },
    headStyles: { fillColor: BAND, textColor: NAVY, fontStyle: "bold", lineColor: BORDER, lineWidth: 0.5 },
    head: [["Periode", "Estimasi Fee Kumulatif"]],
    body: PERIODS.map((m) => [periodLabel(m), formatRupiah(total * m)]),
    columnStyles: { 1: { halign: "right", fontStyle: "bold", textColor: NAVY } },
  });

  drawFooter(doc);
  doc.save(`Rincian-Fee-MDR-Mandiri_${stamp()}.pdf`);
}

// ---------------- EDC comparison report ----------------

export async function downloadEdcPdf(d: EdcReportData) {
  const { jsPDF, autoTable } = await getPdf();
  const logo = await fetchLogoDataUrl();
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const vols = categoryVolumes(d.volume, d.mix);
  const computed = d.banks.map((b) => ({ name: b.name, rates: b.rates, total: totalFee(vols, b.rates) }));
  const mandiri = computed[0];
  const competitors = computed.slice(1);
  const baseline =
    competitors.length > 0
      ? competitors.reduce((a, b) => (b.total > a.total ? b : a))
      : mandiri;
  const saving = baseline.total - mandiri.total;
  const minTotal = Math.min(...computed.map((m) => m.total));

  let y = drawHeader(doc, "Laporan Perbandingan Biaya EDC", logo);

  y = sectionTitle(doc, y, "Asumsi Transaksi Merchant");
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: "grid",
    styles: baseStyles,
    body: [
      ["Volume transaksi / bulan", formatRupiah(d.volume)],
      ["Porsi Kartu / QRIS", splitText(d.mix.kartuPct)],
      ["Porsi Debit / Kredit (dari Kartu)", splitText(d.mix.debitPct)],
      ["Debit On-Us / Off-Us", splitText(d.mix.debitOnPct)],
      ["Kredit On-Us / Off-Us", splitText(d.mix.kreditOnPct)],
    ],
    columnStyles: { 0: { cellWidth: 280 }, 1: { halign: "right" } },
  });
  y = finalY(doc) + 16;

  // Comparison: rows = MDR categories + Total + Selisih; cols = Komponen + banks.
  const N = FEE_CATEGORIES.length;
  const head = [["Komponen", ...computed.map((m, i) => (i === 0 ? `${m.name} (Kami)` : m.name))]];
  const body: string[][] = [
    ...FEE_CATEGORIES.map((c) => [`MDR ${c.label}`, ...computed.map((m) => pct(m.rates[c.key]))]),
    ["Total biaya / bulan", ...computed.map((m) => formatRupiah(m.total))],
    [
      "Selisih vs Mandiri",
      ...computed.map((m) => {
        const diff = m.total - mandiri.total;
        return diff === 0 ? "—" : (diff > 0 ? "+" : "") + formatRupiah(diff);
      }),
    ],
  ];
  const TOTAL_ROW = N;
  const DIFF_ROW = N + 1;

  y = sectionTitle(doc, y, "Perbandingan Biaya per Bulan");
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: "striped",
    styles: baseStyles,
    alternateRowStyles: { fillColor: ZEBRA },
    headStyles: { fillColor: BAND, textColor: NAVY, fontStyle: "bold", halign: "left", lineColor: BORDER, lineWidth: 0.5 },
    head,
    body,
    columnStyles: { 0: { halign: "left", cellWidth: 150 } },
    didParseCell: (data: CellHookData) => {
      const col = data.column.index; // 0 = Komponen, 1.. = banks
      const bank = col - 1;
      if (col === 0) {
        if (data.section === "head") data.cell.styles.halign = "left";
        return;
      }
      // Mandiri column emphasis
      if (data.section === "head" && bank === 0) {
        data.cell.styles.fillColor = GOLD;
        data.cell.styles.textColor = NAVY;
      }
      if (data.section === "body") {
        const row = data.row.index;
        if (bank === 0 && row <= TOTAL_ROW) data.cell.styles.fillColor = GOLD_SOFT;
        if (row === TOTAL_ROW) {
          data.cell.styles.fontStyle = "bold";
          if (computed[bank] && computed[bank].total === minTotal) {
            data.cell.styles.textColor = GREEN;
            data.cell.styles.fillColor = GREEN_SOFT;
          }
        }
        if (row === DIFF_ROW) {
          const diff = computed[bank] ? computed[bank].total - mandiri.total : 0;
          data.cell.styles.textColor = diff > 0 ? GREEN : diff < 0 ? RED : SUBTLE;
        }
      }
    },
  });
  y = finalY(doc) + 16;

  y = sectionTitle(doc, y, `Proyeksi Penghematan dengan Mandiri (vs ${baseline.name})`);
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: "striped",
    styles: baseStyles,
    alternateRowStyles: { fillColor: ZEBRA },
    headStyles: { fillColor: BAND, textColor: NAVY, fontStyle: "bold", lineColor: BORDER, lineWidth: 0.5 },
    head: [["Periode", "Biaya Mandiri", `Biaya ${baseline.name}`, "Total Hemat"]],
    body: PERIODS.map((m) => [
      periodLabel(m),
      formatRupiah(mandiri.total * m),
      formatRupiah(baseline.total * m),
      formatRupiah(saving * m),
    ]),
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right", fontStyle: "bold", textColor: saving >= 0 ? GREEN : RED },
    },
  });

  drawFooter(doc);
  doc.save(`Perbandingan-EDC-Mandiri_${stamp()}.pdf`);
}
