# Portal Merchant — Bank Mandiri (KCP Surabaya Pemuda)

A small, fully-static **Next.js + TypeScript + Tailwind** toolkit for merchant-acquiring
sales in Bank Mandiri's navy + gold identity. The story is **merchant savings**: show a
prospect how much *lower* their fees are with Mandiri vs their current provider. Marketing-style
landing page plus two tools, a persistent tab navbar, and **styled `.xlsx` report export**.

- **Branch:** KCP Surabaya Pemuda · Area Transaction & Funding
- **Creator:** Kanaya Rifa Azzahra · Officer Development Program Batch 315

## Features

- **Landing page** (`/`) — marketing-style stacked sections: savings-focused hero, stats strip,
  alternating feature rows, "how it works" steps, and a contact CTA.
- **Kalkulator Fee** (`/calculator`) — compares the merchant's MDR cost **Mandiri vs provider
  lain** (Kartu/QRIS split). Output is framed as **penghematan** (savings): a green savings hero,
  a "% lebih hemat" **donut**, side-by-side cost bars, and a **1 / 3 / 6 / 12-month projection**.
- **Perbandingan Biaya EDC** (`/edc`) — wide **side-by-side benchmark** (rental + MDR + per-trx
  fee). **Mandiri is locked as the first/reference column**; add 1–3 competitors. Highlights the
  cheapest, shows **savings vs Mandiri** per provider, a sorted comparison bar chart, and a
  savings projection.
- **Excel export** — both tools export a beautifully formatted **`.xlsx`** (ExcelJS) with the
  Mandiri logo, branch, creator (Kanaya), today's date, savings, and the 1/3/6/12-month
  projection. ExcelJS is dynamically imported so it stays out of the initial bundle.
- **Persistent tool tabs** in the navbar (desktop + mobile) for fast page switching, plus a
  WhatsApp consultation CTA.
- Responsive (mobile / tablet / desktop). All math runs client-side; no backend, no data leaves
  the browser.

## Tech

| | |
|---|---|
| Framework | Next.js 14 (App Router), output: `export` (static) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Font | Plus Jakarta Sans (Google Fonts) |
| Hosting | Any static host (Vercel / Netlify / Cloudflare Pages / GitHub Pages) |

## Project structure

```text
public/
  mandiri-logo.png    # official Bank Mandiri logo badge
app/
  layout.tsx          # shell: Navbar + Footer, metadata
  globals.css         # tailwind + slider/input styling
  page.tsx            # landing page (hero, features, how-it-works, contact)
  calculator/page.tsx # Kalkulator Fee: Mandiri vs provider lain savings + projection
  edc/page.tsx        # Perbandingan Biaya EDC: side-by-side benchmark + savings
components/
  Brand.tsx           # logo badge + decorative gold wave
  Navbar.tsx          # sticky navbar with persistent tool tabs
  Footer.tsx          # slim footer
  PageHeading.tsx     # sub-page heading (back + icon + title)
  DownloadButton.tsx  # shared "Unduh Laporan (.xlsx)" button
  charts/
    DonutChart.tsx    # lightweight SVG donut (no deps)
  landing/
    FeatureRow.tsx    # alternating feature row (text + visual)
  ui.tsx              # Card, StepCard, inputs, StatBox
  icons.tsx           # inline SVG icons
lib/
  config.ts           # branch + creator details (single source of truth)
  format.ts           # Rupiah / percent / date helpers
  export.ts           # styled .xlsx report builders (ExcelJS, lazy-loaded)
```

## Run & verify

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export -> ./out
npx serve out        # preview the static build locally
```

## Customize

- **Branch / creator / WhatsApp**: edit `lib/config.ts` (single source of truth).
- **Logo**: replace `public/mandiri-logo.png`.
- **Palette**: tweak the `navy` / `gold` scales in `tailwind.config.ts`.
- **Rates**: default MDR assumptions live in each calculator page's initial state.

## Deploy (free)

- **Vercel**: import the repo — zero config. (Hobby plan is free for personal use.)
- **Static hosts**: run `npm run build`, then upload the generated `out/` folder.

> Note: rate defaults (Mandiri MDR Kartu 1.0% vs provider lain 2.0%, QRIS 0.7%) are editable
> placeholders for negotiation estimates, not official figures. QRIS is regulator-set and usually
> equal across providers, so card MDR drives the savings. Confirm against current ketentuan
> before quoting customers.
