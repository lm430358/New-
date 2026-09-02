import type { LabelHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
  ...props
}: { label: string; hint?: string; children: ReactNode } & LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm" {...props}>
      <span className="font-medium text-white/80">{label}</span>
      {children}
      {hint && <span className="text-xs text-white/40">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-500";
