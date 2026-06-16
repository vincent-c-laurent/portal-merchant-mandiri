import { ReactNode } from "react";
import { DownloadIcon } from "./icons";

export function DownloadButton({
  onClick,
  loading,
  disabled,
  label = "Unduh Laporan (.xlsx)",
  variant = "primary",
  icon,
}: {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  label?: string;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
}) {
  const styles =
    variant === "primary"
      ? "bg-navy text-white hover:bg-navy-800"
      : "bg-white text-navy ring-1 ring-navy/20 hover:bg-navy-50";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className={
        "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold shadow-card-sm transition disabled:opacity-60 " +
        styles
      }
    >
      {loading ? null : (icon ?? <DownloadIcon className="h-4 w-4" />)}
      {loading ? "Menyiapkan…" : label}
    </button>
  );
}
