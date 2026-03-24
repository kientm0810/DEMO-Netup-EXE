import type { PropsWithChildren } from "react";
import { cn } from "../utils/cn";

interface BadgeProps {
  tone?: "neutral" | "success" | "warning" | "info";
  className?: string;
}

export function Badge({ tone = "neutral", className, children }: PropsWithChildren<BadgeProps>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-slate-100 text-slate-700",
        tone === "success" && "bg-red-100 text-red-700",
        tone === "warning" && "bg-rose-100 text-rose-700",
        tone === "info" && "bg-slate-200 text-slate-700",
        className,
      )}
    >
      {children}
    </span>
  );
}
