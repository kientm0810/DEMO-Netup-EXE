export type CourtStatus = "active" | "maintenance";

export interface Court {
  id: string;
  ownerId: string;
  name: string;
  complexName: string;
  subCourtName: string;
  sport: "Badminton" | "Football" | "Tennis";
  district: string;
  address: string;
  rating: number;
  isPickupEnabled: boolean;
  status: CourtStatus;
  amenities: string[];
  basePriceVnd: number;
  maxRentalDurationMinutes: number;
  latitude: number;
  longitude: number;
}
