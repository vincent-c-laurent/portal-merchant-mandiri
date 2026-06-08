import Link from "next/link";
import { ReactNode } from "react";
import { CheckIcon, ChevronRightIcon } from "../icons";

export function FeatureRow({
  eyebrow,
  icon,
  iconClass,
  title,
  desc,
  bullets,
  href,
  cta,
  visual,
  reverse = false,
}: {
  eyebrow: string;
  icon: ReactNode;
  iconClass: string;
  title: string;
  desc: string;
  bullets: string[];
  href: string;
  cta: string;
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div className={reverse ? "lg:order-2" : ""}>
        <span
          className={"inline-flex h-11 w-11 items-center justify-center rounded-xl " + iconClass}
        >
          {icon}
        </span>
        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-gold-600">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
          {title}
        </h3>
        <p className="mt-3 text-slate-500">{desc}</p>
        <ul className="mt-5 space-y-2.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-slate-600">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-800 active:scale-[0.98]"
        >
          {cta}
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>{visual}</div>
    </div>
  );
}
