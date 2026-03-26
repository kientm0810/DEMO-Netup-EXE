import type { SkillLevel } from "../player/types";

export interface Session {
  id: string;
  courtId: string;
  title: string;
  startsAt: string;
  durationMinutes: number;
  openSlots: number;
  maxSlots: number;
  requiredSkillMin: SkillLevel;
  requiredSkillMax: SkillLevel;
  slotPriceVnd: number;
  fullCourtPriceVnd: number;
  isPeakHour: boolean;
  allowsSoloJoin: boolean;
}

export interface PoolPostConfig {
  sessionId: string;
  totalSlots: number;
  hostSlots: number;
  createdByPlayerId: string;
  createdAt: string;
}
