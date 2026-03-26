import { useMemo, useState } from "react";
import type { Booking } from "../../entities";
import { Badge, Button, Card, Input } from "../../shared/components";
import { formatVnd } from "../../shared/utils";

type CheckInStatus = "idle" | "checked_in" | "already_checked_in" | "not_found";

interface CheckInPanelProps {
  sampleCodes: string[];
  onCheckIn: (bookingCode: string) => Promise<{ status: CheckInStatus; booking?: Booking }>;
}

export function CheckInPanel({ sampleCodes, onCheckIn }: CheckInPanelProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<CheckInStatus>("idle");
  const [booking, setBooking] = useState<Booking | undefined>(undefined);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const statusUi = useMemo(() => {
    if (status === "checked_in") {
      return {
        tone: "success" as const,
        text: "Check-in thành công",
      };
    }
    if (status === "already_checked_in") {
      return {
        tone: "warning" as const,
        text: "Booking đã check-in trước đó",
      };
    }
    if (status === "not_found") {
      return {
        tone: "warning" as const,
        text: "Không tìm thấy mã booking",
      };
    }
    return {
      tone: "neutral" as const,
      text: "Sẵn sàng quét mã",
    };
  }, [status]);

  const runCheckIn = async (targetCode: string) => {
    if (!targetCode.trim()) {
      return;
    }
    setIsCheckingIn(true);
    const result = await onCheckIn(targetCode);
    setStatus(result.status);
    setBooking(result.booking);
    setIsCheckingIn(false);
  };

  return (
    <Card className="space-y-4">
      <h3 className="font-heading text-lg font-semibold text-ink">Check-in bằng QR / mã booking</h3>
      <Input
        label="Mã booking"
        placeholder="Nhập mã ví dụ NTP2401"
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void runCheckIn(code)} disabled={!code.trim() || isCheckingIn}>
          Xác nhận check-in
        </Button>
        {sampleCodes.map((sampleCode) => (
          <Button
            key={sampleCode}
            variant="outline"
            onClick={() => void runCheckIn(sampleCode)}
            disabled={isCheckingIn}
          >
            {sampleCode}
          </Button>
        ))}
      </div>

      <Badge tone={statusUi.tone}>{statusUi.text}</Badge>

      {booking ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p>
            <strong>Mã:</strong> {booking.bookingCode}
          </p>
          <p>
            <strong>Loại:</strong> {booking.mode === "solo" ? "Ghép lẻ" : "Bao sân"}
          </p>
          <p>
            <strong>Tổng tiền:</strong> {formatVnd(booking.totalPriceVnd)}
          </p>
        </div>
      ) : null}
    </Card>
  );
}
