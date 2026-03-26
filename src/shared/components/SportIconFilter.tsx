import { cn, getSportLabel, type SportFilterValue } from "../utils";

interface SportIconFilterProps {
  label: string;
  value: SportFilterValue;
  onChange: (next: SportFilterValue) => void;
  options?: SportFilterValue[];
  className?: string;
}

const sportIconMeta: Record<
  SportFilterValue,
  {
    emoji: string;
    colorClass: string;
  }
> = {
  All: { emoji: "📍", colorClass: "text-slate-500" },
  Badminton: { emoji: "🏸", colorClass: "text-emerald-500" },
  Football: { emoji: "⚽", colorClass: "text-green-600" },
  Tennis: { emoji: "🎾", colorClass: "text-amber-600" },
};

const defaultOptions: SportFilterValue[] = ["All", "Badminton", "Football", "Tennis"];

function SportPinIcon({ emoji, colorClass }: { emoji: string; colorClass: string }) {
  return (
    <span className="relative inline-flex h-9 w-9 items-center justify-center">
      <svg viewBox="0 0 24 24" fill="currentColor" className={cn("h-9 w-9 drop-shadow-sm", colorClass)}>
        <path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z" />
      </svg>
      <span className="absolute -translate-y-[1px] text-sm">{emoji}</span>
    </span>
  );
}

export function SportIconFilter({ label, value, onChange, options = defaultOptions, className }: SportIconFilterProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          const icon = sportIconMeta[option];
          const optionLabel = option === "All" ? "Tất cả" : getSportLabel(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={cn(
                "inline-flex h-14 min-w-[116px] items-center gap-2 rounded-xl border px-3 py-2 text-left transition",
                selected
                  ? "border-red-300 bg-red-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <SportPinIcon emoji={icon.emoji} colorClass={icon.colorClass} />
              <span className="text-sm font-semibold leading-tight text-slate-700 whitespace-nowrap">
                {optionLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
