import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { DiscoveryFilters, DiscoveryMap, type DiscoveryFilterState } from "../../features/discovery";
import { Badge, Button, Card, EmptyState } from "../../shared/components";
import badmintonPostBg from "../../shared/assets/post-backgrounds/post-badminton.svg";
import footballPostBg from "../../shared/assets/post-backgrounds/post-football.svg";
import tennisPostBg from "../../shared/assets/post-backgrounds/post-tennis.svg";
import {
  buildGoogleMapsDirectionsUrl,
  calculateDistanceKm,
  cn,
  formatSessionTime,
  formatDistanceLabel,
  formatVnd,
  getSkillLabel,
  getSportLabel,
  isSessionSkillCompatible,
  type Coordinates,
} from "../../shared/utils";

const skillRank: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

const initialFilters: DiscoveryFilterState = {
  search: "",
  sport: "All",
  skill: "All",
  pickupOnly: false,
  recommendedOnly: false,
};

const pickupPostBackgroundBySport = {
  Badminton: badmintonPostBg,
  Football: footballPostBg,
  Tennis: tennisPostBg,
};

const routeModes = [
  { label: "Xe máy/Ô tô", mode: "driving" as const },
  { label: "Đi bộ", mode: "walking" as const },
  { label: "Xe đạp", mode: "bicycling" as const },
  { label: "Công cộng", mode: "transit" as const },
];

