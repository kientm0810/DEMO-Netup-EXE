import { Link } from "react-router-dom";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { Court, Session } from "../../entities";
import { Card } from "../../shared/components";
import { formatSessionTime } from "../../shared/utils";

interface DiscoveryMapItem {
  session: Session;
  court: Court;
  isRecommended: boolean;
}

interface DiscoveryMapProps {
  items: DiscoveryMapItem[];
}

export function DiscoveryMap({ items }: DiscoveryMapProps) {
  const groupedByCourt = items.reduce<Array<{ court: Court; sessions: DiscoveryMapItem[] }>>(
    (groups, item) => {
      const existing = groups.find((group) => group.court.id === item.court.id);
      if (existing) {
        existing.sessions.push(item);
      } else {
        groups.push({ court: item.court, sessions: [item] });
      }
      return groups;
    },
    [],
  );

  const center = groupedByCourt.length
    ? ([
        groupedByCourt.reduce((sum, group) => sum + group.court.latitude, 0) / groupedByCourt.length,
        groupedByCourt.reduce((sum, group) => sum + group.court.longitude, 0) / groupedByCourt.length,
      ] as [number, number])
    : ([10.8231, 106.6297] as [number, number]);

  return (
    <Card className="space-y-3">
      <h3 className="font-heading text-lg font-semibold text-ink">Map View - Vị trí sân giao lưu</h3>
      <div className="h-[420px] overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {groupedByCourt.map((group) => {
            const hasRecommended = group.sessions.some((sessionItem) => sessionItem.isRecommended);
            return (
              <CircleMarker
                key={group.court.id}
                center={[group.court.latitude, group.court.longitude]}
                radius={11}
                pathOptions={{
                  color: hasRecommended ? "#B4232A" : "#6B7280",
                  fillColor: hasRecommended ? "#E5484D" : "#9CA3AF",
                  fillOpacity: 0.85,
                }}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{group.court.name}</p>
                    <p>{group.court.district}</p>
                    <p>Có {group.sessions.length} session đang mở</p>
                    {group.sessions.slice(0, 2).map((sessionItem) => (
                      <div key={sessionItem.session.id}>
                        <Link to={`/player/session/${sessionItem.session.id}`} className="text-red-700 underline">
                          {sessionItem.session.title}
                        </Link>
                        <p className="text-xs text-slate-600">
                          {formatSessionTime(sessionItem.session.startsAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      <p className="text-xs text-slate-500">
        Marker đỏ là sân có session phù hợp level đánh giá hiện tại của bạn.
      </p>
    </Card>
  );
}
