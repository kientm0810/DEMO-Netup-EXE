import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Badge, Button, Card, Input, Select } from "../../shared/components";
import {
  calculateAssessmentScore,
  classifySkillLevel,
  formatVnd,
  recommendSessions,
} from "../../shared/utils";

interface AssessmentFormState {
  preferredSport: "Badminton" | "Football" | "Tennis";
  preferredDistrict: string;
  budgetPerSessionVnd: number;
  sessionsPerWeek: number;
  experienceYears: number;
  staminaScore: number;
  techniqueScore: number;
  tacticalScore: number;
}

export function PlayerAssessmentPage() {
  const { state, currentPlayerId, currentPlayerAssessment, savePlayerAssessment } = useAppStore();

  const districtOptions = useMemo(
    () => Array.from(new Set(state.courts.map((court) => court.district))),
    [state.courts],
  );

  const [form, setForm] = useState<AssessmentFormState>(() => ({
    preferredSport: currentPlayerAssessment?.preferredSport ?? "Badminton",
    preferredDistrict: currentPlayerAssessment?.preferredDistrict ?? districtOptions[0] ?? "Thu Duc",
    budgetPerSessionVnd: currentPlayerAssessment?.budgetPerSessionVnd ?? 120000,
    sessionsPerWeek: currentPlayerAssessment?.sessionsPerWeek ?? 2,
    experienceYears: currentPlayerAssessment?.experienceYears ?? 1,
    staminaScore: currentPlayerAssessment?.staminaScore ?? 3,
    techniqueScore: currentPlayerAssessment?.techniqueScore ?? 3,
    tacticalScore: currentPlayerAssessment?.tacticalScore ?? 3,
  }));

  const score = calculateAssessmentScore(form);
  const level = classifySkillLevel(score);

  const recommendations = useMemo(() => {
    return recommendSessions({
      sessions: state.sessions,
      courts: state.courts,
      input: {
        sport: form.preferredSport,
        district: form.preferredDistrict,
        budgetPerSessionVnd: form.budgetPerSessionVnd,
        skillLevel: level,
        soloOnly: true,
      },
    }).slice(0, 3);
  }, [form, level, state.courts, state.sessions]);

  const handleSave = () => {
    savePlayerAssessment({
      playerId: currentPlayerId,
      preferredSport: form.preferredSport,
      preferredDistrict: form.preferredDistrict,
      budgetPerSessionVnd: form.budgetPerSessionVnd,
      sessionsPerWeek: form.sessionsPerWeek,
      experienceYears: form.experienceYears,
      staminaScore: form.staminaScore,
      techniqueScore: form.techniqueScore,
      tacticalScore: form.tacticalScore,
      calculatedLevel: level,
    });
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr] fade-up">
      <Card className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-ink">Self Assessment Form</h2>
        <p className="text-sm text-slate-600">
          Điền nhanh thông tin để phân cấp trình độ và nhận gợi ý sân/session phù hợp hơn.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Môn chính"
            value={form.preferredSport}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, preferredSport: event.target.value as AssessmentFormState["preferredSport"] }))
            }
            options={[
              { label: "Badminton", value: "Badminton" },
              { label: "Football", value: "Football" },
              { label: "Tennis", value: "Tennis" },
            ]}
          />

          <Select
            label="Khu vực ưu tiên"
            value={form.preferredDistrict}
            onChange={(event) => setForm((prev) => ({ ...prev, preferredDistrict: event.target.value }))}
            options={districtOptions.map((district) => ({ label: district, value: district }))}
          />

          <Input
            label="Ngân sách mỗi buổi (VND)"
            type="number"
            min={50000}
            step={10000}
            value={form.budgetPerSessionVnd}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, budgetPerSessionVnd: Number(event.target.value) || 0 }))
            }
          />

          <Input
            label="Số buổi chơi / tuần"
            type="number"
            min={1}
            max={14}
            value={form.sessionsPerWeek}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, sessionsPerWeek: Number(event.target.value) || 1 }))
            }
          />

          <Input
            label="Số năm kinh nghiệm"
            type="number"
            min={0}
            max={20}
            value={form.experienceYears}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, experienceYears: Number(event.target.value) || 0 }))
            }
          />

          <Input
            label="Stamina (1-5)"
            type="number"
            min={1}
            max={5}
            value={form.staminaScore}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, staminaScore: Number(event.target.value) || 1 }))
            }
          />

          <Input
            label="Technique (1-5)"
            type="number"
            min={1}
            max={5}
            value={form.techniqueScore}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, techniqueScore: Number(event.target.value) || 1 }))
            }
          />

          <Input
            label="Tactical (1-5)"
            type="number"
            min={1}
            max={5}
            value={form.tacticalScore}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, tacticalScore: Number(event.target.value) || 1 }))
            }
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave}>Lưu đánh giá</Button>
          <Link to="/player/discovery">
            <Button variant="outline">Xem gợi ý ở Discovery</Button>
          </Link>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="font-heading text-lg font-semibold text-ink">Kết quả phân cấp</h3>
        <Badge tone="info">Score: {score}</Badge>
        <Badge tone="success">Level đề xuất: {level}</Badge>
        <p className="text-sm text-slate-600">
          Level này được dùng để highlight session phù hợp trong Discovery và hỗ trợ chatbot tư vấn.
        </p>

        <div className="space-y-2">
          <h4 className="font-medium text-ink">Top gợi ý theo level</h4>
          {recommendations.length === 0 ? (
            <p className="text-sm text-slate-600">Chưa có session phù hợp với tiêu chí hiện tại.</p>
          ) : (
            recommendations.map((item) => (
              <div key={item.session.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="font-medium text-ink">{item.session.title}</p>
                <p className="text-slate-600">
                  {item.court.name} • {item.court.district}
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
