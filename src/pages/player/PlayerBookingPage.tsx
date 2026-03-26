import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { BookingModeToggle, PriceBreakdown } from "../../features/booking";
import { Badge, Button, Card, EmptyState, Input } from "../../shared/components";
import { calculatePriceBreakdown, formatSessionTime } from "../../shared/utils";

export function PlayerBookingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, currentPlayerId, createBooking } = useAppStore();
  const hasPreferredMode = (location.state as { preferredMode?: unknown } | null)?.preferredMode !== undefined;
  const preferredMode =
    (location.state as { preferredMode?: unknown } | null)?.preferredMode === "full_court"
      ? "full_court"
      : "solo";
  const sourceType =
    (location.state as { sourceType?: unknown } | null)?.sourceType === "rental" ? "rental" : "pool";

  const session = state.sessions.find((item) => item.id === sessionId);
  const court = session ? state.courts.find((item) => item.id === session.courtId) : undefined;

  const [mode, setMode] = useState<"solo" | "full_court">(preferredMode);
  const [seatsBooked, setSeatsBooked] = useState(1);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!session || !court) {
    return (
      <EmptyState
        title="Không thể tạo booking"
        description="Session không hợp lệ hoặc đã bị xóa khỏi dữ liệu hiện tại."
      >
        <Link to="/player/discovery">
          <Button>Quay lại khám phá</Button>
        </Link>
      </EmptyState>
    );
  }

  const effectiveSeats = mode === "solo" ? Math.max(1, Math.min(2, seatsBooked)) : session.maxSlots;
  const breakdown = useMemo(
    () =>
      calculatePriceBreakdown({
        session,
        adminConfig: state.adminConfig,
        mode,
        seatsBooked: effectiveSeats,
      }),
    [effectiveSeats, mode, session, state.adminConfig],
  );

  const submitLabel = mode === "solo" ? "Xác nhận ghép kèo" : "Xác nhận bao sân";

  const onSubmitBooking = async () => {
    setSubmitting(true);
    const newBooking = await createBooking({
      sessionId: session.id,
      playerId: currentPlayerId,
      mode,
      seatsBooked: effectiveSeats,
    });

    if (!newBooking) {
      setSubmitError("Không thể tạo booking, vui lòng thử lại.");
      setSubmitting(false);
      return;
    }

    navigate(`/player/booking-success/${newBooking.id}`);
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr] fade-up">
      <Card className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-ink">Xác nhận đặt sân</h2>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <p>
            <strong>Session:</strong> {session.title}
          </p>
          <p>
            <strong>Sân:</strong> {court.subCourtName}
          </p>
          <p>
            <strong>Khu sân:</strong> {court.complexName}
          </p>
          <p>
            <strong>Thời gian:</strong> {formatSessionTime(session.startsAt)}
          </p>
        </div>

        {hasPreferredMode ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-slate-700">
            Bạn đang vào từ luồng <strong>{sourceType === "rental" ? "Thuê nguyên sân" : "Kèo chờ ghép"}</strong>.
            Chế độ đặt đã được chọn sẵn để demo rõ hơn.
          </div>
        ) : null}

        {!hasPreferredMode ? <BookingModeToggle mode={mode} onChange={setMode} /> : null}

        {mode === "solo" ? (
          <Input
            label="Số slot cá nhân (1-2)"
            type="number"
            min={1}
            max={2}
            value={seatsBooked}
            onChange={(event) => setSeatsBooked(Number(event.target.value) || 1)}
          />
        ) : (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-slate-700">
            Bạn đang bao trọn sân cho nhóm riêng. Phí sàn = 0 theo rule NetUp.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge tone="info">Phí nền tảng: {Math.round(state.adminConfig.platformFeeRate * 100)}%</Badge>
          <Badge tone="neutral">Phí sàn: {state.adminConfig.floorFeeVnd.toLocaleString("vi-VN")}đ</Badge>
        </div>

        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void onSubmitBooking()} disabled={submitting}>
            {submitting ? "Đang tạo..." : submitLabel}
          </Button>
          <Link to={`/player/session/${session.id}`}>
            <Button variant="outline">Quay lại session</Button>
          </Link>
        </div>
      </Card>

      <PriceBreakdown mode={mode} seatsBooked={effectiveSeats} breakdown={breakdown} />
    </section>
  );
}
