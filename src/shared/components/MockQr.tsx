import { buildMockQrMatrix } from "../utils/qr";
import { cn } from "../utils/cn";

interface MockQrProps {
  payload: string;
  className?: string;
}

export function MockQr({ payload, className }: MockQrProps) {
  const size = 25;
  const matrix = buildMockQrMatrix(payload, size);

  return (
    <div className={cn("rounded-2xl border border-slate-300 bg-white p-3", className)}>
      <div
        className="grid gap-px rounded-lg bg-slate-200 p-1"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {matrix.map((cell, index) => (
          <span
            key={`${payload}-${index}`}
            className={cn("aspect-square rounded-[1px]", cell ? "bg-slate-900" : "bg-white")}
          />
        ))}
      </div>
    </div>
  );
}
