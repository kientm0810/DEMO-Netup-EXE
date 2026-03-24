export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Player {
  id: string;
  fullName: string;
  age: number;
  city: string;
  district: string;
  favoriteSports: string[];
  skillLevel: SkillLevel;
  joinedAt: string;
}
