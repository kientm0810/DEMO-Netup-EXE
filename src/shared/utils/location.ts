export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type TravelMode = "driving" | "walking" | "bicycling" | "transit";

const EARTH_RADIUS_KM = 6371;

function toRadians(degree: number): number {
  return (degree * Math.PI) / 180;
}

export function calculateDistanceKm(origin: Coordinates, destination: Coordinates): number {
  const latDiff = toRadians(destination.latitude - origin.latitude);
  const lngDiff = toRadians(destination.longitude - origin.longitude);
  const originLat = toRadians(origin.latitude);
  const destinationLat = toRadians(destination.latitude);

  const a =
    Math.sin(latDiff / 2) ** 2 +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(lngDiff / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function formatDistanceLabel(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

interface BuildDirectionsUrlParams {
  origin: Coordinates;
  destination: Coordinates;
  travelMode: TravelMode;
}

export function buildGoogleMapsDirectionsUrl(params: BuildDirectionsUrlParams): string {
  const query = new URLSearchParams({
    api: "1",
    origin: `${params.origin.latitude},${params.origin.longitude}`,
    destination: `${params.destination.latitude},${params.destination.longitude}`,
    travelmode: params.travelMode,
  });
  return `https://www.google.com/maps/dir/?${query.toString()}`;
}
