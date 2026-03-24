export const sportOptions = ["All", "Badminton", "Football", "Tennis"] as const;
export const skillOptions = ["All", "Beginner", "Intermediate", "Advanced"] as const;

export type SportFilterValue = (typeof sportOptions)[number];
export type SkillFilterValue = (typeof skillOptions)[number];

const sportLabels: Record<SportFilterValue, string> = {
  All: "Tất cả môn",
  Badminton: "Cầu lông",
  Football: "Bóng đá",
  Tennis: "Tennis",
};

const skillLabels: Record<SkillFilterValue, string> = {
  All: "Tất cả level",
  Beginner: "Mới bắt đầu",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
};

export function getSportLabel(value: string): string {
  return sportLabels[value as SportFilterValue] ?? value;
}

export function getSkillLabel(value: string): string {
  return skillLabels[value as SkillFilterValue] ?? value;
}
