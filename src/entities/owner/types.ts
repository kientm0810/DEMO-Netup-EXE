export interface OwnerAnalytics {
  ownerId: string;
  revenue: {
    todayVnd: number;
    weeklyVnd: number;
    monthlyVnd: number;
    pendingPayoutVnd: number;
  };
  occupancy: {
    todayPercent: number;
    weeklyPercent: number;
    peakHours: string;
  };
  trend: Array<{
    label: string;
    revenueVnd: number;
    occupancyPercent: number;
  }>;
}
