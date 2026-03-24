import type { SkillLevel } from "../player/types";

export interface PlayerAssessment {
  playerId: string;
  preferredSport: "Badminton" | "Football" | "Tennis";
  preferredDistrict: string;
  budgetPerSessionVnd: number;
  sessionsPerWeek: number;
  experienceYears: number;
  staminaScore: number;
  techniqueScore: number;
  tacticalScore: number;
  calculatedLevel: SkillLevel;
  updatedAt: string;
}
