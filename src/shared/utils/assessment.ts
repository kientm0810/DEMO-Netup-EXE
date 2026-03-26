import type { AssessmentAnswerCode, PlayerAssessment, SkillLevel, SportType } from "../../entities";

export interface SportAssessmentOption {
  code: AssessmentAnswerCode;
  label: string;
  score: number;
}

export interface SportAssessmentQuestion {
  id: string;
  question: string;
  options: SportAssessmentOption[];
}

type QuestionBank = Record<SportType, SportAssessmentQuestion[]>;

const commonOptions = {
  short: { code: "A" as const, score: 1 },
  medium: { code: "B" as const, score: 2 },
  long: { code: "C" as const, score: 3 },
};

export const sportAssessmentQuestionBank: QuestionBank = {
  Badminton: [
    {
      id: "experience",
      question: "Thời gian chơi cầu lông của bạn?",
      options: [
        { ...commonOptions.short, label: "A. Dưới 1 năm" },
        { ...commonOptions.medium, label: "B. Từ 1 đến 3 năm" },
        { ...commonOptions.long, label: "C. Trên 3 năm" },
      ],
    },
    {
      id: "stamina",
      question: "Bạn chơi liên tục được bao lâu với tốc độ trung bình?",
      options: [
        { ...commonOptions.short, label: "A. Dưới 20 phút" },
        { ...commonOptions.medium, label: "B. Khoảng 20-40 phút" },
        { ...commonOptions.long, label: "C. Trên 40 phút" },
      ],
    },
    {
      id: "frequency",
      question: "Tần suất chơi cầu lông mỗi tuần?",
      options: [
        { ...commonOptions.short, label: "A. 1 buổi hoặc ít hơn" },
        { ...commonOptions.medium, label: "B. 2-3 buổi" },
        { ...commonOptions.long, label: "C. 4 buổi trở lên" },
      ],
    },
    {
      id: "tactical",
      question: "Khả năng di chuyển và đọc cầu của bạn?",
      options: [
        { ...commonOptions.short, label: "A. Còn chậm, hay hụt nhịp" },
        { ...commonOptions.medium, label: "B. Ổn định ở nhịp cơ bản" },
        { ...commonOptions.long, label: "C. Chủ động, kiểm soát nhịp tốt" },
      ],
    },
  ],
  Football: [
    {
      id: "experience",
      question: "Thời gian chơi bóng đá sân 5/7 của bạn?",
      options: [
        { ...commonOptions.short, label: "A. Dưới 1 năm" },
        { ...commonOptions.medium, label: "B. Từ 1 đến 3 năm" },
        { ...commonOptions.long, label: "C. Trên 3 năm" },
      ],
    },
    {
      id: "stamina",
      question: "Bạn giữ cường độ chạy tốt trong bao lâu?",
      options: [
        { ...commonOptions.short, label: "A. Dưới 15 phút" },
        { ...commonOptions.medium, label: "B. 15-30 phút" },
        { ...commonOptions.long, label: "C. Trên 30 phút" },
      ],
    },
    {
      id: "frequency",
      question: "Tần suất chơi bóng mỗi tuần?",
      options: [
        { ...commonOptions.short, label: "A. 1 trận hoặc ít hơn" },
        { ...commonOptions.medium, label: "B. 2-3 trận" },
        { ...commonOptions.long, label: "C. 4 trận trở lên" },
      ],
    },
    {
      id: "tactical",
      question: "Khả năng phối hợp chiến thuật và giữ vị trí?",
      options: [
        { ...commonOptions.short, label: "A. Chưa rõ vị trí, phối hợp còn ít" },
        { ...commonOptions.medium, label: "B. Giữ vị trí ổn, phối hợp cơ bản" },
        { ...commonOptions.long, label: "C. Phối hợp tốt, đọc tình huống nhanh" },
      ],
    },
  ],
  Tennis: [
    {
      id: "experience",
      question: "Thời gian chơi tennis của bạn?",
      options: [
        { ...commonOptions.short, label: "A. Dưới 1 năm" },
        { ...commonOptions.medium, label: "B. Từ 1 đến 3 năm" },
        { ...commonOptions.long, label: "C. Trên 3 năm" },
      ],
    },
    {
      id: "stamina",
      question: "Bạn duy trì rally liên tục được bao lâu?",
      options: [
        { ...commonOptions.short, label: "A. Dưới 15 phút" },
        { ...commonOptions.medium, label: "B. 15-30 phút" },
        { ...commonOptions.long, label: "C. Trên 30 phút" },
      ],
    },
    {
      id: "frequency",
      question: "Tần suất chơi tennis mỗi tuần?",
      options: [
        { ...commonOptions.short, label: "A. 1 buổi hoặc ít hơn" },
        { ...commonOptions.medium, label: "B. 2-3 buổi" },
        { ...commonOptions.long, label: "C. 4 buổi trở lên" },
      ],
    },
    {
      id: "tactical",
      question: "Khả năng kiểm soát bóng và chọn điểm rơi?",
      options: [
        { ...commonOptions.short, label: "A. Chủ yếu đưa bóng qua lưới" },
        { ...commonOptions.medium, label: "B. Có thể điều bóng cơ bản" },
        { ...commonOptions.long, label: "C. Điều bóng, tấn công có chủ đích" },
      ],
    },
  ],
};

export function buildDefaultAnswersForSport(sport: SportType): Record<string, AssessmentAnswerCode> {
  const questions = sportAssessmentQuestionBank[sport];
  return Object.fromEntries(questions.map((question) => [question.id, "A"])) as Record<
    string,
    AssessmentAnswerCode
  >;
}

export function calculateAssessmentScoreFromAnswers(
  sport: SportType,
  answers: Record<string, AssessmentAnswerCode>,
): number {
  const questions = sportAssessmentQuestionBank[sport];
  return questions.reduce((sum, question) => {
    const answerCode = answers[question.id] ?? "A";
    const option = question.options.find((item) => item.code === answerCode) ?? question.options[0];
    return sum + option.score;
  }, 0);
}

export function classifySkillLevelByQuestionnaire(
  totalScore: number,
  questionCount: number,
): SkillLevel {
  if (questionCount <= 0) {
    return "Beginner";
  }
  const average = totalScore / questionCount;
  if (average < 1.8) {
    return "Beginner";
  }
  if (average < 2.5) {
    return "Intermediate";
  }
  return "Advanced";
}

export function findAnswerLabel(
  sport: SportType,
  questionId: string,
  answerCode: AssessmentAnswerCode | undefined,
): string {
  if (!answerCode) {
    return "Chưa trả lời";
  }
  const question = sportAssessmentQuestionBank[sport].find((item) => item.id === questionId);
  const option = question?.options.find((item) => item.code === answerCode);
  return option?.label ?? "Chưa trả lời";
}

export function hasAssessmentForSport(
  assessments: Partial<Record<SportType, PlayerAssessment>> | undefined,
  sport: SportType,
): boolean {
  return Boolean(assessments?.[sport]);
}

