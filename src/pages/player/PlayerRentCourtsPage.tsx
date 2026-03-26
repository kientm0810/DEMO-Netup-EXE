import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Badge, Button, Card, EmptyState, Input, Select, SportIconFilter, WeeklySessionCalendar } from "../../shared/components";
import {
  calculateDistanceKm,
  formatDistanceLabel,
  formatSessionTime,
  formatVnd,
  getPostBackgroundBySport,
  getSportLabel,
  type Coordinates,
} from "../../shared/utils";

type SportFilter = "All" | "Badminton" | "Football" | "Tennis";

function formatDateTimeLocalInput(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
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

export function PlayerRentCourtsPage() {
  const { state, createRentalSlot } = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState<SportFilter>("All");
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [rentalStartsAt, setRentalStartsAt] = useState(formatDateTimeLocalInput(new Date().toISOString()));
  const [rentalDurationMinutes, setRentalDurationMinutes] = useState<number>(60);
  const [rentalError, setRentalError] = useState("");
  const [rentalSubmitting, setRentalSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [locationError, setLocationError] = useState("");

  const poolSessionSet = useMemo(() => new Set(state.promotedSessionIds), [state.promotedSessionIds]);

  const requestUserLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Trình duyệt không hỗ trợ lấy vị trí.");
      return;
    }

    setLocationStatus("loading");
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("ready");
      },
      () => {
        setLocationStatus("error");
        setLocationError("Không thể lấy vị trí. Hãy cấp quyền vị trí rồi thử lại.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const filteredCourts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return state.courts.filter((court) => {
      const queryPass =
        query.length === 0 ||
        court.subCourtName.toLowerCase().includes(query) ||
        court.complexName.toLowerCase().includes(query) ||
        court.address.toLowerCase().includes(query) ||
        court.district.toLowerCase().includes(query);
      const sportPass = sportFilter === "All" || court.sport === sportFilter;
      return queryPass && sportPass;
    });
  }, [search, sportFilter, state.courts]);

  useEffect(() => {
    if (filteredCourts.length === 0) {
      setSelectedCourtId("");
      return;
    }
    const stillExists = filteredCourts.some((court) => court.id === selectedCourtId);
    if (!stillExists) {
      setSelectedCourtId(filteredCourts[0].id);
    }
  }, [filteredCourts, selectedCourtId]);

  const selectedCourt = filteredCourts.find((court) => court.id === selectedCourtId);

  const selectedCourtSessions = useMemo(() => {
    if (!selectedCourt) {
      return [];
    }
    return state.sessions
      .filter((session) => session.courtId === selectedCourt.id)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [selectedCourt, state.sessions]);

  useEffect(() => {
    if (!selectedCourt) {
      return;
    }
    setRentalDurationMinutes(Math.min(60, selectedCourt.maxRentalDurationMinutes));
    if (selectedCourtSessions.length > 0) {
      setRentalStartsAt(formatDateTimeLocalInput(selectedCourtSessions[0].startsAt));
    }
    setRentalError("");
  }, [selectedCourt?.id, selectedCourt?.maxRentalDurationMinutes, selectedCourtSessions.length]);

  const durationOptions = useMemo(() => {
    if (!selectedCourt) {
      return [{ value: "60", label: "60 phút" }];
    }
    const options: Array<{ value: string; label: string }> = [];
    for (let value = 30; value <= selectedCourt.maxRentalDurationMinutes; value += 30) {
      options.push({ value: value.toString(), label: `${value} phút` });
    }
    return options;
  }, [selectedCourt]);

  const calendarItems = useMemo(() => {
    if (!selectedCourt) {
      return [];
    }
    return selectedCourtSessions.map((session) => {
      const isPool = poolSessionSet.has(session.id);
      const config = state.poolPostConfigs[session.id];
      const poolSlots = getPoolSlotView(session.maxSlots, config?.totalSlots, config?.hostSlots);
      return {
        session: isPool
          ? {
              ...session,
              title: selectedCourt.subCourtName,
              maxSlots: poolSlots.totalSlots,
              openSlots: poolSlots.openSlots,
            }
          : {
              ...session,
              title: selectedCourt.subCourtName,
            },
        court: selectedCourt,
        isPromoted: isPool,
        tags: isPool ? ["Pool chờ ghép", "Có thể thuê sân"] : ["Thuê nguyên sân"],
      };
    });
  }, [poolSessionSet, selectedCourt, selectedCourtSessions, state.poolPostConfigs]);

  const handleCreateRentalSlot = async () => {
    if (!selectedCourt) {
      setRentalError("Bạn cần chọn sân để tạo slot thuê.");
      return;
    }

    if (!rentalStartsAt) {
      setRentalError("Bạn cần chọn thời điểm bắt đầu.");
      return;
    }

    const startsAtDate = new Date(rentalStartsAt);
    if (Number.isNaN(startsAtDate.getTime())) {
      setRentalError("Thời điểm bắt đầu không hợp lệ.");
      return;
    }

    setRentalSubmitting(true);
    setRentalError("");
    const createdSession = await createRentalSlot({
      courtId: selectedCourt.id,
      startsAt: startsAtDate.toISOString(),
      durationMinutes: rentalDurationMinutes,
    });

    if (!createdSession) {
      setRentalSubmitting(false);
      setRentalError("Không thể tạo slot do trùng lịch hiện tại. Hãy chọn thời điểm khác.");
      return;
    }

    navigate(`/player/booking/${createdSession.id}`, {
      state: { preferredMode: "full_court", sourceType: "rental", rentalCreated: true },
    });
  };

  return (
    <section className="space-y-4 fade-up">
      <Card className="space-y-3 border-red-100 bg-gradient-to-r from-white to-red-50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-xl font-semibold text-ink">Thuê nguyên sân</h2>
            <p className="text-sm text-slate-700">
              Chọn sân để mở lịch hiện tại, sau đó tạo slot thuê mới ngay trên lịch.
            </p>
          </div>
          <Button variant="outline" onClick={requestUserLocation} disabled={locationStatus === "loading"}>
            {locationStatus === "loading" ? "Đang lấy vị trí..." : "Dùng vị trí của tôi"}
          </Button>
        </div>
        {locationStatus === "error" ? <p className="text-sm text-red-700">{locationError}</p> : null}
      </Card>

      <Card className="grid gap-3 lg:grid-cols-[minmax(280px,1fr),minmax(0,1.4fr)]">
        <Input
          label="Tìm sân"
          placeholder="Tên sân, khu sân, địa chỉ..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="space-y-2">
          <SportIconFilter
            label="Lọc theo môn"
            value={sportFilter}
            onChange={(next) => setSportFilter(next as SportFilter)}
          />
          <div className="flex items-center justify-end">
            <Badge tone="info">Hiển thị {filteredCourts.length} sân</Badge>
          </div>
        </div>
      </Card>

      {filteredCourts.length === 0 ? (
        <EmptyState
          title="Chưa có sân phù hợp"
          description="Thử thay đổi bộ lọc để xem thêm sân khả dụng."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredCourts.map((court) => {
            const distanceKm = userLocation
              ? calculateDistanceKm(userLocation, {
                  latitude: court.latitude,
                  longitude: court.longitude,
                })
              : null;
            const distanceLabel = distanceKm !== null ? formatDistanceLabel(distanceKm) : null;
            const isSelected = selectedCourtId === court.id;
            return (
              <article key={court.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div
                  className="min-h-[170px] bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(120deg, rgba(15, 23, 42, 0.28), rgba(127, 29, 29, 0.35)), url(${getPostBackgroundBySport(
                      court.sport,
                      court.id,
                    )})`,
                  }}
                />
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-ink">{court.subCourtName}</h3>
                    <p className="text-sm text-slate-600">{court.complexName}</p>
                    <p className="text-sm text-slate-600">{court.address}</p>
                    {distanceLabel ? (
                      <p className="mt-1 text-xs font-medium text-sky-700">Cách bạn khoảng {distanceLabel}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge tone="info">{getSportLabel(court.sport)}</Badge>
                    <Badge tone="neutral">Giá cơ bản: {formatVnd(court.basePriceVnd)}</Badge>
                    <Badge tone="warning">Giới hạn 1 lần thuê: {court.maxRentalDurationMinutes} phút</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setSelectedCourtId(court.id)}>
                      {isSelected ? "Đang mở lịch sân này" : "Thuê sân (mở lịch)"}
                    </Button>
                    <Link to="/player/pool-posts">
                      <Button variant="outline">Chuyển sang kèo chờ ghép</Button>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedCourt ? (
        <Card className="space-y-4">
          <div>
            <h3 className="font-heading text-lg font-semibold text-ink">
              Lịch sân hiện tại - {selectedCourt.subCourtName}
            </h3>
            <p className="text-sm text-slate-600">
              {selectedCourt.complexName}. Bạn có thể tạo slot thuê mới ngay bên dưới lịch.
            </p>
          </div>

          <WeeklySessionCalendar
            items={calendarItems}
            anchorDate={selectedCourtSessions[0]?.startsAt}
            emptyMessage="Sân này chưa có slot trong tuần."
          />

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
            <Input
              label="Thời điểm bắt đầu"
              type="datetime-local"
              value={rentalStartsAt}
              onChange={(event) => {
                setRentalStartsAt(event.target.value);
                setRentalError("");
              }}
            />
            <Select
              label="Thời lượng thuê"
              value={rentalDurationMinutes.toString()}
              options={durationOptions}
              onChange={(event) => {
                setRentalDurationMinutes(Number(event.target.value));
                setRentalError("");
              }}
            />
            <div className="flex items-end">
              <Button onClick={() => void handleCreateRentalSlot()} disabled={rentalSubmitting}>
                {rentalSubmitting ? "Đang tạo..." : "Tạo slot và thuê sân"}
              </Button>
            </div>
          </div>
          {rentalError ? <p className="text-sm text-red-700">{rentalError}</p> : null}

          <div className="space-y-1 text-sm text-slate-700">
            <p>
              <strong>Giới hạn theo chủ sân:</strong> tối đa {selectedCourt.maxRentalDurationMinutes} phút/lần thuê.
            </p>
            <p>
              <strong>Mẹo:</strong> nếu bị trùng lịch, đổi thời điểm bắt đầu hoặc giảm thời lượng để tạo slot mới.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
            <h4 className="font-semibold text-ink">Các slot hiện có của sân này</h4>
            {selectedCourtSessions.length === 0 ? (
              <p className="text-sm text-slate-600">Chưa có slot nào.</p>
            ) : (
              <div className="grid gap-2 lg:grid-cols-2">
                {selectedCourtSessions.map((courtSession) => (
                  <div key={courtSession.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                    <p className="font-medium text-ink">{formatSessionTime(courtSession.startsAt)}</p>
                    <p className="text-slate-600">
                      {courtSession.durationMinutes} phút • {courtSession.openSlots}/{courtSession.maxSlots} slot
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ) : null}
    </section>
  );
}
