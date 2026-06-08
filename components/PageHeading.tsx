import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeftIcon } from "./icons";

export function PageHeading({
  icon,
  iconClass,
  title,
  subtitle,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <Link
        href="/"
        aria-label="Kembali ke beranda"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-navy-700 ring-1 ring-slate-200 transition hover:bg-slate-50 active:scale-95"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </Link>
      <span
        className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl " + iconClass}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <h1 className="truncate text-lg font-extrabold text-navy-900 sm:text-xl">{title}</h1>
        {subtitle ? <p className="truncate text-sm text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}
