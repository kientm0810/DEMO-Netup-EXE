import type { SkillLevel } from "../../entities";

export interface AssessmentScoreInput {
  sessionsPerWeek: number;
  experienceYears: number;
  staminaScore: number;
  techniqueScore: number;
  tacticalScore: number;
}

export function calculateAssessmentScore(input: AssessmentScoreInput): number {
  const qualityAvg = (input.staminaScore + input.techniqueScore + input.tacticalScore) / 3;
  const score =
    input.sessionsPerWeek * 8 + input.experienceYears * 9 + qualityAvg * 12 + input.sessionsPerWeek;
  return Math.round(score);
}

export function classifySkillLevel(score: number): SkillLevel {
  if (score < 55) return "Beginner";
  if (score < 88) return "Intermediate";
  return "Advanced";
}