export function PlayerDiscoveryPage() {
  const { state, currentPlayerAssessment } = useAppStore();
  const [filters, setFilters] = useState<DiscoveryFilterState>(initialFilters);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [locationError, setLocationError] = useState<string>("");
  const promotedSessionSet = useMemo(() => new Set(state.promotedSessionIds), [state.promotedSessionIds]);

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
        setLocationError("Không thể lấy vị trí. Hãy kiểm tra quyền truy cập vị trí trong trình duyệt.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const sessionCards = useMemo(() => {
    return state.sessions
      .map((session) => {
        const court = state.courts.find((item) => item.id === session.courtId);
        if (!court) return null;
        const isRecommended = currentPlayerAssessment
          ? isSessionSkillCompatible(session, currentPlayerAssessment.calculatedLevel)
          : false;
        const occupiedSlots = session.maxSlots - session.openSlots;
        const isPromotedPost = promotedSessionSet.has(session.id);
        return { session, court, isRecommended, occupiedSlots, isPromotedPost };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [currentPlayerAssessment, promotedSessionSet, state.courts, state.sessions]);

  const filtered = useMemo(() => {
    return sessionCards.filter(({ session, court, isRecommended, isPromotedPost }) => {
      if (!isPromotedPost) {
        return false;
      }
      const query = filters.search.trim().toLowerCase();
      const queryPass =
        query.length === 0 ||
        session.title.toLowerCase().includes(query) ||
        court.name.toLowerCase().includes(query) ||
        court.district.toLowerCase().includes(query);

      const sportPass = filters.sport === "All" || court.sport === filters.sport;
      const skillPass =
        filters.skill === "All" ||
        (skillRank[session.requiredSkillMin] <= skillRank[filters.skill] &&
          skillRank[session.requiredSkillMax] >= skillRank[filters.skill]);
      const pickupPass = !filters.pickupOnly || (session.allowsSoloJoin && session.openSlots > 0);
      const recommendedPass = !filters.recommendedOnly || isRecommended;

      return queryPass && sportPass && skillPass && pickupPass && recommendedPass;
    });
  }, [filters, sessionCards]);

  const filteredSessionIds = useMemo(() => filtered.map((item) => item.session.id), [filtered]);

  return (
    <section className="space-y-4 fade-up">
      <DiscoveryFilters value={filters} onChange={setFilters} />

      <Card className="flex flex-wrap items-center justify-between gap-3 border-red-100 bg-gradient-to-r from-white to-red-50">
        <div>
          <p className="text-sm font-semibold text-red-700">Điểm nhấn AI & Map</p>
          <p className="text-sm text-slate-700">
            Xem nhanh trạng thái slot ngay trên map (ví dụ 6/8) và nhận gợi ý theo level hiện tại.
          </p>
          {locationStatus === "ready" && userLocation ? (
            <p className="mt-1 text-xs text-slate-600">
              Đã lấy vị trí của bạn ({userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}).
            </p>
          ) : null}
          {locationStatus === "error" && locationError ? (
            <p className="mt-1 text-xs text-red-700">{locationError}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={requestUserLocation} disabled={locationStatus === "loading"}>
            {locationStatus === "loading" ? "Đang lấy vị trí..." : "Dùng vị trí của tôi"}
          </Button>
          {currentPlayerAssessment ? (
            <Badge tone="success">
              AI đang dùng level: {getSkillLabel(currentPlayerAssessment.calculatedLevel)}
            </Badge>
          ) : (
            <Link to="/player/assessment">
              <Badge tone="warning">Bạn chưa có level, bấm để tự đánh giá</Badge>
            </Link>
          )}
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant={viewMode === "list" ? "primary" : "outline"} onClick={() => setViewMode("list")}>
          Xem dạng danh sách
        </Button>
        <Button variant={viewMode === "map" ? "primary" : "outline"} onClick={() => setViewMode("map")}>
          Xem trên bản đồ
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Chưa có bài post phù hợp"
          description="Hiện chưa có slot nào được chủ sân promote thành bài post theo bộ lọc bạn chọn."
        >
          <Link to="/player/assessment">
            <Button variant="outline">Điền tự đánh giá</Button>
          </Link>
        </EmptyState>
      ) : null}

      {filtered.length > 0 && viewMode === "map" ? (
        <DiscoveryMap
          items={filtered}
          userLocation={userLocation}
          filteredSessionIds={filteredSessionIds}
        />
      ) : null}

      {filtered.length > 0 && viewMode === "list" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map(({ session, court, isRecommended, occupiedSlots, isPromotedPost }) => {
            const isPickupPost = session.allowsSoloJoin && session.openSlots > 0;
            const destination = {
              latitude: court.latitude,
              longitude: court.longitude,
            };
            const distanceKm = userLocation ? calculateDistanceKm(userLocation, destination) : null;
            const distanceLabel = distanceKm !== null ? formatDistanceLabel(distanceKm) : null;
            const backgroundImage = `linear-gradient(120deg, rgba(15, 23, 42, 0.78), rgba(127, 29, 29, 0.68)), url(${pickupPostBackgroundBySport[court.sport]})`;

            return (
              <Card
                key={session.id}
                className={cn(
                  "flex flex-col gap-3 border-slate-200 bg-cover bg-center text-white",
                  isPickupPost && "border-red-200",
                )}
                style={{ backgroundImage }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-white">{session.title}</h3>
                    <p className="text-sm text-slate-100">
                      {distanceLabel ? (
                        <span className="mr-2 inline-flex rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
                          {distanceLabel}
                        </span>
                      ) : null}
                      {court.name} • {court.district}
                    </p>
                  </div>
                  <Badge tone={session.openSlots > 0 ? "success" : "warning"}>
                    Đã chiếm {occupiedSlots}/{session.maxSlots} slot
                  </Badge>
                </div>

                {isPickupPost ? (
                  <Badge className="w-fit bg-white/20 text-white">Bài post tuyển slot trống</Badge>
                ) : null}
                {isPromotedPost ? (
                  <Badge className="w-fit bg-white/20 text-white">Slot đã được chủ sân promote</Badge>
                ) : null}

                <div className="grid gap-2 text-sm text-slate-100 sm:grid-cols-2">
                  <p>
                    <strong>Thời gian:</strong> {formatSessionTime(session.startsAt)}
                  </p>
                  <p>
                    <strong>Mức skill:</strong> {getSkillLabel(session.requiredSkillMin)} -{" "}
                    {getSkillLabel(session.requiredSkillMax)}
                  </p>
                  <p>
                    <strong>Giá lẻ:</strong> {formatVnd(session.slotPriceVnd)}/slot
                  </p>
                  <p>
                    <strong>Giá trọn sân:</strong> {formatVnd(session.fullCourtPriceVnd)}
                  </p>
                </div>

                {userLocation ? (
                  <div className="space-y-2 rounded-xl border border-white/20 bg-white/10 p-2">
                    <p className="text-xs text-slate-100">
                      Đường đi giả lập qua Google Maps theo phương tiện:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {routeModes.map((routeMode) => (
                        <a
                          key={routeMode.mode}
                          href={buildGoogleMapsDirectionsUrl({
                            origin: userLocation,
                            destination,
                            travelMode: routeMode.mode,
                          })}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
                        >
                          {routeMode.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Badge tone="info">{getSportLabel(court.sport)}</Badge>
                  <Badge tone="neutral">{session.isPeakHour ? "Giờ cao điểm" : "Giờ thấp điểm"}</Badge>
                  {session.allowsSoloJoin ? (
                    <Badge tone="success">Cho phép ghép lẻ</Badge>
                  ) : (
                    <Badge tone="warning">Không ghép lẻ</Badge>
                  )}
                  {isRecommended ? <Badge tone="success">AI đề xuất cho level của bạn</Badge> : null}
                </div>

                <div className="mt-1 flex flex-wrap gap-2">
                  <Link to={`/player/session/${session.id}`} state={{ filteredSessionIds }}>
                    <Button variant="outline">Xem chi tiết</Button>
                  </Link>
                  <Link to={`/player/booking/${session.id}`}>
                    <Button disabled={session.openSlots <= 0}>Đặt ngay</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
