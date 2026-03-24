import type { OwnerAnalytics } from "../entities";

export const ownerAnalytics: OwnerAnalytics = {
  ownerId: "owner-001",
  revenue: {
    todayVnd: 3450000,
    weeklyVnd: 18200000,
    monthlyVnd: 73600000,
    pendingPayoutVnd: 8920000,
  },
  occupancy: {
    todayPercent: 71,
    weeklyPercent: 64,
    peakHours: "17:00 - 20:00",
  },
  trend: [
    { label: "Mon", revenueVnd: 2200000, occupancyPercent: 55 },
    { label: "Tue", revenueVnd: 2450000, occupancyPercent: 58 },
    { label: "Wed", revenueVnd: 2890000, occupancyPercent: 61 },
    { label: "Thu", revenueVnd: 3100000, occupancyPercent: 65 },
    { label: "Fri", revenueVnd: 4020000, occupancyPercent: 72 },
    { label: "Sat", revenueVnd: 5210000, occupancyPercent: 80 },
    { label: "Sun", revenueVnd: 4350000, occupancyPercent: 74 },
  ],
};
