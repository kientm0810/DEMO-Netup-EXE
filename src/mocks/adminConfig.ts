import type { AdminConfig } from "../entities";

export const adminConfig: AdminConfig = {
  platformFeeRate: 0.1,
  floorFeeVnd: 3000,
  matchingRadiusKm: 5,
  noShowStrikeLimit: 3,
  autoReleaseMinutes: 15,
  supportHotlineEnabled: true,
  depositPercent: 30,
};
