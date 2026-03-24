import { useMemo } from "react";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { CheckInPanel } from "../../features/owner";
import { Badge, Card } from "../../shared/components";
import { formatVnd } from "../../shared/utils";

export function OwnerCheckInPage() {
  const { state, checkInByCode, currentOwnerId } = useAppStore();

  const ownerCourtIds = useMemo(
    () => state.courts.filter((court) => court.ownerId === currentOwnerId).map((court) => court.id),
    [currentOwnerId, state.courts],
  );

  const ownerBookings = useMemo(
    () => state.bookings.filter((booking) => ownerCourtIds.includes(booking.courtId)),
    [ownerCourtIds, state.bookings],
  );

  const sampleCodes = ownerBookings.slice(0, 3).map((booking) => booking.bookingCode);

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr,1fr] fade-up">
      <CheckInPanel sampleCodes={sampleCodes} onCheckIn={checkInByCode} />

      <Card className="space-y-3">
        <h3 className="font-heading text-lg font-semibold text-ink">Booking queue tại quầy</h3>
        {ownerBookings.slice(0, 6).map((booking) => (
          <div key={booking.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="mb-1 flex items-center justify-between">
              <strong>{booking.bookingCode}</strong>
              <Badge tone={booking.status === "checked_in" ? "success" : "neutral"}>
                {booking.status}
              </Badge>
            </div>
            <p className="text-slate-700">
              Mode: {booking.mode === "solo" ? "Solo" : "Full court"} • Total{" "}
              {formatVnd(booking.totalPriceVnd)}
            </p>
          </div>
        ))}
      </Card>
    </section>
  );
}
