import { useMemo } from "react";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Badge, Card, StatCard } from "../../shared/components";
import { formatVnd } from "../../shared/utils";

export function OwnerDashboardPage() {
  const { state, currentOwnerId } = useAppStore();

  const ownerCourtIds = useMemo(
    () => state.courts.filter((court) => court.ownerId === currentOwnerId).map((court) => court.id),
    [currentOwnerId, state.courts],
  );

  const recentBookings = useMemo(() => {
    return state.bookings
      .filter((booking) => ownerCourtIds.includes(booking.courtId))
      .slice()
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 5);
  }, [ownerCourtIds, state.bookings]);

  return (
    <section className="space-y-4 fade-up">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue Today" value={formatVnd(state.ownerAnalytics.revenue.todayVnd)} />
        <StatCard label="Revenue Week" value={formatVnd(state.ownerAnalytics.revenue.weeklyVnd)} />
        <StatCard
          label="Occupancy Today"
          value={`${state.ownerAnalytics.occupancy.todayPercent}%`}
          helper={`Peak hours: ${state.ownerAnalytics.occupancy.peakHours}`}
        />
        <StatCard
          label="Pending Payout"
          value={formatVnd(state.ownerAnalytics.revenue.pendingPayoutVnd)}
          helper="Đã trừ 10% chiết khấu mock"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        <Card className="space-y-3">
          <h3 className="font-heading text-lg font-semibold text-ink">Weekly Occupancy Trend</h3>
          <div className="space-y-3">
            {state.ownerAnalytics.trend.map((point) => (
              <div key={point.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{point.label}</span>
                  <span>{point.occupancyPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#7f1d1d] to-[#9ca3af]"
                    style={{ width: `${point.occupancyPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="font-heading text-lg font-semibold text-ink">Recent Bookings</h3>
          {recentBookings.map((booking) => {
            const session = state.sessions.find((item) => item.id === booking.sessionId);
            return (
              <div
                key={booking.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
              >
                <div className="mb-1 flex items-center justify-between">
                  <strong>{booking.bookingCode}</strong>
                  <Badge tone={booking.status === "checked_in" ? "success" : "neutral"}>
                    {booking.status}
                  </Badge>
                </div>
                <p>{session?.title ?? booking.sessionId}</p>
                <p>{formatVnd(booking.totalPriceVnd)}</p>
              </div>
            );
          })}
        </Card>
      </div>
    </section>
  );
}
