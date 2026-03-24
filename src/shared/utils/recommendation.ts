import type { Court, Session, SkillLevel } from "../../entities";

export interface RecommendationInput {
  sport?: "Badminton" | "Football" | "Tennis" | "All";
  skillLevel?: SkillLevel;
  district?: string;
  budgetPerSessionVnd?: number;
  soloOnly?: boolean;
}

export interface SessionRecommendation {
  session: Session;
  court: Court;
  score: number;
  reasons: string[];
}

const skillRank: Record<SkillLevel, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

export function isSessionSkillCompatible(session: Session, level: SkillLevel): boolean {
  const sessionMin = skillRank[session.requiredSkillMin];
  const sessionMax = skillRank[session.requiredSkillMax];
  const player = skillRank[level];
  return player >= sessionMin && player <= sessionMax;
}

export function recommendSessions(params: {
  sessions: Session[];
  courts: Court[];
  input: RecommendationInput;
}): SessionRecommendation[] {
  const { sessions, courts, input } = params;

  const recommendations: SessionRecommendation[] = [];

  for (const session of sessions) {
    const court = courts.find((item) => item.id === session.courtId);
    if (!court || session.openSlots <= 0) {
      continue;
    }
    if (input.soloOnly && !session.allowsSoloJoin) {
      continue;
    }

    let score = 0;
    const reasons: string[] = [];

    if (input.sport && input.sport !== "All") {
      if (court.sport === input.sport) {
        score += 30;
        reasons.push(`Đúng môn ${input.sport}`);
      } else {
        score -= 25;
      }
    }

    if (input.skillLevel) {
      if (isSessionSkillCompatible(session, input.skillLevel)) {
        score += 25;
        reasons.push(`Phù hợp level ${input.skillLevel}`);
      } else {
        score -= 35;
      }
    }

    if (input.district && input.district.trim().length > 0) {
      if (court.district.toLowerCase() === input.district.trim().toLowerCase()) {
        score += 20;
        reasons.push(`Đúng khu vực ${court.district}`);
      } else {
        score -= 8;
      }
    }

    if (input.budgetPerSessionVnd && input.budgetPerSessionVnd > 0) {
      if (session.slotPriceVnd <= input.budgetPerSessionVnd) {
        score += 18;
        reasons.push(`Trong ngân sách ${input.budgetPerSessionVnd.toLocaleString("vi-VN")}đ`);
      } else {
        score -= 16;
      }
    }

    if (session.isPeakHour) {
      score += 4;
    }
    if (session.allowsSoloJoin) {
      score += 3;
    }

    if (score > -20) {
      recommendations.push({
        session,
        court,
        score,
        reasons,
      });
    }
  }

  return recommendations.sort((a, b) => b.score - a.score);
}
