// Single source of truth for branch + creator details.
// Edit here to repoint the portal to a different office/officer.

export const APP = {
  name: "Portal Merchant",
  tagline: "Toolkit Akuisisi Merchant",
};

export const BRANCH = {
  name: "Surabaya Pemuda",
  label: "KCP Surabaya Pemuda",
  area: "Area Transaction & Funding",
};

export const CREATOR = {
  name: "Kanaya Rifa Azzahra",
  initials: "KA",
  program: "Officer Development Program Batch 315",
  role: "ODP",
  whatsapp: "6281927111103",
  whatsappDisplay: "+62 819-2711-1103",
};

// The actual tools (separate routes) — shown as persistent tabs in the navbar.
export const TOOLS = [
  {
    href: "/calculator",
    key: "calculator",
    label: "Kalkulator Fee",
    nav: "Kalkulator Fee",
    short: "Fee",
    desc: "Rincian fee MDR yang dibayar merchant ke Mandiri, lengkap per kategori.",
  },
  {
    href: "/edc",
    key: "edc",
    label: "Perbandingan Biaya EDC",
    nav: "Perbandingan EDC",
    short: "EDC",
    desc: "Buktikan biaya EDC Mandiri lebih murah dari penyedia lain, side-by-side.",
  },
] as const;

export const waLink = (text?: string) =>
  `https://wa.me/${CREATOR.whatsapp}` +
  (text ? `?text=${encodeURIComponent(text)}` : "");
