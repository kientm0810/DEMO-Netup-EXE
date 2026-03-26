import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Badge, Button, Card, EmptyState, Input, WeeklySessionCalendar } from "../../shared/components";
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

function getPoolSlotView(sessionMaxSlots: number, totalSlots?: number, hostSlots?: number) {
  const safeTotalSlots = Math.max(2, Math.min(totalSlots ?? sessionMaxSlots, sessionMaxSlots));
  const safeHostSlots = Math.max(1, Math.min(hostSlots ?? 1, safeTotalSlots));
  return {
    totalSlots: safeTotalSlots,
    hostSlots: safeHostSlots,
    openSlots: Math.max(safeTotalSlots - safeHostSlots, 0),
  };
}

export function OwnerCourtsPage() {
  const { state, currentOwnerId, updateCourtRentalLimit } = useAppStore();
  const [rentalLimitInput, setRentalLimitInput] = useState(120);
  const [rentalLimitMessage, setRentalLimitMessage] = useState("");

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

  const poolSet = useMemo(() => new Set(state.promotedSessionIds), [state.promotedSessionIds]);
  const registeredCourt = ownerCourts.find((court) => court.status === "active") ?? ownerCourts[0];

  useEffect(() => {
    if (!registeredCourt) {
      return;
    }
    setRentalLimitInput(registeredCourt.maxRentalDurationMinutes);
    setRentalLimitMessage("");
  }, [registeredCourt?.id, registeredCourt?.maxRentalDurationMinutes]);

  if (!registeredCourt) {
    return (
      <EmptyState
        title="Chưa có sân đăng ký"
        description="Chủ sân chưa khai báo tài nguyên sân trong mock data."
      />
    );
  }

  const registeredSessions = state.sessions
    .filter((session) => session.courtId === registeredCourt.id)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const calendarItems = registeredSessions.map((session) => ({
    session: {
      ...session,
      title: registeredCourt.subCourtName,
      ...(poolSet.has(session.id)
        ? (() => {
            const config = state.poolPostConfigs[session.id];
            const slotView = getPoolSlotView(session.maxSlots, config?.totalSlots, config?.hostSlots);
            return {
              maxSlots: slotView.totalSlots,
              openSlots: slotView.openSlots,
            };
          })()
        : {}),
    },
    court: registeredCourt,
    tags: poolSet.has(session.id) ? ["Pool chờ ghép", "Có thể thuê sân"] : ["Thuê nguyên sân"],
  }));

  const saveRentalLimit = () => {
    updateCourtRentalLimit(registeredCourt.id, rentalLimitInput);
    setRentalLimitMessage("Đã cập nhật giới hạn thời lượng thuê cho sân này.");
  };

  return (
    <section className="grid gap-4 fade-up">
      <Card className="border-red-100 bg-gradient-to-r from-white to-red-50">
        <h3 className="font-heading text-lg font-semibold text-ink">Mô hình quản lý sân theo slot</h3>
        <p className="mt-2 text-sm text-slate-700">
          Chủ sân đăng ký dịch vụ với NetUp cho từng sân. Mỗi khung giờ của sân là một đơn vị post, còn loại
          post (Pool chờ ghép hoặc Thuê nguyên sân) do người chơi quyết định khi tạo/đặt.
        </p>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-heading text-lg font-semibold text-ink">Biểu mẫu đăng ký sân (demo)</h3>
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-2">
          <p>
            <strong>Tên khu sân:</strong> {registeredCourt.complexName}
          </p>
          <p>
            <strong>Tên sân nhỏ:</strong> {registeredCourt.subCourtName}
          </p>
          <p>
            <strong>Môn đăng ký:</strong> {getSportLabel(registeredCourt.sport)}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {registeredCourt.address}
          </p>
          <Input
            label="Giới hạn thời lượng 1 lần thuê (phút)"
            type="number"
            min={30}
            step={30}
            value={rentalLimitInput}
            onChange={(event) => {
              setRentalLimitInput(Number(event.target.value) || 30);
              setRentalLimitMessage("");
            }}
          />
          <div className="flex items-end">
            <Button onClick={saveRentalLimit}>Lưu giới hạn thuê</Button>
          </div>
        </div>
        {rentalLimitMessage ? <p className="text-sm text-slate-700">{rentalLimitMessage}</p> : null}
      </Card>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-semibold text-ink">{registeredCourt.subCourtName}</h3>
            <p className="text-sm text-slate-600">{registeredCourt.complexName}</p>
            <p className="text-sm text-slate-600">{registeredCourt.address}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={registeredCourt.status === "active" ? "success" : "warning"}>
              {registeredCourt.status === "active" ? "Đang hoạt động" : "Bảo trì"}
            </Badge>
            <Badge tone="info">{getSportLabel(registeredCourt.sport)}</Badge>
            <Badge tone="neutral">Giá cơ bản: {formatVnd(registeredCourt.basePriceVnd)}</Badge>
          </div>
        </div>

        <WeeklySessionCalendar
          items={calendarItems}
          anchorDate={registeredSessions[0]?.startsAt}
          emptyMessage="Sân này chưa có khung giờ trong tuần."
        />
      </Card>

      {registeredSessions.length === 0 ? (
        <EmptyState
          title="Sân chưa có khung giờ"
          description="Hãy thêm slot trong mock data để hiển thị lịch quản lý."
        />
      ) : (
        <Card className="space-y-3">
          <h3 className="font-heading text-lg font-semibold text-ink">Danh sách slot của sân đã đăng ký</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Khung giờ</th>
                  <th className="px-3 py-2 text-left font-semibold">Số người đã thuê</th>
                  <th className="px-3 py-2 text-left font-semibold">Slot trống</th>
                  <th className="px-3 py-2 text-left font-semibold">Trạng thái post</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {registeredSessions.map((session) => {
                  const bookedPeople = Math.min(
                    bookedPeopleBySession[session.id] ?? 0,
                    session.maxSlots,
                  );
                  const hasPool = poolSet.has(session.id);
                  const config = state.poolPostConfigs[session.id];
                  const poolSlots = getPoolSlotView(session.maxSlots, config?.totalSlots, config?.hostSlots);
                  const displayedOpenSlots = hasPool ? poolSlots.openSlots : session.openSlots;
                  const displayedTotalSlots = hasPool ? poolSlots.totalSlots : session.maxSlots;
                  return (
                    <tr key={session.id}>
                      <td className="px-3 py-2 align-top">
                        <p className="font-medium text-ink">{registeredCourt.subCourtName}</p>
                        <p className="text-xs text-slate-600">
                          {formatSlotRange(session.startsAt, session.durationMinutes)}
                        </p>
                      </td>
                      <td className="px-3 py-2 align-top text-slate-700">
                        {bookedPeople}/{displayedTotalSlots} người
                      </td>
                      <td className="px-3 py-2 align-top text-slate-700">
                        {displayedOpenSlots}/{displayedTotalSlots} slot
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-wrap gap-2">
                          {hasPool ? (
                            <Badge tone="success">
                              Pool {poolSlots.hostSlots}/{poolSlots.totalSlots} slot chủ post đã giữ
                            </Badge>
                          ) : null}
                          <Badge tone="neutral">Có thể thuê nguyên sân</Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </section>
  );
}
