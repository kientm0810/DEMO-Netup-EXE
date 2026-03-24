import type { AdminConfig, BookingMode, Session } from "../../entities";

export interface PriceBreakdown {
  basePriceVnd: number;
  floorFeeVnd: number;
  platformFeeVnd: number;
  totalPriceVnd: number;
}

export function calculatePriceBreakdown(params: {
  session: Session;
  adminConfig: AdminConfig;
  mode: BookingMode;
  seatsBooked: number;
}): PriceBreakdown {
  const { session, adminConfig, mode, seatsBooked } = params;

  const basePriceVnd =
    mode === "solo" ? session.slotPriceVnd * seatsBooked : session.fullCourtPriceVnd;
  const floorFeeVnd = mode === "solo" ? adminConfig.floorFeeVnd * seatsBooked : 0;
  const platformFeeVnd = Math.round(basePriceVnd * adminConfig.platformFeeRate);
  const totalPriceVnd = basePriceVnd + floorFeeVnd + platformFeeVnd;

  return {
    basePriceVnd,
    floorFeeVnd,
    platformFeeVnd,
    totalPriceVnd,
  };
}
