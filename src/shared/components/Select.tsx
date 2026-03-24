import type { SelectHTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface Option {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
}

export function Select({ label, options, className, ...rest }: SelectProps) {
  return (
    <label className="block space-y-1.5 text-sm">
      {label ? <span className="text-slate-700">{label}</span> : null}
      <select
        className={cn(
          "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink focus:border-aqua focus:outline-none focus:ring-2 focus:ring-aqua/20",
          className,
        )}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
