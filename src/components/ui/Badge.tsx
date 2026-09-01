import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1",
        className
      )}
      {...props}
    />
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "bg-emerald-100 text-emerald-700"
      : score >= 70
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";
  return (
    <span className={cn("inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-1", color)}>
      Content Score: {score}/100
    </span>
  );
}
