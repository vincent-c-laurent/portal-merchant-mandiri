import { BankLogo } from "./Brand";
import { BRANCH } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-6 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <div className="flex items-center gap-3">
          <BankLogo height={24} />
          <div className="text-xs text-slate-500">
            <p className="font-semibold text-slate-600">{BRANCH.area}</p>
            <p>{BRANCH.label}</p>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          <p>© 2026 Bank Mandiri · Alat bantu internal</p>
          <p>Estimasi untuk negosiasi; angka final mengikuti ketentuan resmi.</p>
        </div>
      </div>
    </footer>
  );
}
