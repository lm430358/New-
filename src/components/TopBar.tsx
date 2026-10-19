import Link from "next/link";
import { Settings } from "lucide-react";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-[var(--text)]">{title}</h1>
        {subtitle ? <p className="text-sm text-[var(--text-muted)] mt-0.5">{subtitle}</p> : null}
      </div>
      <Link
        href="/business-profile"
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
      >
        <Settings size={14} />
        Business Profile
      </Link>
    </div>
  );
}
