import Link from "next/link";
import { FeatureRow } from "@/components/landing/FeatureRow";
import {
  CalculatorIcon,
  LayersIcon,
  WhatsAppIcon,
  TrophyIcon,
} from "@/components/icons";
import { BRANCH, CREATOR, waLink } from "@/lib/config";

const STATS = [
  { value: "2", label: "alat hitung" },
  { value: "Kartu & QRIS", label: "cakupan MDR" },
  { value: "2–4", label: "penyedia dibanding" },
  { value: "1 thn", label: "proyeksi hemat" },
];

const STEPS = [
  {
    title: "Masukkan data",
    desc: "Isi volume transaksi merchant — manual atau dari estimasi data pelanggan.",
  },
  {
    title: "Sesuaikan asumsi",
    desc: "Atur MDR, split Kartu/QRIS, atau daftar mesin EDC yang dibandingkan.",
  },
  {
    title: "Tunjukkan hasilnya",
    desc: "Angka fee, penghematan, dan biaya termurah langsung siap dinegosiasikan.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-600 via-navy-700 to-navy-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gold-400 ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {BRANCH.area}
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Biaya transaksi lebih hemat dengan EDC Mandiri.
            </h1>
            <p className="mt-4 max-w-md text-base text-white/70 sm:text-lg">
              Lihat berapa yang merchant bisa hemat dibanding penyedia lain —
              dihitung langsung dari nilai transaksi mereka, lengkap grafik &amp;
              proyeksi 1 tahun.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/calculator"
                className="rounded-xl bg-gold px-5 py-3 text-sm font-bold text-navy-900 shadow-sm transition hover:bg-gold-400 active:scale-[0.98]"
              >
                Hitung penghematan
              </Link>
              <a
                href={waLink("Halo Kak Kanaya, saya ingin konsultasi merchant.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Konsultasi
              </a>
            </div>
            <p className="mt-5 text-xs text-white/50">
              Estimasi instan · Tanpa login · Berjalan di perangkat Anda
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:grid-cols-4 sm:px-6">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={
                "px-4 py-6 text-center sm:py-7 " +
                (i !== 0 ? "border-slate-100 sm:border-l " : "") +
                (i >= 2 ? "border-t border-slate-100 sm:border-t-0" : "")
              }
            >
              <p className="text-xl font-extrabold text-navy-800 sm:text-2xl">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="fitur" className="scroll-mt-20 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-gold-600">
              Fitur
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              Dua alat untuk buktikan Mandiri lebih hemat.
            </h2>
            <p className="mt-3 text-slate-500">
              Tunjukkan penghematan nyata ke calon merchant — langsung dari angka
              transaksi mereka, lalu unduh laporannya.
            </p>
          </div>

          <div className="mt-14 space-y-16 sm:space-y-24">
            <FeatureRow
              eyebrow="Kalkulator Fee"
              icon={<CalculatorIcon className="h-6 w-6" />}
              iconClass="bg-navy-50 text-navy"
              title="Rincian fee MDR Mandiri, jelas per kategori."
              desc="Hitung fee yang dibayar merchant ke Mandiri — Kartu (Debit/Kredit, On-Us/Off-Us) & QRIS."
              bullets={[
                "Input volume manual atau dari estimasi data pelanggan",
                "Tarif tiap kategori bisa disesuaikan: Debit/Kredit On-Us/Off-Us & QRIS",
                "Komposisi sumber fee + proyeksi 1 / 3 / 6 / 12 bulan",
                "Unduh laporan .xlsx ber-brand Mandiri",
              ]}
              href="/calculator"
              cta="Buka Kalkulator Fee"
              visual={<FeePreview />}
            />
            <FeatureRow
              reverse
              eyebrow="Perbandingan Biaya EDC"
              icon={<LayersIcon className="h-6 w-6" />}
              iconClass="bg-emerald-50 text-emerald-600"
              title="Sandingkan biaya EDC, Mandiri vs penyedia lain."
              desc="Tabel benchmark side-by-side dengan Mandiri sebagai acuan dan rekomendasi otomatis."
              bullets={[
                "Mandiri terkunci sebagai kolom acuan",
                "Rincian biaya: sewa + MDR + fee per transaksi",
                "Grafik perbandingan + proyeksi penghematan",
                "Unduh laporan .xlsx untuk merchant",
              ]}
              href="/edc"
              cta="Buka Perbandingan EDC"
              visual={<EdcPreview />}
            />
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="cara-kerja" className="scroll-mt-20 bg-navy-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-gold-400">
              Cara Kerja
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Siap dipakai di depan merchant.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-base font-extrabold text-navy-900">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-white/60">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT CTA ===== */}
      <section id="kontak" className="scroll-mt-20 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy-700 to-navy-900 p-8 text-white shadow-card sm:p-12">
            <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-md">
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Butuh bantuan akuisisi merchant?
                </h2>
                <p className="mt-3 text-white/70">
                  Hubungi langsung Relationship Officer kami untuk konsultasi,
                  penawaran, dan pendampingan onboarding merchant.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-base font-extrabold text-navy-900">
                    {CREATOR.initials}
                  </span>
                  <div>
                    <p className="font-bold">{CREATOR.name}</p>
                    <p className="text-sm text-white/60">{CREATOR.program}</p>
                  </div>
                </div>
              </div>
              <a
                href={waLink("Halo Kak Kanaya, saya ingin konsultasi merchant.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 active:scale-[0.98] sm:w-auto"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {CREATOR.whatsappDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------- Illustrative preview cards (static mock data) ---------------- */

function PreviewCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "relative mx-auto w-full max-w-sm rounded-2xl bg-white p-5 text-slate-900 shadow-card ring-1 ring-slate-100 " +
        className
      }
    >
      {children}
    </div>
  );
}

function PreviewTag() {
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
      ilustrasi
    </span>
  );
}

function HeroPreview() {
  return (
    <PreviewCard className="lg:ml-auto">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400">Hemat / bulan dengan Mandiri</p>
        <PreviewTag />
      </div>
      <p className="mt-1 text-3xl font-extrabold tabular-nums text-emerald-600">
        Rp 3.400.000
      </p>
      <div className="mt-4 space-y-2.5">
        <div className="rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Provider lain</span>
            <span className="text-navy-900">Rp 6.900.000</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-slate-400" style={{ width: "100%" }} />
          </div>
        </div>
        <div className="rounded-xl bg-navy-50 px-3 py-2.5 ring-1 ring-navy-100">
          <div className="flex items-center justify-between text-[11px] font-semibold text-navy-700">
            <span>Mandiri</span>
            <span className="text-navy-900">Rp 3.500.000</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-navy" style={{ width: "51%" }} />
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-100">
        <span className="text-xs font-semibold text-emerald-700">Hemat / tahun</span>
        <span className="text-sm font-extrabold text-emerald-700">Rp 40.800.000</span>
      </div>
    </PreviewCard>
  );
}

function FeePreview() {
  const rows = [
    { label: "Debit On-Us", fee: "Rp 32.000", w: "10%", dot: "bg-navy" },
    { label: "Debit Off-Us", fee: "Rp 210.000", w: "26%", dot: "bg-gold" },
    { label: "Kredit On-Us", fee: "Rp 130.000", w: "16%", dot: "bg-blue-600" },
    { label: "Kredit Off-Us", fee: "Rp 194.000", w: "24%", dot: "bg-amber-300" },
    { label: "QRIS", fee: "Rp 280.000", w: "34%", dot: "bg-emerald-500" },
  ];
  return (
    <PreviewCard>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Rincian fee per kategori</span>
        <span className="text-navy-700">Mandiri</span>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className={"h-2 w-2 rounded-full " + r.dot} />
                {r.label}
              </span>
              <span className="font-bold text-navy-900">{r.fee}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-200">
              <div className={"h-full rounded-full " + r.dot} style={{ width: r.w }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-navy px-3 py-2.5 text-white">
        <span className="text-xs font-semibold">Total fee / bulan</span>
        <span className="text-sm font-extrabold">Rp 846.000</span>
      </div>
    </PreviewCard>
  );
}

function EdcPreview() {
  const rows = [
    { name: "Mandiri", total: "Rp 3.500.000", best: true },
    { name: "Provider B", total: "Rp 5.250.000", best: false },
    { name: "Provider C", total: "Rp 4.950.000", best: false },
  ];
  return (
    <PreviewCard>
      <p className="text-xs font-semibold text-slate-500">Total biaya / bulan</p>
      <div className="mt-3 space-y-2">
        {rows.map((r) => (
          <div
            key={r.name}
            className={
              "flex items-center justify-between rounded-xl px-3 py-2.5 ring-1 " +
              (r.best
                ? "bg-emerald-50 ring-emerald-200"
                : "bg-slate-50 ring-slate-100")
            }
          >
            <span className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
              {r.best && <TrophyIcon className="h-4 w-4 text-emerald-600" />}
              {r.name}
            </span>
            <span
              className={
                "text-sm font-extrabold tabular-nums " +
                (r.best ? "text-emerald-600" : "text-navy-900")
              }
            >
              {r.total}
            </span>
          </div>
        ))}
      </div>
    </PreviewCard>
  );
}
