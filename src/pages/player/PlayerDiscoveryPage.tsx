import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { DiscoveryFilters, DiscoveryMap, type DiscoveryFilterState } from "../../features/discovery";
import { Badge, Button, Card, EmptyState } from "../../shared/components";
import { formatSessionTime, formatVnd, isSessionSkillCompatible } from "../../shared/utils";

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

export function PlayerDiscoveryPage() {
  const { state, currentPlayerAssessment } = useAppStore();
  const [filters, setFilters] = useState<DiscoveryFilterState>(initialFilters);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const sessionCards = useMemo(() => {
    return state.sessions
      .map((session) => {
        const court = state.courts.find((item) => item.id === session.courtId);
        if (!court) return null;
        const isRecommended = currentPlayerAssessment
          ? isSessionSkillCompatible(session, currentPlayerAssessment.calculatedLevel)
          : false;
        return { session, court, isRecommended };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [currentPlayerAssessment, state.courts, state.sessions]);

  const filtered = useMemo(() => {
    return sessionCards.filter(({ session, court, isRecommended }) => {
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

  return (
    <section className="space-y-4 fade-up">
      <DiscoveryFilters value={filters} onChange={setFilters} />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant={viewMode === "list" ? "primary" : "outline"} onClick={() => setViewMode("list")}>
          Xem dạng danh sách
        </Button>
        <Button variant={viewMode === "map" ? "primary" : "outline"} onClick={() => setViewMode("map")}>
          Xem trên bản đồ
        </Button>

        {currentPlayerAssessment ? (
          <Badge tone="info">Level hiện tại: {currentPlayerAssessment.calculatedLevel}</Badge>
        ) : (
          <Link to="/player/assessment">
            <Badge tone="warning">Bạn chưa self-assessment, bấm để tạo</Badge>
          </Link>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Không có session phù hợp"
          description="Thử đổi bộ lọc hoặc tắt chế độ recommend-only để xem thêm lựa chọn."
        >
          <Link to="/player/assessment">
            <Button variant="outline">Điền self-assessment</Button>
          </Link>
        </EmptyState>
      ) : null}

      {filtered.length > 0 && viewMode === "map" ? <DiscoveryMap items={filtered} /> : null}

      {filtered.length > 0 && viewMode === "list" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map(({ session, court, isRecommended }) => (
            <Card key={session.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-ink">{session.title}</h3>
                  <p className="text-sm text-slate-600">
                    {court.name} • {court.district}
                  </p>
                </div>
                <Badge tone={session.openSlots > 0 ? "success" : "warning"}>
                  {session.openSlots > 0 ? `Cần thêm ${session.openSlots} người` : "Đã đầy slot giao lưu"}
                </Badge>
              </div>

              <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <p>
                  <strong>Thời gian:</strong> {formatSessionTime(session.startsAt)}
                </p>
                <p>
                  <strong>Skill:</strong> {session.requiredSkillMin} - {session.requiredSkillMax}
                </p>
                <p>
                  <strong>Giá lẻ:</strong> {formatVnd(session.slotPriceVnd)}/slot
                </p>
                <p>
                  <strong>Giá trọn sân:</strong> {formatVnd(session.fullCourtPriceVnd)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge tone="info">{court.sport}</Badge>
                <Badge tone="neutral">{session.isPeakHour ? "Peak hour" : "Off-peak"}</Badge>
                {session.allowsSoloJoin ? (
                  <Badge tone="success">Cho phép ghép lẻ</Badge>
                ) : (
                  <Badge tone="warning">Không ghép lẻ</Badge>
                )}
                {isRecommended ? <Badge tone="success">Phù hợp level của bạn</Badge> : null}
              </div>

              <div className="mt-1 flex flex-wrap gap-2">
                <Link to={`/player/session/${session.id}`}>
                  <Button variant="outline">Xem chi tiết</Button>
                </Link>
                <Link to={`/player/booking/${session.id}`}>
                  <Button disabled={session.openSlots <= 0}>Đặt ngay</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
