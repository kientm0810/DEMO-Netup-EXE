import { Link, useParams } from "react-router-dom";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Badge, Button, Card, EmptyState, MockQr } from "../../shared/components";
import { formatSessionTime, formatVnd } from "../../shared/utils";

export function PlayerBookingSuccessPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { state } = useAppStore();

  const booking = state.bookings.find((item) => item.id === bookingId);
  if (!booking) {
    return (
      <EmptyState
        title="Không tìm thấy booking"
        description="Trang thành công chỉ hiển thị với booking hợp lệ vừa tạo."
      >
        <Link to="/player/bookings">
          <Button>Xem danh sách booking</Button>
        </Link>
      </EmptyState>
    );
  }

  const session = state.sessions.find((item) => item.id === booking.sessionId);
  const court = state.courts.find((item) => item.id === booking.courtId);

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr,1fr] fade-up">
      <Card className="space-y-4">
        <div className="space-y-2">
          <Badge tone="success">XÁC NHẬN ĐẶT SÂN THÀNH CÔNG!</Badge>
          <h2 className="font-heading text-2xl font-semibold text-ink">VÉ VÀO SÂN & THANH TOÁN</h2>
          <p className="text-sm text-slate-600">
            Vui lòng đưa mã QR này cho nhân viên để check-in và hoàn tất thanh toán.
          </p>
        </div>
        <MockQr payload={booking.qrPayload} className="max-w-[320px]" />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p>
            <strong>Mã booking:</strong> {booking.bookingCode}
          </p>
          <p>
            <strong>Số tiền:</strong> {formatVnd(booking.totalPriceVnd)}
          </p>
          <p>
            <strong>Mode:</strong> {booking.mode === "solo" ? "Tham gia pool theo slot" : "Thuê nguyên sân"}
          </p>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="font-heading text-xl font-semibold text-ink">Tóm tắt giao dịch</h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <strong>Session:</strong> {session?.title ?? booking.sessionId}
          </p>
          <p>
            <strong>Sân:</strong> {court?.subCourtName ?? booking.courtId}
          </p>
          <p>
            <strong>Khu sân:</strong> {court?.complexName ?? "-"}
          </p>
          <p>
            <strong>Thời gian:</strong> {session ? formatSessionTime(session.startsAt) : "-"}
          </p>
          <p>
            <strong>Số slot:</strong> {booking.seatsBooked}
          </p>
          <p>
            <strong>Giá gốc:</strong> {formatVnd(booking.basePriceVnd)}
          </p>
          <p>
            <strong>Phí sàn:</strong> {formatVnd(booking.floorFeeVnd)}
          </p>
          <p>
            <strong>Phí nền tảng:</strong> {formatVnd(booking.platformFeeVnd)}
          </p>
        </div>

        {booking.mode === "full_court" ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            QR chia tiền đã sẵn sàng: trưởng nhóm có thể chụp màn hình và gửi vào Zalo/Messenger.
          </div>
        ) : (
          <div className="rounded-xl border border-slate-300 bg-slate-100 p-3 text-sm text-slate-800">
            QR này đồng thời là vé check-in và xác nhận thanh toán cá nhân.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Link to="/player/bookings">
            <Button>Xem booking của tôi</Button>
          </Link>
          <Link to="/player/discovery">
            <Button variant="outline">Đặt thêm session</Button>
          </Link>
        </div>
      </Card>
    </section>
  );
}
