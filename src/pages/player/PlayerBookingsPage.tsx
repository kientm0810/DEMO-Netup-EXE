import { Link } from "react-router-dom";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Badge, Button, Card, EmptyState } from "../../shared/components";
import { formatSessionTime, formatVnd } from "../../shared/utils";

export function PlayerBookingsPage() {
  const { state, currentPlayerId } = useAppStore();

  const myBookings = state.bookings.filter((booking) => booking.playerId === currentPlayerId);

  if (myBookings.length === 0) {
    return (
      <EmptyState
        title="Bạn chưa có booking nào"
        description="Thử vào trang khám phá để đặt kèo hoặc bao sân cho nhóm."
      >
        <Link to="/player/discovery">
          <Button>Đi khám phá ngay</Button>
        </Link>
      </EmptyState>
    );
  }

  return (
    <section className="grid gap-4 fade-up">
      {myBookings.map((booking) => {
        const session = state.sessions.find((item) => item.id === booking.sessionId);
        const court = state.courts.find((item) => item.id === booking.courtId);

        return (
          <Card key={booking.id} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-heading text-lg font-semibold text-ink">
                  {session?.title ?? "Session không xác định"}
                </h3>
                <p className="text-sm text-slate-600">
                  {court?.name ?? "Sân không xác định"} •{" "}
                  {session ? formatSessionTime(session.startsAt) : "N/A"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="info">{booking.bookingCode}</Badge>
                <Badge tone={booking.status === "checked_in" ? "success" : "neutral"}>
                  {booking.status}
                </Badge>
              </div>
            </div>

            <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p>
                <strong>Loại đặt:</strong> {booking.mode === "solo" ? "Ghép lẻ" : "Bao sân"}
              </p>
              <p>
                <strong>Số slot:</strong> {booking.seatsBooked}
              </p>
              <p>
                <strong>Tổng tiền:</strong> {formatVnd(booking.totalPriceVnd)}
              </p>
              <p>
                <strong>Thời điểm tạo:</strong> {new Date(booking.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>

            <Link to={`/player/booking-success/${booking.id}`}>
              <Button variant="outline">Mở lại mã QR</Button>
            </Link>
          </Card>
        );
      })}
    </section>
  );
}
