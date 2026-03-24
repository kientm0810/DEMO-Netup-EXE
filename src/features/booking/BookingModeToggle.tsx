import type { BookingMode } from "../../entities";
import { cn } from "../../shared/utils";

interface BookingModeToggleProps {
  mode: BookingMode;
  onChange: (nextMode: BookingMode) => void;
}

export function BookingModeToggle({ mode, onChange }: BookingModeToggleProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-sm font-medium text-slate-700">Trạng thái đặt sân</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={cn(
            "rounded-xl px-3 py-2 text-sm font-semibold transition",
            mode === "solo" ? "bg-ink text-white" : "bg-slate-100 text-slate-700",
          )}
          onClick={() => onChange("solo")}
        >
          Đi một mình (Nhóm A)
        </button>
        <button
          type="button"
          className={cn(
            "rounded-xl px-3 py-2 text-sm font-semibold transition",
            mode === "full_court" ? "bg-red-200 text-ink" : "bg-slate-100 text-slate-700",
          )}
          onClick={() => onChange("full_court")}
        >
          Đặt trọn sân (Nhóm B)
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Khi bật Đặt trọn sân, phí sàn sẽ về 0 và áp dụng giá thuê sân nguyên suất.
      </p>
    </div>
  );
}
