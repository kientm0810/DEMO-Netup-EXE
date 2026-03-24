import { useMemo } from "react";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Card, StatCard } from "../../shared/components";

export function AdminDashboardPage() {
  const { state } = useAppStore();

  const metrics = useMemo(() => {
    const soloBookings = state.bookings.filter((booking) => booking.mode === "solo").length;
    const fullCourtBookings = state.bookings.length - soloBookings;
    const activeSessions = state.sessions.filter((session) => session.openSlots > 0).length;
    return {
      soloBookings,
      fullCourtBookings,
      activeSessions,
    };
  }, [state.bookings, state.sessions]);

  return (
    <section className="space-y-4 fade-up">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tổng người chơi" value={state.players.length.toString()} />
        <StatCard label="Tổng số sân" value={state.courts.length.toString()} />
        <StatCard label="Session đang mở" value={metrics.activeSessions.toString()} />
        <StatCard label="Booking hôm nay (mock)" value={state.bookings.length.toString()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        <Card className="space-y-3">
          <h3 className="font-heading text-lg font-semibold text-ink">Cơ cấu booking</h3>
          <p className="text-sm text-slate-600">
            Booking ghép lẻ: <strong>{metrics.soloBookings}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Booking bao sân: <strong>{metrics.fullCourtBookings}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Bán kính ghép hiện tại: <strong>{state.adminConfig.matchingRadiusKm} km</strong>
          </p>
        </Card>

        <Card className="space-y-3">
          <h3 className="font-heading text-lg font-semibold text-ink">Rủi ro & hỗ trợ</h3>
          <p className="text-sm text-slate-600">
            Ngưỡng no-show: <strong>{state.adminConfig.noShowStrikeLimit}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Tự nhả slot sau: <strong>{state.adminConfig.autoReleaseMinutes} phút</strong>
          </p>
          <p className="text-sm text-slate-600">
            Hotline hỗ trợ: <strong>{state.adminConfig.supportHotlineEnabled ? "Bật" : "Tắt"}</strong>
          </p>
        </Card>
      </div>
    </section>
  );
}
