import type { BookingMode } from "../../entities";
import { Card } from "../../shared/components";
import { formatVnd, type PriceBreakdown } from "../../shared/utils";

interface PriceBreakdownProps {
  mode: BookingMode;
  seatsBooked: number;
  breakdown: PriceBreakdown;
}

export function PriceBreakdown({ mode, seatsBooked, breakdown }: PriceBreakdownProps) {
  return (
    <Card className="space-y-3">
      <h3 className="font-heading text-lg font-semibold text-ink">Tạm tính</h3>
      <div className="space-y-2 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>{mode === "solo" ? `Giá suất chơi x ${seatsBooked}` : "Giá thuê trọn sân"}</span>
          <span>{formatVnd(breakdown.basePriceVnd)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Phí sàn</span>
          <span>{formatVnd(breakdown.floorFeeVnd)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Phí nền tảng</span>
          <span>{formatVnd(breakdown.platformFeeVnd)}</span>
        </div>
      </div>
      <div className="h-px bg-slate-200" />
      <div className="flex items-center justify-between font-heading text-lg font-semibold text-ink">
        <span>Tổng thanh toán</span>
        <span>{formatVnd(breakdown.totalPriceVnd)}</span>
      </div>
    </Card>
  );
}
