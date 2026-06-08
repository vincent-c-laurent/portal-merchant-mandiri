import { DownloadIcon } from "./icons";

export function DownloadButton({
  onClick,
  loading,
  label = "Unduh Laporan (.xlsx)",
}: {
  onClick: () => void;
  loading: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-3.5 text-sm font-bold text-white shadow-card-sm transition hover:bg-navy-800 disabled:opacity-60"
    >
      <DownloadIcon className="h-4 w-4" />
      {loading ? "Menyiapkan laporan…" : label}
    </button>
  );
}
