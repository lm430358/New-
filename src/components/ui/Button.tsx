import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" && "bg-violet-600 text-white hover:bg-violet-500",
        variant === "secondary" && "bg-white/10 text-white hover:bg-white/15",
        variant === "ghost" && "text-white/70 hover:text-white hover:bg-white/5",
        className
      )}
      {...props}
    />
  );
}
