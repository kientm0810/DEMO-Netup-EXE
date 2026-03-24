import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../utils/cn";

type Variant = "primary" | "ghost" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua/60 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-ink text-white shadow-float hover:-translate-y-0.5 hover:bg-[#2b313d]",
        variant === "outline" &&
          "border border-slate-300 bg-white text-ink hover:border-slate-400 hover:bg-slate-50",
        variant === "ghost" && "text-ink hover:bg-slate-100",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
