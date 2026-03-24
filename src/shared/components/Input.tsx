import type { InputHTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...rest }: InputProps) {
  const inputId = id ?? rest.name ?? rest.placeholder;

  return (
    <label className="block space-y-1.5 text-sm">
      {label ? <span className="text-slate-700">{label}</span> : null}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-aqua focus:outline-none focus:ring-2 focus:ring-aqua/20",
          className,
        )}
        {...rest}
      />
    </label>
  );
}
