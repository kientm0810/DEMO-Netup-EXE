import type { Booking, Court, Session } from "../../entities";

export function findSessionById(sessions: Session[], sessionId: string): Session | undefined {
  return sessions.find((session) => session.id === sessionId);
}

export function findCourtById(courts: Court[], courtId: string): Court | undefined {
  return courts.find((court) => court.id === courtId);
}

export function findBookingByCode(bookings: Booking[], bookingCode: string): Booking | undefined {
  const code = bookingCode.trim().toUpperCase();
  return bookings.find((booking) => booking.bookingCode.toUpperCase() === code);
}
