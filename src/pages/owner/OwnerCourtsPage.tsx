import { useMemo } from "react";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Badge, Button, Card, EmptyState } from "../../shared/components";
import { formatVnd, getSportLabel } from "../../shared/utils";

function formatSlotRange(startsAt: string, durationMinutes: number): string {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const dateText = start.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
  const startText = start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const endText = end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return `${dateText} • ${startText} - ${endText}`;
}

export function OwnerCourtsPage() {
  const { state, currentOwnerId, toggleSessionPromotion } = useAppStore();

  const ownerCourts = useMemo(
    () => state.courts.filter((court) => court.ownerId === currentOwnerId),
    [currentOwnerId, state.courts],
  );

  const bookedPeopleBySession = useMemo(() => {
    return state.bookings.reduce<Record<string, number>>((acc, booking) => {
      if (booking.status === "cancelled") {
        return acc;
      }
      acc[booking.sessionId] = (acc[booking.sessionId] ?? 0) + booking.seatsBooked;
      return acc;
    }, {});
  }, [state.bookings]);

  const promotedSet = useMemo(() => new Set(state.promotedSessionIds), [state.promotedSessionIds]);

  if (ownerCourts.length === 0) {
    return (
      <EmptyState
        title="Chưa có sân nào"
        description="Chủ sân chưa khai báo tài nguyên sân trong mock data."
      />
    );
  }

  return (
    <section className="grid gap-4 fade-up">
      <Card className="border-red-100 bg-gradient-to-r from-white to-red-50">
        <p className="text-sm text-slate-700">
          Mỗi khung giờ là một slot quản lý độc lập. Chủ sân có thể bấm{" "}
          <strong>Promote thành bài post</strong> để đẩy đúng slot đó sang luồng người chơi.
        </p>
      </Card>

      {ownerCourts.map((court) => {
        const courtSessions = state.sessions
          .filter((session) => session.courtId === court.id)
          .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

        return (
          <Card key={court.id} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-lg font-semibold text-ink">{court.name}</h3>
                <p className="text-sm text-slate-600">{court.address}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={court.status === "active" ? "success" : "warning"}>
                  {court.status === "active" ? "Đang hoạt động" : "Bảo trì"}
                </Badge>
                <Badge tone="info">{getSportLabel(court.sport)}</Badge>
                <Badge tone="neutral">Giá cơ bản: {formatVnd(court.basePriceVnd)}</Badge>
              </div>
            </div>

            {courtSessions.length === 0 ? (
              <EmptyState
                title="Sân chưa có khung giờ"
                description="Hãy thêm slot trong mock data để bắt đầu promote bài post."
              />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Khung giờ</th>
                      <th className="px-3 py-2 text-left font-semibold">Người thuê</th>
                      <th className="px-3 py-2 text-left font-semibold">Slot trống</th>
                      <th className="px-3 py-2 text-left font-semibold">Trạng thái post</th>
                      <th className="px-3 py-2 text-right font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {courtSessions.map((session) => {
                      const bookedPeople = Math.min(
                        bookedPeopleBySession[session.id] ?? 0,
                        session.maxSlots,
                      );
                      const isPromoted = promotedSet.has(session.id);

                      return (
                        <tr key={session.id}>
                          <td className="px-3 py-2 align-top">
                            <p className="font-medium text-ink">{session.title}</p>
                            <p className="text-xs text-slate-600">
                              {formatSlotRange(session.startsAt, session.durationMinutes)}
                            </p>
                          </td>
                          <td className="px-3 py-2 align-top text-slate-700">
                            {bookedPeople}/{session.maxSlots} người
                          </td>
                          <td className="px-3 py-2 align-top text-slate-700">{session.openSlots} slot</td>
                          <td className="px-3 py-2 align-top">
                            {isPromoted ? (
                              <Badge tone="success">Đang là bài post</Badge>
                            ) : (
                              <Badge tone="neutral">Chưa promote</Badge>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right align-top">
                            <Button
                              variant={isPromoted ? "ghost" : "primary"}
                              className="px-3 py-1.5 text-xs"
                              onClick={() => toggleSessionPromotion(session.id)}
                            >
                              {isPromoted ? "Gỡ promote" : "Promote thành bài post"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );
      })}
    </section>
  );
}
