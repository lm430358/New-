import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
