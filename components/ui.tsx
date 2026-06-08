"use client";

import { ReactNode, useEffect, useState } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-2xl bg-white p-5 shadow-card-sm ring-1 ring-slate-100 sm:p-6 " +
        className
      }
    >
      {children}
    </div>
  );
}

export function StepCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
          {step}
        </span>
        <h2 className="text-base font-bold text-navy-900 sm:text-lg">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

export function Label({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
      {children}
      {hint ? <span className="ml-1 font-normal text-slate-400">{hint}</span> : null}
    </label>
  );
}

/** Currency input that shows a "Rp" prefix and formats with thousands separators. */
export function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  id,
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  id?: string;
}) {
  const display = value > 0 ? new Intl.NumberFormat("id-ID").format(value) : "";
  return (
    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-navy focus-within:bg-white focus-within:ring-2 focus-within:ring-navy/15">
      <span className="mr-2 select-none text-sm font-semibold text-slate-400">Rp</span>
      <input
        id={id}
        inputMode="numeric"
        className="w-full bg-transparent py-3 text-base font-semibold text-navy-900 outline-none placeholder:font-normal placeholder:text-slate-400"
        value={display}
        placeholder={placeholder}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, "");
          onChange(digits ? parseInt(digits, 10) : 0);
        }}
      />
    </div>
  );
}

/** Numeric input with a unit suffix (e.g. "%", "x", "hari").
 *  Keeps an internal text buffer so a 0 default shows empty (no "01" leading zero)
 *  while still supporting decimals mid-typing. */
export function UnitInput({
  value,
  onChange,
  unit,
  step = 1,
  min = 0,
  max,
  id,
}: {
  value: number;
  onChange: (n: number) => void;
  unit: string;
  step?: number;
  min?: number;
  max?: number;
  id?: string;
}) {
  const [text, setText] = useState(value === 0 ? "" : String(value));

  // Re-sync the buffer when the value changes from outside this input.
  useEffect(() => {
    const parsed = text === "" ? 0 : parseFloat(text);
    if (parsed !== value) setText(value === 0 ? "" : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-navy focus-within:bg-white focus-within:ring-2 focus-within:ring-navy/15">
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        placeholder="0"
        className="w-full bg-transparent py-3 text-base font-semibold text-navy-900 outline-none placeholder:font-normal placeholder:text-slate-400"
        value={text}
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          const n = raw === "" ? 0 : parseFloat(raw);
          onChange(Number.isFinite(n) ? n : 0);
        }}
      />
      <span className="ml-2 select-none text-sm font-semibold text-slate-400">{unit}</span>
    </div>
  );
}

/** Split control: a range slider whose percentage is also manually editable.
 *  `value` is the left side's percent (0–100); the right side is the remainder. */
export function PercentSlider({
  value,
  onChange,
  leftLabel,
  rightLabel,
  step = 5,
}: {
  value: number;
  onChange: (n: number) => void;
  leftLabel: string;
  rightLabel: string;
  step?: number;
}) {
  const clamp = (n: number) => Math.max(0, Math.min(100, Number.isNaN(n) ? 0 : n));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-600">
          {leftLabel}: {value}% | {rightLabel}: {100 - value}%
        </span>
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 transition focus-within:border-navy focus-within:bg-white focus-within:ring-2 focus-within:ring-navy/15">
          <input
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            aria-label={`Persen ${leftLabel}`}
            className="w-10 bg-transparent py-1 text-right text-sm font-bold tabular-nums text-navy-700 outline-none"
            value={value === 0 ? "" : value}
            placeholder="0"
            onChange={(e) =>
              onChange(clamp(e.target.value === "" ? 0 : parseInt(e.target.value, 10)))
            }
          />
          <span className="select-none text-sm font-semibold text-slate-400">%</span>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full"
        aria-label={leftLabel}
      />
    </div>
  );
}

export function StatBox({
  label,
  value,
  tone = "navy",
  icon,
}: {
  label: string;
  value: string;
  tone?: "navy" | "gold" | "green" | "slate";
  icon?: ReactNode;
}) {
  const tones: Record<string, string> = {
    navy: "bg-navy-50 text-navy-800 ring-navy-100",
    gold: "bg-amber-50 text-amber-700 ring-amber-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-200",
  };
  return (
    <div className={"rounded-xl px-4 py-3 ring-1 " + tones[tone]}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-80">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-lg font-extrabold tabular-nums sm:text-xl">{value}</div>
    </div>
  );
}
