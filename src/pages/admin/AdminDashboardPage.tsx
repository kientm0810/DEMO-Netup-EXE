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
        <StatCard label="Total Players" value={state.players.length.toString()} />
        <StatCard label="Total Courts" value={state.courts.length.toString()} />
        <StatCard label="Active Sessions" value={metrics.activeSessions.toString()} />
        <StatCard label="Bookings Today (mock)" value={state.bookings.length.toString()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        <Card className="space-y-3">
          <h3 className="font-heading text-lg font-semibold text-ink">Booking Mix</h3>
          <p className="text-sm text-slate-600">
            Solo booking: <strong>{metrics.soloBookings}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Full-court booking: <strong>{metrics.fullCourtBookings}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Matching radius hiện tại: <strong>{state.adminConfig.matchingRadiusKm} km</strong>
          </p>
        </Card>

        <Card className="space-y-3">
          <h3 className="font-heading text-lg font-semibold text-ink">Risk & Support Snapshot</h3>
          <p className="text-sm text-slate-600">
            No-show strike limit: <strong>{state.adminConfig.noShowStrikeLimit}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Auto release phút: <strong>{state.adminConfig.autoReleaseMinutes}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Hotline: <strong>{state.adminConfig.supportHotlineEnabled ? "Enabled" : "Disabled"}</strong>
          </p>
        </Card>
      </div>
    </section>
  );
}
