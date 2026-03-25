import { Link, useLocation, useParams } from "react-router-dom";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Badge, Button, Card, EmptyState, WeeklySessionCalendar } from "../../shared/components";
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

export function PlayerSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const { state } = useAppStore();

  const navigationState = location.state as { filteredSessionIds?: unknown } | null;
  const filteredSessionIdsFromState = Array.isArray(navigationState?.filteredSessionIds)
    ? navigationState.filteredSessionIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];

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
  const isPromotedPost = state.promotedSessionIds.includes(session.id);
  const slotRange = formatSlotRange(session.startsAt, session.durationMinutes);
  const isUsingFilteredContext = filteredSessionIdsFromState.length > 0;

  const calendarSessionIds = Array.from(
    new Set([
      ...(isUsingFilteredContext ? filteredSessionIdsFromState : state.promotedSessionIds),
      session.id,
    ]),
  );

  const calendarItems = calendarSessionIds
    .map((id) => state.sessions.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((calendarSession) => {
      const calendarCourt = state.courts.find((item) => item.id === calendarSession.courtId);
      if (!calendarCourt) {
        return null;
      }
      return {
        session: calendarSession,
        court: calendarCourt,
        isPromoted: state.promotedSessionIds.includes(calendarSession.id),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr] fade-up">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-ink">{session.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{court?.address ?? "Chưa có địa chỉ"}</p>
          </div>
          <Badge tone={session.openSlots > 0 ? "success" : "warning"}>
            {session.openSlots > 0 ? `Còn ${session.openSlots} slot` : "Đã đầy"}
          </Badge>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-semibold">
            {isPromotedPost ? "Bài post đang hiển thị cho người chơi" : "Slot này chưa được promote thành bài post"}
          </p>
          <p className="mt-1">
            <strong>Khung giờ của sân:</strong> {slotRange}
          </p>
          <p className="mt-1">
            <strong>Sân:</strong> {court?.name ?? "-"} ({court?.district ?? "-"})
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-heading text-lg font-semibold text-ink">
            Lịch 7 ngày {isUsingFilteredContext ? "của các post bạn đã lọc" : "của các post đang mở"}
          </h3>
          <p className="text-sm text-slate-600">
            Khung bạn đang xem được tô màu đỏ để nổi bật. Mỗi slot hiển thị luôn trạng thái còn chỗ.
          </p>
          <WeeklySessionCalendar
            items={calendarItems}
            selectedSessionId={session.id}
            anchorDate={session.startsAt}
            emptyMessage="Chưa có post nào trong tuần này theo bộ lọc hiện tại."
          />
        </div>

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
            <strong>Giá ghép lẻ:</strong> {formatVnd(session.slotPriceVnd)}
          </p>
          <p>
            <strong>Giá bao sân:</strong> {formatVnd(session.fullCourtPriceVnd)}
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
          <Link to={`/player/booking/${session.id}`}>
            <Button disabled={session.openSlots <= 0}>Tiếp tục đặt sân</Button>
          </Link>
          <Link to="/player/discovery">
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
            <strong>Khả năng ghép lẻ:</strong>{" "}
            {session.allowsSoloJoin ? "Có thể ghép kèo theo slot" : "Chỉ cho nhóm riêng"}
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
