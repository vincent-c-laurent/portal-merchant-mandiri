import { ReactNode } from "react";

export type DonutSegment = { label: string; value: number; color: string };

/** Lightweight SVG donut chart (no external deps). */
export function DonutChart({
  segments,
  size = 168,
  thickness = 26,
  centerTop,
  centerMain,
  centerSub,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerTop?: string;
  centerMain?: ReactNode;
  centerSub?: string;
}) {
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + (x.value > 0 ? x.value : 0), 0);

  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img">
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="#eef2f7"
          strokeWidth={thickness}
        />
        {total > 0 &&
          segments.map((s) => {
            const frac = (s.value > 0 ? s.value : 0) / total;
            const dash = frac * circ;
            const el = (
              <circle
                key={s.label}
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap={frac > 0 && frac < 1 ? "butt" : "round"}
              />
            );
            offset += dash;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerTop ? (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {centerTop}
          </span>
        ) : null}
        {centerMain ? (
          <span className="text-xl font-extrabold tabular-nums text-navy-900">
            {centerMain}
          </span>
        ) : null}
        {centerSub ? (
          <span className="text-xs text-slate-400">{centerSub}</span>
        ) : null}
      </div>
    </div>
  );
}
