export type BookingMode = "solo" | "full_court";
export type BookingStatus = "confirmed" | "checked_in" | "completed" | "cancelled";

export interface Booking {
  id: string;
  bookingCode: string;
  sessionId: string;
  courtId: string;
  playerId: string;
  mode: BookingMode;
  seatsBooked: number;
  status: BookingStatus;
  createdAt: string;
  basePriceVnd: number;
  floorFeeVnd: number;
  platformFeeVnd: number;
  totalPriceVnd: number;
  qrPayload: string;
}

export interface BookingDraft {
  sessionId: string;
  playerId: string;
  mode: BookingMode;
  seatsBooked: number;
}
