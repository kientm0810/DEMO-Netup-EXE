import { divIcon, type DivIcon } from "leaflet";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";
import type { Court, Session } from "../../entities";
import { Card } from "../../shared/components";
import {
  buildGoogleMapsDirectionsUrl,
  calculateDistanceKm,
  formatDistanceLabel,
  formatSessionTime,
  type Coordinates,
} from "../../shared/utils";

interface DiscoveryMapItem {
  session: Session;
  court: Court;
  isRecommended: boolean;
}

interface DiscoveryMapProps {
  items: DiscoveryMapItem[];
  userLocation?: Coordinates | null;
  filteredSessionIds?: string[];
}

function createSlotMarkerIcon(occupied: number, max: number, highlighted: boolean): DivIcon {
  const ratio = max > 0 ? occupied / max : 0;
  const bgColor = ratio >= 0.8 ? "#991B1B" : ratio >= 0.5 ? "#B45309" : "#475569";
  const border = highlighted ? "2px solid #FCA5A5" : "2px solid #E5E7EB";

  return divIcon({
    className: "netup-slot-marker",
    html: `<div style="
      min-width:56px;
      height:30px;
      border-radius:999px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:12px;
      font-weight:700;
      color:white;
      background:${bgColor};
      border:${border};
      box-shadow:0 6px 16px rgba(15, 23, 42, 0.2);
      font-family:Manrope, sans-serif;
      ">${occupied}/${max}</div>`,
    iconSize: [56, 30],
    iconAnchor: [28, 15],
  });
}

function createUserMarkerIcon(): DivIcon {
  return divIcon({
    className: "netup-user-marker",
    html: `<div style="
      width:18px;
      height:18px;
      border-radius:999px;
      background:#2563EB;
      border:3px solid #DBEAFE;
      box-shadow:0 6px 14px rgba(37, 99, 235, 0.35);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const routeModes = [
  { label: "Xe máy/Ô tô", mode: "driving" as const },
  { label: "Đi bộ", mode: "walking" as const },
  { label: "Xe đạp", mode: "bicycling" as const },
  { label: "Công cộng", mode: "transit" as const },
];

export function DiscoveryMap({ items, userLocation = null, filteredSessionIds }: DiscoveryMapProps) {
  const groupedByCourt = items.reduce<
    Array<{
      court: Court;
      sessions: DiscoveryMapItem[];
      maxSlots: number;
      openSlots: number;
      occupiedSlots: number;
    }>
  >((groups, item) => {
    const existing = groups.find((group) => group.court.id === item.court.id);
    if (existing) {
      existing.sessions.push(item);
      existing.maxSlots += item.session.maxSlots;
      existing.openSlots += item.session.openSlots;
      existing.occupiedSlots = existing.maxSlots - existing.openSlots;
    } else {
      groups.push({
        court: item.court,
        sessions: [item],
        maxSlots: item.session.maxSlots,
        openSlots: item.session.openSlots,
        occupiedSlots: item.session.maxSlots - item.session.openSlots,
      });
    }
    return groups;
  }, []);

  const center = userLocation
    ? ([userLocation.latitude, userLocation.longitude] as [number, number])
    : groupedByCourt.length
      ? ([
          groupedByCourt.reduce((sum, group) => sum + group.court.latitude, 0) / groupedByCourt.length,
          groupedByCourt.reduce((sum, group) => sum + group.court.longitude, 0) / groupedByCourt.length,
        ] as [number, number])
      : ([10.8231, 106.6297] as [number, number]);

  return (
    <Card className="space-y-3">
      <h3 className="font-heading text-lg font-semibold text-ink">
        Bản đồ sân giao lưu (nhãn hiển thị số slot đã chiếm)
      </h3>
      <div className="h-[460px] overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userLocation ? (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={createUserMarkerIcon()}
            >
              <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
                Vị trí của bạn
              </Tooltip>
            </Marker>
          ) : null}

          {groupedByCourt.map((group) => {
            const hasRecommended = group.sessions.some((sessionItem) => sessionItem.isRecommended);
            const markerIcon = createSlotMarkerIcon(
              group.occupiedSlots,
              group.maxSlots,
              hasRecommended,
            );
            const destination = {
              latitude: group.court.latitude,
              longitude: group.court.longitude,
            };
            const distanceKm = userLocation ? calculateDistanceKm(userLocation, destination) : null;
            const distanceText = distanceKm !== null ? formatDistanceLabel(distanceKm) : null;

            return (
              <Marker
                key={group.court.id}
                position={[group.court.latitude, group.court.longitude]}
                icon={markerIcon}
              >
                <Tooltip direction="top" offset={[0, -16]} opacity={0.95}>
                  {group.court.name} - đã chiếm {group.occupiedSlots}/{group.maxSlots} slot
                  {distanceText ? ` - cách bạn ~${distanceText}` : ""}
                </Tooltip>
                <Popup>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">{group.court.name}</p>
                    <p>{group.court.district}</p>
                    {distanceText ? <p>Cách bạn: ~{distanceText} (ước lượng demo)</p> : null}
                    <p>Tình trạng tổng: {group.occupiedSlots}/{group.maxSlots} slot đã chiếm</p>
                    {userLocation ? (
                      <div className="flex flex-wrap gap-1">
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
                            className="rounded-full border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            {routeMode.label}
                          </a>
                        ))}
                      </div>
                    ) : null}
                    {group.sessions.slice(0, 3).map((sessionItem) => {
                      const occupied = sessionItem.session.maxSlots - sessionItem.session.openSlots;
                      return (
                        <div key={sessionItem.session.id} className="rounded-lg bg-slate-50 p-2">
                          <Link
                            to={`/player/session/${sessionItem.session.id}`}
                            state={{ filteredSessionIds }}
                            className="font-medium text-red-700 underline"
                          >
                            {sessionItem.session.title}
                          </Link>
                          <p className="text-xs text-slate-600">
                            {formatSessionTime(sessionItem.session.startsAt)}
                          </p>
                          <p className="text-xs text-slate-600">
                            Slot: đã chiếm {occupied}/{sessionItem.session.maxSlots}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      <p className="text-xs text-slate-500">
        Marker viền đỏ là điểm đang được AI đề xuất theo level hiện tại của người chơi. Nếu đã cấp quyền vị trí,
        popup sân sẽ có thêm khoảng cách ước lượng và nút mở đường đi Google Maps.
      </p>
    </Card>
  );
}
