"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BankLogo } from "./Brand";
import { CalculatorIcon, LayersIcon, WhatsAppIcon } from "./icons";
import { TOOLS, APP, waLink } from "@/lib/config";

const TOOL_ICONS = {
  calculator: CalculatorIcon,
  edc: LayersIcon,
} as const;

export function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <BankLogo height={30} />
          <span className="hidden border-l border-slate-200 pl-2.5 text-sm font-semibold text-slate-400 lg:inline">
            {APP.name}
          </span>
        </Link>

        {/* Persistent tool tabs (all breakpoints) */}
        <nav className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
          {TOOLS.map((t) => {
            const Icon = TOOL_ICONS[t.key];
            const active = isActive(t.href);
            return (
              <Link
                key={t.key}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition sm:px-4 " +
                  (active
                    ? "bg-white text-navy-800 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-navy-700")
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{t.nav}</span>
                <span className="sm:hidden">{t.short}</span>
              </Link>
            );
          })}
        </nav>

        <a
          href={waLink("Halo Kak Kanaya, saya ingin konsultasi merchant.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Konsultasi via WhatsApp"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-navy px-3 py-2 text-sm font-bold text-white transition hover:bg-navy-800 sm:rounded-lg"
        >
          <WhatsAppIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Konsultasi</span>
        </a>
      </div>
    </header>
  );
}
