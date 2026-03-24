import { Input, Select } from "../../shared/components";

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

export function DiscoveryFilters({ value, onChange }: DiscoveryFiltersProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur sm:grid-cols-2 lg:grid-cols-5">
      <Input
        label="Search court/session"
        placeholder="e.g. Linh Trung, Football"
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
      />

      <Select
        label="Sport"
        value={value.sport}
        onChange={(event) => onChange({ ...value, sport: event.target.value })}
        options={[
          { label: "All sports", value: "All" },
          { label: "Badminton", value: "Badminton" },
          { label: "Football", value: "Football" },
          { label: "Tennis", value: "Tennis" },
        ]}
      />

      <Select
        label="Skill level"
        value={value.skill}
        onChange={(event) => onChange({ ...value, skill: event.target.value })}
        options={[
          { label: "All levels", value: "All" },
          { label: "Beginner", value: "Beginner" },
          { label: "Intermediate", value: "Intermediate" },
          { label: "Advanced", value: "Advanced" },
        ]}
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
          Chỉ show theo level của tôi
        </span>
      </label>
    </div>
  );
}
