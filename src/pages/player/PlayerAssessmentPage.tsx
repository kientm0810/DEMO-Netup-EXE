import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { AssessmentAnswerCode, SportType } from "../../entities";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Badge, Button, Card, SportIconFilter } from "../../shared/components";
import {
  buildDefaultAnswersForSport,
  calculateAssessmentScoreFromAnswers,
  classifySkillLevelByQuestionnaire,
  formatVnd,
  getSkillLabel,
  getSportLabel,
  recommendSessions,
  sportAssessmentQuestionBank,
} from "../../shared/utils";

export function PlayerAssessmentPage() {
  const { state, currentPlayerId, savePlayerAssessment } = useAppStore();
  const location = useLocation();
  const preferredSportFromState = (location.state as { sport?: unknown } | null)?.sport;
  const initialSport =
    preferredSportFromState === "Badminton" ||
    preferredSportFromState === "Football" ||
    preferredSportFromState === "Tennis"
      ? preferredSportFromState
      : "Badminton";

  const [selectedSport, setSelectedSport] = useState<SportType>(initialSport);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const currentAssessment = state.playerAssessments[currentPlayerId]?.[selectedSport];
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswerCode>>(() =>
    currentAssessment?.answers ?? buildDefaultAnswersForSport(selectedSport),
  );

  const questions = sportAssessmentQuestionBank[selectedSport];

  const score = useMemo(
    () => calculateAssessmentScoreFromAnswers(selectedSport, answers),
    [selectedSport, answers],
  );
  const level = useMemo(
    () => classifySkillLevelByQuestionnaire(score, questions.length),
    [score, questions.length],
  );

  const recommendations = useMemo(() => {
    return recommendSessions({
      sessions: state.sessions,
      courts: state.courts,
      input: {
        sport: selectedSport,
        skillLevel: level,
        budgetPerSessionVnd: 220000,
        soloOnly: true,
      },
    }).slice(0, 3);
  }, [state.sessions, state.courts, selectedSport, level]);

  const handleSwitchSport = (sport: SportType) => {
    setSelectedSport(sport);
    setSaveMessage("");
    setAnswers(
      state.playerAssessments[currentPlayerId]?.[sport]?.answers ?? buildDefaultAnswersForSport(sport),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    await savePlayerAssessment({
      playerId: currentPlayerId,
      sport: selectedSport,
      answers,
      totalScore: score,
      calculatedLevel: level,
    });
    setSaving(false);
    setSaveMessage(`Đã lưu tự đánh giá môn ${getSportLabel(selectedSport)}.`);
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr] fade-up">
      <Card className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-ink">Biểu mẫu tự đánh giá theo từng môn</h2>
        <p className="text-sm text-slate-600">
          Hoàn thành bộ câu hỏi A/B/C cho từng môn để hệ thống chấm level ghép kèo chính xác hơn.
        </p>

        <SportIconFilter
          label="Chọn môn để đánh giá"
          value={selectedSport}
          options={["Badminton", "Football", "Tennis"]}
          onChange={(next) => handleSwitchSport(next as SportType)}
        />

        <div className="space-y-3">
          {questions.map((question) => (
            <div key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-ink">{question.question}</p>
              <div className="grid gap-2">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option.code;
                  return (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.code }))}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                        selected
                          ? "border-red-300 bg-red-50 text-red-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu tự đánh giá môn này"}
          </Button>
          <Link to="/player/discovery">
            <Button variant="outline">Quay lại khám phá</Button>
          </Link>
        </div>
        {saveMessage ? <p className="text-sm text-slate-700">{saveMessage}</p> : null}
      </Card>

      <Card className="space-y-4">
        <h3 className="font-heading text-lg font-semibold text-ink">Kết quả môn {getSportLabel(selectedSport)}</h3>
        <Badge tone="info">Điểm tổng: {score}</Badge>
        <Badge tone="success">Level đề xuất: {getSkillLabel(level)}</Badge>
        <p className="text-sm text-slate-600">
          Level này sẽ được dùng để kiểm tra điều kiện tạo pool và hiển thị khi người chơi khác xem chi tiết pool.
        </p>

        <div className="space-y-2">
          <h4 className="font-medium text-ink">Tình trạng đánh giá theo môn</h4>
          {(["Badminton", "Football", "Tennis"] as SportType[]).map((sport) => {
            const item = state.playerAssessments[currentPlayerId]?.[sport];
            return (
              <div key={sport} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-ink">{getSportLabel(sport)}</span>
                {item ? (
                  <Badge tone="success">{getSkillLabel(item.calculatedLevel)}</Badge>
                ) : (
                  <Badge tone="warning">Chưa đánh giá</Badge>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-ink">Top gợi ý cho level hiện tại</h4>
          {recommendations.length === 0 ? (
            <p className="text-sm text-slate-600">Chưa có session phù hợp với level hiện tại.</p>
          ) : (
            recommendations.map((item) => (
              <div key={item.session.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="font-medium text-ink">{item.court.subCourtName}</p>
                <p className="text-slate-600">
                  {item.court.complexName} • {item.court.district}
                </p>
                <p className="text-slate-700">{formatVnd(item.session.slotPriceVnd)}/slot</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </section>
  );
}
