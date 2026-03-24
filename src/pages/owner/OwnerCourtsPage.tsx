import { useMemo, useState } from "react";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Badge, Button, Card, EmptyState } from "../../shared/components";
import { formatVnd, getSportLabel } from "../../shared/utils";

export function OwnerCourtsPage() {
  const { state, currentOwnerId } = useAppStore();
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);

  const ownerCourts = useMemo(
    () => state.courts.filter((court) => court.ownerId === currentOwnerId),
    [currentOwnerId, state.courts],
  );

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
      {ownerCourts.map((court) => (
        <Card key={court.id} className="space-y-3">
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
              {court.isPickupEnabled ? (
                <Badge tone="success">Cho phép ghép lẻ</Badge>
              ) : (
                <Badge tone="neutral">Chỉ đặt theo nhóm</Badge>
              )}
            </div>
          </div>

          <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              <strong>Giá cơ bản:</strong> {formatVnd(court.basePriceVnd)}
            </p>
            <p>
              <strong>Đánh giá:</strong> {court.rating} / 5
            </p>
            <p>
              <strong>Giá động:</strong> +15% cuối tuần, -10% sáng ngày thường
            </p>
            <p>
              <strong>Tiện ích:</strong> {court.amenities.join(", ")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSelectedCourtId(court.id)}>
              Chỉnh lịch offline
            </Button>
            <Button variant="ghost">Đẩy ưu đãi giờ trống</Button>
          </div>

          {selectedCourtId === court.id ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              Mô phỏng thao tác: đã khóa 1 slot offline và đồng bộ lên app để tránh overbooking.
            </div>
          ) : null}
        </Card>
      ))}
    </section>
  );
}
