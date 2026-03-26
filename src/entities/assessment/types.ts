import type { SkillLevel } from "../player/types";
import type { Court } from "../court/types";

export type AssessmentAnswerCode = "A" | "B" | "C";
export type SportType = Court["sport"];

export interface PlayerAssessment {
  playerId: string;
  sport: SportType;
  answers: Record<string, AssessmentAnswerCode>;
  totalScore: number;
  calculatedLevel: SkillLevel;
  updatedAt: string;
}
