import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Badge, Button, Card, EmptyState, Input, Select, WeeklySessionCalendar } from "../../shared/components";
import { formatSessionTime, formatVnd, getSkillLabel, getSportLabel } from "../../shared/utils";

function formatSlotRange(startsAt: string, durationMinutes: number): string {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const dateText = start.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const startText = start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const endText = end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return `${dateText} • ${startText} - ${endText}`;
}

function formatDateTimeLocalInput(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function getPoolSlotView(sessionMaxSlots: number, totalSlots?: number, hostSlots?: number) {
  const safeTotalSlots = Math.max(2, Math.min(totalSlots ?? sessionMaxSlots, sessionMaxSlots));
  const safeHostSlots = Math.max(1, Math.min(hostSlots ?? 1, safeTotalSlots));
  return {
    totalSlots: safeTotalSlots,
    hostSlots: safeHostSlots,
    openSlots: Math.max(safeTotalSlots - safeHostSlots, 0),
  };
}

export function PlayerSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, createRentalSlot } = useAppStore();
  const sourceType =
    (location.state as { sourceType?: unknown } | null)?.sourceType === "rental" ? "rental" : "pool";
  const poolSessionSet = new Set(state.promotedSessionIds);

  const session = state.sessions.find((item) => item.id === sessionId);
  if (!session) {
    return (
      <EmptyState
        title="Session không tồn tại"
        description="Session có thể đã kết thúc hoặc không còn trong mock data."
      >
        <Link to="/player/discovery">
          <Button>Quay về trang khám phá</Button>
        </Link>
      </EmptyState>
    );
  }

  const court = state.courts.find((item) => item.id === session.courtId);
  const relatedBookings = state.bookings.filter((booking) => booking.sessionId === session.id);
  const slotRange = formatSlotRange(session.startsAt, session.durationMinutes);
  const activePoolConfig = state.poolPostConfigs[session.id];
  const activePoolSlots = getPoolSlotView(
    session.maxSlots,
    activePoolConfig?.totalSlots,
    activePoolConfig?.hostSlots,
  );
  const activeSlotOpen = poolSessionSet.has(session.id) ? activePoolSlots.openSlots : session.openSlots;
  const activeSlotTotal = poolSessionSet.has(session.id) ? activePoolSlots.totalSlots : session.maxSlots;

  const sameCourtSessions = state.sessions
    .filter((item) => item.courtId === session.courtId)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const sameCourtCalendarItems = sameCourtSessions
    .map((courtSession) => {
      const sameCourt = state.courts.find((item) => item.id === courtSession.courtId);
      if (!sameCourt) {
        return null;
      }
      const isPool = poolSessionSet.has(courtSession.id);
      const config = state.poolPostConfigs[courtSession.id];
      const poolSlots = getPoolSlotView(courtSession.maxSlots, config?.totalSlots, config?.hostSlots);
      return {
        session: isPool
          ? {
              ...courtSession,
              title: sameCourt.subCourtName,
              maxSlots: poolSlots.totalSlots,
              openSlots: poolSlots.openSlots,
            }
          : {
              ...courtSession,
              title: sameCourt.subCourtName,
            },
        court: sameCourt,
        isPromoted: isPool,
        tags: isPool ? ["Pool chờ ghép", "Có thể thuê sân"] : ["Thuê nguyên sân"],
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const sourceBadge =
    sourceType === "rental" ? "Bạn vào từ luồng Thuê nguyên sân" : "Bạn vào từ luồng Kèo chờ ghép";
  const bookingCta = sourceType === "rental" ? "Đặt nhanh slot đang xem" : "Tham gia pool ngay";
  const bookingMode = sourceType === "rental" ? "full_court" : "solo";

  const durationOptions = useMemo(() => {
    if (!court) {
      return [{ value: "60", label: "60 phút" }];
    }
    const options: Array<{ value: string; label: string }> = [];
    for (let value = 30; value <= court.maxRentalDurationMinutes; value += 30) {
      options.push({ value: value.toString(), label: `${value} phút` });
    }
    return options;
  }, [court]);

  const [rentalStartsAt, setRentalStartsAt] = useState(formatDateTimeLocalInput(session.startsAt));
  const [rentalDurationMinutes, setRentalDurationMinutes] = useState<number>(
    Math.min(court?.maxRentalDurationMinutes ?? 60, Math.max(30, session.durationMinutes)),
  );
  const [rentalError, setRentalError] = useState("");
  const [rentalSubmitting, setRentalSubmitting] = useState(false);

  const handleCreateRentalSlot = () => {
    if (!court) {
      setRentalError("Không tìm thấy thông tin sân.");
      return;
    }

    if (!rentalStartsAt) {
      setRentalError("Bạn cần chọn thời điểm bắt đầu.");
      return;
    }

    const startsAtDate = new Date(rentalStartsAt);
    if (Number.isNaN(startsAtDate.getTime())) {
      setRentalError("Thời điểm bắt đầu không hợp lệ.");
      return;
    }

    setRentalSubmitting(true);
    setRentalError("");
    const createdSession = createRentalSlot({
      courtId: court.id,
      startsAt: startsAtDate.toISOString(),
      durationMinutes: rentalDurationMinutes,
    });

    if (!createdSession) {
      setRentalSubmitting(false);
      setRentalError(
        "Không thể tạo slot thuê. Có thể khung giờ bị trùng lịch hiện tại, hãy chọn thời điểm khác.",
      );
      return;
    }

    navigate(`/player/booking/${createdSession.id}`, {
      state: { preferredMode: "full_court", sourceType: "rental", rentalCreated: true },
    });
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr] fade-up">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-ink">{court?.subCourtName ?? session.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{court?.complexName ?? "Chưa có khu sân"}</p>
            <p className="text-sm text-slate-600">{court?.address ?? "Chưa có địa chỉ"}</p>
          </div>
          <Badge tone={activeSlotOpen > 0 ? "success" : "warning"}>
            Còn {activeSlotOpen}/{activeSlotTotal} slot
          </Badge>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-semibold">{sourceBadge}</p>
          <p className="mt-1">
            <strong>Khung giờ đang xem:</strong> {slotRange}
          </p>
          <p className="mt-1">
            <strong>Sân:</strong> {court?.subCourtName ?? "-"} ({court?.district ?? "-"})
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-heading text-lg font-semibold text-ink">Lịch hiện tại của sân (7 ngày)</h3>
          <p className="text-sm text-slate-600">
            Tất cả slot trong lịch đều thuộc cùng sân nhỏ để người chơi nhìn là hiểu ngay.
          </p>
          <WeeklySessionCalendar
            items={sameCourtCalendarItems}
            selectedSessionId={session.id}
            anchorDate={session.startsAt}
            emptyMessage="Sân này chưa có slot nào trong tuần."
          />
        </div>

        {sourceType === "rental" && court ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-heading text-lg font-semibold text-ink">Tạo slot thuê mới trên lịch</h3>
            <p className="text-sm text-slate-600">
              Chủ sân đang giới hạn tối đa <strong>{court.maxRentalDurationMinutes} phút</strong> cho mỗi lần thuê.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Thời điểm bắt đầu"
                type="datetime-local"
                value={rentalStartsAt}
                onChange={(event) => {
                  setRentalStartsAt(event.target.value);
                  setRentalError("");
                }}
              />
              <Select
                label="Thời lượng thuê"
                value={rentalDurationMinutes.toString()}
                options={durationOptions}
                onChange={(event) => {
                  setRentalDurationMinutes(Number(event.target.value));
                  setRentalError("");
                }}
              />
            </div>
            {rentalError ? <p className="text-sm text-red-700">{rentalError}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCreateRentalSlot} disabled={rentalSubmitting}>
                {rentalSubmitting ? "Đang tạo slot..." : "Tạo slot trên lịch và thuê sân"}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
          <p>
            <strong>Môn:</strong> {court ? getSportLabel(court.sport) : "-"}
          </p>
          <p>
            <strong>Thời gian:</strong> {formatSessionTime(session.startsAt)}
          </p>
          <p>
            <strong>Mức skill:</strong> {getSkillLabel(session.requiredSkillMin)} -{" "}
            {getSkillLabel(session.requiredSkillMax)}
          </p>
          <p>
            <strong>Thời lượng:</strong> {session.durationMinutes} phút
          </p>
          <p>
            <strong>Giá theo slot:</strong> {formatVnd(session.slotPriceVnd)}
          </p>
          <p>
            <strong>Giá thuê sân:</strong> {formatVnd(session.fullCourtPriceVnd)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(court?.amenities ?? []).map((amenity) => (
            <Badge key={amenity} tone="neutral">
              {amenity}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/player/booking/${session.id}`} state={{ preferredMode: bookingMode, sourceType }}>
            <Button disabled={activeSlotOpen <= 0}>{bookingCta}</Button>
          </Link>
          <Link to={sourceType === "rental" ? "/player/rent-courts" : "/player/pool-posts"}>
            <Button variant="outline">Quay lại danh sách</Button>
          </Link>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-heading text-lg font-semibold text-ink">Tình trạng booking hiện tại</h3>
        <p className="text-sm text-slate-600">
          Session này đã có <strong>{relatedBookings.length}</strong> booking trong hệ thống demo.
        </p>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <strong>Trạng thái pool:</strong>{" "}
            {poolSessionSet.has(session.id)
              ? `Đang mở pool (${activePoolSlots.hostSlots}/${activePoolSlots.totalSlots} slot do chủ post giữ)`
              : "Chưa mở pool, hiện ở dạng thuê sân"}
          </p>
          <p>
            <strong>Khung giờ:</strong> {session.isPeakHour ? "Cao điểm" : "Thấp điểm"}
          </p>
          <p>
            <strong>Điểm đánh giá sân:</strong> {court?.rating ?? "-"} / 5.0
          </p>
        </div>
      </Card>
    </section>
  );
}
