import type { PlayerAssessment, SportType } from "../entities";

export const playerAssessments: Record<string, Partial<Record<SportType, PlayerAssessment>>> = {
  "11111111-1111-1111-1111-111111111111": {
    Badminton: {
      playerId: "11111111-1111-1111-1111-111111111111",
      sport: "Badminton",
      answers: {
        experience: "B",
        stamina: "B",
        frequency: "B",
        tactical: "B",
      },
      totalScore: 8,
      calculatedLevel: "Intermediate",
      updatedAt: "2026-03-23T08:00:00.000Z",
    },
  },
};
