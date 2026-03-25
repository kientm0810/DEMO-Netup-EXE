import { Input, Select } from "../../shared/components";
import { cn, getSkillLabel, getSportLabel, skillOptions } from "../../shared/utils";

export interface DiscoveryFilterState {
  search: string;
  sport: string;
  skill: string;
  pickupOnly: boolean;
  recommendedOnly: boolean;
}

interface DiscoveryFiltersProps {
  value: DiscoveryFilterState;
  onChange: (next: DiscoveryFilterState) => void;
}

const sportFilterItems = [
  { value: "All", emoji: "📍", colorClass: "text-slate-500" },
  { value: "Badminton", emoji: "🏸", colorClass: "text-emerald-500" },
  { value: "Football", emoji: "⚽", colorClass: "text-green-600" },
  { value: "Tennis", emoji: "🎾", colorClass: "text-amber-600" },
] as const;

function SportPinIcon({ emoji, colorClass }: { emoji: string; colorClass: string }) {
  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center">
      <svg viewBox="0 0 24 24" fill="currentColor" className={cn("h-10 w-10 drop-shadow-sm", colorClass)}>
        <path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z" />
      </svg>
      <span className="absolute -translate-y-[1px] text-sm">{emoji}</span>
    </span>
  );
}

export function DiscoveryFilters({ value, onChange }: DiscoveryFiltersProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
      <Input
        label="Tìm sân / bài post"
        placeholder="Ví dụ: Linh Trung, Cầu lông"
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
      />

      <Select
        label="Mức kỹ năng"
        value={value.skill}
        onChange={(event) => onChange({ ...value, skill: event.target.value })}
        options={skillOptions.map((skill) => ({
          label: getSkillLabel(skill),
          value: skill,
        }))}
      />

      <label className="flex items-end pb-2">
        <span className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-ink"
            checked={value.pickupOnly}
            onChange={(event) => onChange({ ...value, pickupOnly: event.target.checked })}
          />
          Tìm kèo giao lưu
        </span>
      </label>

      <label className="flex items-end pb-2">
        <span className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-ink"
            checked={value.recommendedOnly}
            onChange={(event) => onChange({ ...value, recommendedOnly: event.target.checked })}
          />
          Chỉ hiển thị theo level của tôi
        </span>
      </label>

      <div className="space-y-2 sm:col-span-2 lg:col-span-4">
        <p className="text-sm font-medium text-slate-700">Bộ môn</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {sportFilterItems.map((item) => {
            const selected = value.sport === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onChange({ ...value, sport: item.value })}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition",
                  selected
                    ? "border-red-300 bg-red-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <SportPinIcon emoji={item.emoji} colorClass={item.colorClass} />
                <span className="text-sm font-semibold text-slate-700">{getSportLabel(item.value)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
