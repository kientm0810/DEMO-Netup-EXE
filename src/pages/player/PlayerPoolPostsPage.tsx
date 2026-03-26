import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { SessionPostCard } from "../../features/discovery";
import { Badge, Button, Card, EmptyState, Input, Select, SportIconFilter } from "../../shared/components";
import {
  calculateDistanceKm,
  formatDistanceLabel,
  formatSessionTime,
  getSportLabel,
  type Coordinates,
} from "../../shared/utils";

type SportFilter = "All" | "Badminton" | "Football" | "Tennis";

function getPoolSlotView(params: {
  sessionMaxSlots: number;
  configuredTotalSlots?: number;
  configuredHostSlots?: number;
}) {
  const totalSlots = Math.max(2, Math.min(params.configuredTotalSlots ?? params.sessionMaxSlots, params.sessionMaxSlots));
  const hostSlots = Math.max(1, Math.min(params.configuredHostSlots ?? 1, totalSlots));
  return {
    totalSlots,
    hostSlots,
    openSlots: Math.max(totalSlots - hostSlots, 0),
  };
}

export function PlayerPoolPostsPage() {
  const { state, createPoolPost, hasCurrentPlayerAssessmentForSport } = useAppStore();
  const [search, setSearch] = useState("");
  const [listSportFilter, setListSportFilter] = useState<SportFilter>("All");
  const [createSportFilter, setCreateSportFilter] = useState<Exclude<SportFilter, "All">>("Badminton");
  const [createCourtId, setCreateCourtId] = useState<string>("");
  const [createSessionId, setCreateSessionId] = useState<string>("");
  const [desiredTotalSlots, setDesiredTotalSlots] = useState<number>(4);
  const [myRegisteredSlots, setMyRegisteredSlots] = useState<number>(1);
  const [createMessage, setCreateMessage] = useState<string>("");
  const [creatingPool, setCreatingPool] = useState(false);
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

  const poolPosts = useMemo(() => {
    return state.sessions
      .filter((session) => poolSessionSet.has(session.id))
      .map((session) => {
        const court = state.courts.find((item) => item.id === session.courtId);
        if (!court) return null;
        const config = state.poolPostConfigs[session.id];
        const slotView = getPoolSlotView({
          sessionMaxSlots: session.maxSlots,
          configuredTotalSlots: config?.totalSlots,
          configuredHostSlots: config?.hostSlots,
        });
        return {
          session: {
            ...session,
            maxSlots: slotView.totalSlots,
            openSlots: slotView.openSlots,
          },
          court,
          hostSlots: slotView.hostSlots,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [poolSessionSet, state.courts, state.poolPostConfigs, state.sessions]);

  const filteredPoolPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return poolPosts.filter(({ session, court }) => {
      const queryPass =
        query.length === 0 ||
        court.subCourtName.toLowerCase().includes(query) ||
        court.complexName.toLowerCase().includes(query) ||
        court.address.toLowerCase().includes(query) ||
        session.title.toLowerCase().includes(query);
      const sportPass = listSportFilter === "All" || court.sport === listSportFilter;
      return queryPass && sportPass;
    });
  }, [listSportFilter, poolPosts, search]);

  const creatableCourts = useMemo(() => {
    const availableCourtIds = new Set(
      state.sessions
        .filter((session) => session.openSlots > 0 && !poolSessionSet.has(session.id))
        .map((session) => session.courtId),
    );

    return state.courts.filter(
      (court) => court.sport === createSportFilter && availableCourtIds.has(court.id),
    );
  }, [createSportFilter, poolSessionSet, state.courts, state.sessions]);

  const creatableSessions = useMemo(() => {
    return state.sessions
      .filter(
        (session) =>
          session.openSlots > 0 &&
          !poolSessionSet.has(session.id) &&
          session.courtId === createCourtId,
      )
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [createCourtId, poolSessionSet, state.sessions]);

  const selectedCreateSession = creatableSessions.find((session) => session.id === createSessionId);
  const hasAssessmentForCreateSport = hasCurrentPlayerAssessmentForSport(createSportFilter);

  useEffect(() => {
    if (creatableCourts.length === 0) {
      setCreateCourtId("");
      return;
    }

    const stillValid = creatableCourts.some((court) => court.id === createCourtId);
    if (!stillValid) {
      setCreateCourtId(creatableCourts[0].id);
    }
  }, [createCourtId, creatableCourts]);

  useEffect(() => {
    if (creatableSessions.length === 0) {
      setCreateSessionId("");
      return;
    }

    const stillValid = creatableSessions.some((session) => session.id === createSessionId);
    if (!stillValid) {
      setCreateSessionId(creatableSessions[0].id);
    }
  }, [createSessionId, creatableSessions]);

  useEffect(() => {
    if (!selectedCreateSession) {
      return;
    }
    const nextTotalSlots = Math.max(2, Math.min(desiredTotalSlots, selectedCreateSession.maxSlots));
    const nextMySlots = Math.max(1, Math.min(myRegisteredSlots, nextTotalSlots));
    if (nextTotalSlots !== desiredTotalSlots) {
      setDesiredTotalSlots(nextTotalSlots);
    }
    if (nextMySlots !== myRegisteredSlots) {
      setMyRegisteredSlots(nextMySlots);
    }
  }, [desiredTotalSlots, myRegisteredSlots, selectedCreateSession]);

  const handleCreatePool = async () => {
    if (!hasAssessmentForCreateSport) {
      setCreateMessage(
        `Bạn cần hoàn thành tự đánh giá môn ${getSportLabel(createSportFilter)} trước khi tạo post ghép kèo.`,
      );
      return;
    }

    if (!selectedCreateSession) {
      setCreateMessage("Bạn cần chọn sân và khung giờ trước khi tạo post ghép kèo.");
      return;
    }

    setCreatingPool(true);
    const ok = await createPoolPost({
      sessionId: selectedCreateSession.id,
      totalSlots: desiredTotalSlots,
      hostSlots: myRegisteredSlots,
    });
    setCreatingPool(false);

    setCreateMessage(
      ok
        ? `Đã tạo pool cho ${selectedCreateSession.title} (${formatSessionTime(
            selectedCreateSession.startsAt,
          )}) với ${myRegisteredSlots}/${desiredTotalSlots} slot do bạn đăng ký trước.`
        : "Không thể tạo post ghép kèo. Vui lòng thử lại.",
    );
  };

  return (
    <section className="space-y-4 fade-up">
      <Card className="space-y-3 border-red-100 bg-gradient-to-r from-white to-red-50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-xl font-semibold text-ink">Kèo chờ ghép</h2>
            <p className="text-sm text-slate-700">
              Xem các post pool đang mở, hoặc tự tạo pool mới theo đúng luồng: lọc môn - chọn sân - chọn slot.
            </p>
          </div>
          <Button variant="outline" onClick={requestUserLocation} disabled={locationStatus === "loading"}>
            {locationStatus === "loading" ? "Đang lấy vị trí..." : "Dùng vị trí của tôi"}
          </Button>
        </div>
        {locationStatus === "error" ? <p className="text-sm text-red-700">{locationError}</p> : null}
      </Card>

      <Card className="space-y-3">
        <h3 className="font-heading text-lg font-semibold text-ink">Tạo post ghép kèo (demo flow chuẩn)</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <SportIconFilter
            label="Bước 1 - Lọc theo môn"
            value={createSportFilter}
            options={["Badminton", "Football", "Tennis"]}
            onChange={(next) => {
              setCreateSportFilter(next as Exclude<SportFilter, "All">);
              setCreateMessage("");
            }}
          />

          <Select
            label="Bước 2 - Chọn sân"
            value={createCourtId}
            onChange={(event) => {
              setCreateCourtId(event.target.value);
              setCreateMessage("");
            }}
            options={
              creatableCourts.length > 0
                ? creatableCourts.map((court) => ({
                    value: court.id,
                    label: `${court.subCourtName} (${court.complexName})`,
                  }))
                : [{ value: "", label: "Không có sân phù hợp" }]
            }
          />

          <Select
            label="Bước 3 - Chọn khung giờ"
            value={createSessionId}
            onChange={(event) => {
              setCreateSessionId(event.target.value);
              setCreateMessage("");
            }}
            options={
              creatableSessions.length > 0
                ? creatableSessions.map((session) => ({
                    value: session.id,
                    label: `${formatSessionTime(session.startsAt)} • ${session.durationMinutes} phút`,
                  }))
                : [{ value: "", label: "Không có khung giờ phù hợp" }]
            }
          />

          <Input
            label="Bước 4 - Tổng slot mong muốn cho sân"
            type="number"
            min={2}
            max={selectedCreateSession?.maxSlots ?? 2}
            value={desiredTotalSlots}
            onChange={(event) => {
              const next = Number(event.target.value) || 2;
              setDesiredTotalSlots(next);
              setCreateMessage("");
            }}
          />

          <Input
            label="Bước 5 - Slot bạn đăng ký trước"
            type="number"
            min={1}
            max={Math.max(1, desiredTotalSlots)}
            value={myRegisteredSlots}
            onChange={(event) => {
              const next = Number(event.target.value) || 1;
              setMyRegisteredSlots(next);
              setCreateMessage("");
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => void handleCreatePool()}
            disabled={!selectedCreateSession || creatingPool || !hasAssessmentForCreateSport}
          >
            {creatingPool ? "Đang tạo..." : "Tạo post ghép kèo"}
          </Button>
          {!hasAssessmentForCreateSport ? (
            <Link to="/player/assessment" state={{ sport: createSportFilter }}>
              <Button variant="outline">Làm tự đánh giá môn này trước</Button>
            </Link>
          ) : null}
          <Link to="/player/rent-courts">
            <Button variant="outline">Chuyển sang thuê nguyên sân</Button>
          </Link>
        </div>
        {createMessage ? <p className="text-sm text-slate-700">{createMessage}</p> : null}
      </Card>

      <Card className="grid gap-3 lg:grid-cols-[minmax(280px,1fr),minmax(0,1.4fr)]">
        <Input
          label="Tìm nhanh post pool"
          placeholder="Tên sân, khu sân, địa chỉ..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="space-y-2">
          <SportIconFilter
            label="Lọc danh sách post theo môn"
            value={listSportFilter}
            onChange={(next) => setListSportFilter(next as SportFilter)}
          />
          <div className="flex items-center justify-end">
            <Badge tone="info">Đang có {filteredPoolPosts.length} post pool</Badge>
          </div>
        </div>
      </Card>

      {filteredPoolPosts.length === 0 ? (
        <EmptyState
          title="Chưa có post pool phù hợp"
          description="Bạn có thể tạo post ghép kèo mới theo form bên trên."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredPoolPosts.map(({ session, court, hostSlots }) => {
            const distanceKm = userLocation
              ? calculateDistanceKm(userLocation, {
                  latitude: court.latitude,
                  longitude: court.longitude,
                })
              : null;
            const distanceLabel = distanceKm !== null ? formatDistanceLabel(distanceKm) : null;

            return (
              <SessionPostCard
                key={session.id}
                session={session}
                court={court}
                postType="pool"
                distanceLabel={distanceLabel}
                slotSummary={{
                  openSlots: session.openSlots,
                  totalSlots: session.maxSlots,
                  hostSlots,
                }}
                detailState={{ sourceType: "pool" }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
