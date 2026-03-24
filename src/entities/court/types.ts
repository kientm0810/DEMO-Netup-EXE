export type CourtStatus = "active" | "maintenance";

export interface Court {
  id: string;
  ownerId: string;
  name: string;
  sport: "Badminton" | "Football" | "Tennis";
  district: string;
  address: string;
  rating: number;
  isPickupEnabled: boolean;
  status: CourtStatus;
  amenities: string[];
  basePriceVnd: number;
  latitude: number;
  longitude: number;
}
