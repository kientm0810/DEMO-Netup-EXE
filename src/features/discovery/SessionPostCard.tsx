import { Link } from "react-router-dom";
import type { BookingMode, Court, Session } from "../../entities";
import { Badge, Button } from "../../shared/components";
import { formatSessionTime, formatVnd, getPostBackgroundBySport } from "../../shared/utils";

interface SlotSummary {
  totalSlots: number;
  openSlots: number;
  hostSlots?: number;
}

interface SessionPostCardProps {
  session: Session;
  court: Court;
  postType: "pool" | "rental";
  distanceLabel?: string | null;
  detailState?: Record<string, unknown>;
  slotSummary?: SlotSummary;
}

function getPrimaryCta(postType: "pool" | "rental"): string {
  return postType === "pool" ? "Tham gia pool" : "Đặt thuê sân";
}

function getTypeLabel(postType: "pool" | "rental"): string {
  return postType === "pool" ? "Post pool chờ ghép" : "Post thuê nguyên sân";
}

function getBookingMode(postType: "pool" | "rental"): BookingMode {
  return postType === "pool" ? "solo" : "full_court";
}

export function SessionPostCard({
  session,
  court,
  postType,
  distanceLabel,
  detailState,
  slotSummary,
}: SessionPostCardProps) {
  const backgroundImage = `linear-gradient(120deg, rgba(15, 23, 42, 0.28), rgba(127, 29, 29, 0.35)), url(${getPostBackgroundBySport(
    court.sport,
    `${court.id}-${session.id}`,
  )})`;
  const bookingMode = getBookingMode(postType);
  const totalSlots = slotSummary?.totalSlots ?? session.maxSlots;
  const openSlots = slotSummary?.openSlots ?? session.openSlots;
  const hostSlots = slotSummary?.hostSlots;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative min-h-[170px] bg-cover bg-center" style={{ backgroundImage }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge className="bg-white/90 text-slate-800">{getTypeLabel(postType)}</Badge>
          <Badge className="bg-white/90 text-slate-800">
            Còn {openSlots}/{totalSlots} slot
          </Badge>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="font-heading text-lg font-semibold text-ink">{court.subCourtName}</h3>
          <p className="text-sm text-slate-600">{court.complexName}</p>
          <p className="text-sm text-slate-600">{court.address}</p>
          {distanceLabel ? (
            <p className="mt-1 text-xs font-medium text-sky-700">Cách bạn khoảng {distanceLabel}</p>
          ) : null}
        </div>

        <div className="grid gap-1 text-sm text-slate-700">
          <p>
            <strong>Khung giờ:</strong> {formatSessionTime(session.startsAt)}
          </p>
          <p>
            <strong>Slot còn lại:</strong> {openSlots}/{totalSlots}
          </p>
          {postType === "pool" && hostSlots ? (
            <p>
              <strong>Bạn đã đăng ký trước:</strong> {hostSlots} slot
            </p>
          ) : null}
          <p>
            <strong>{postType === "pool" ? "Giá theo slot:" : "Giá thuê sân:"}</strong>{" "}
            {formatVnd(postType === "pool" ? session.slotPriceVnd : session.fullCourtPriceVnd)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/player/session/${session.id}`} state={detailState}>
            <Button variant="outline">Xem chi tiết</Button>
          </Link>
          <Link to={`/player/booking/${session.id}`} state={{ preferredMode: bookingMode, sourceType: postType }}>
            <Button disabled={openSlots <= 0}>{getPrimaryCta(postType)}</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
