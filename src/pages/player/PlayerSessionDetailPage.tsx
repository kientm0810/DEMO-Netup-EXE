import { Link, useParams } from "react-router-dom";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Badge, Button, Card, EmptyState } from "../../shared/components";
import { formatSessionTime, formatVnd } from "../../shared/utils";

export function PlayerSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { state } = useAppStore();

  const session = state.sessions.find((item) => item.id === sessionId);
  if (!session) {
    return (
      <EmptyState
        title="Session không tồn tại"
        description="Session có thể đã kết thúc hoặc không còn trong mock data."
      >
        <Link to="/player/discovery">
          <Button>Quay về discovery</Button>
        </Link>
      </EmptyState>
    );
  }

  const court = state.courts.find((item) => item.id === session.courtId);
  const relatedBookings = state.bookings.filter((booking) => booking.sessionId === session.id);

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr] fade-up">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-ink">{session.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{court?.address ?? "Unknown location"}</p>
          </div>
          <Badge tone={session.openSlots > 0 ? "success" : "warning"}>
            {session.openSlots > 0 ? `Còn ${session.openSlots} slot` : "Đã đầy"}
          </Badge>
        </div>

        <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
          <p>
            <strong>Sport:</strong> {court?.sport}
          </p>
          <p>
            <strong>Thời gian:</strong> {formatSessionTime(session.startsAt)}
          </p>
          <p>
            <strong>Skill range:</strong> {session.requiredSkillMin} - {session.requiredSkillMax}
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
            <strong>Court rating:</strong> {court?.rating ?? "-"} / 5.0
          </p>
        </div>
      </Card>
    </section>
  );
}
