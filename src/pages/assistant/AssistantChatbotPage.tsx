import { useMemo, useState } from "react";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { chatbotKnowledge, chatbotQuickPrompts } from "../../mocks";
import { Badge, Button, Card, FeatureIcon, Input, Select } from "../../shared/components";
import {
  formatVnd,
  getSkillLabel,
  getSportLabel,
  recommendSessions,
  type SessionRecommendation,
} from "../../shared/utils";
import aiHighlight from "../../shared/assets/ai-highlight.svg";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  recommendations?: SessionRecommendation[];
}

function createMessage(role: ChatMessage["role"], text: string, recommendations?: SessionRecommendation[]): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    recommendations,
  };
}

function findBestKnowledgeReply(question: string): string {
  const normalized = question.toLowerCase();
  let bestScore = 0;
  let bestAnswer = "";

  for (const item of chatbotKnowledge) {
    const score = item.keywords.reduce((sum, keyword) => {
      return normalized.includes(keyword.toLowerCase()) ? sum + 1 : sum;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestAnswer = item.answer;
    }
  }

  return (
    bestAnswer ||
    "Mình chưa có quy tắc rõ cho câu này trong context demo. Bạn có thể hỏi về chế độ đặt sân, check-in QR, slot trên map hoặc cấu hình quản trị."
  );
}

export function AssistantChatbotPage() {
  const { state, currentPlayerAssessment } = useAppStore();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(
      "bot",
      "Chào bạn, mình là NetUp AI Assistant. Mình có thể giải thích tính năng và đề xuất sân dựa trên nhu cầu đầu vào.",
    ),
  ]);

  const [suggestionInput, setSuggestionInput] = useState({
    sport: "All",
    district: "",
    budget: currentPlayerAssessment?.budgetPerSessionVnd ?? 130000,
    soloOnly: true,
  });

  const districts = useMemo(
    () => Array.from(new Set(state.courts.map((court) => court.district))),
    [state.courts],
  );

  const pushMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const askQuestion = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    pushMessage(createMessage("user", trimmed));
    const normalized = trimmed.toLowerCase();
    const suggestionIntent =
      normalized.includes("gợi ý") ||
      normalized.includes("goi y") ||
      normalized.includes("đề xuất") ||
      normalized.includes("de xuat") ||
      normalized.includes("recommend") ||
      normalized.includes("suggest");

    if (suggestionIntent) {
      const sport =
        normalized.includes("cầu lông") ||
        normalized.includes("cau long") ||
        normalized.includes("badminton")
          ? "Badminton"
          : normalized.includes("bóng đá") ||
              normalized.includes("bong da") ||
              normalized.includes("football")
            ? "Football"
            : normalized.includes("quần vợt") ||
                normalized.includes("quan vot") ||
                normalized.includes("tennis")
              ? "Tennis"
              : "All";
      const matchedDistrict =
        districts.find((district) => normalized.includes(district.toLowerCase())) ?? undefined;
      const matchK = normalized.match(/(\d{2,3})\s*k/);
      const budget = matchK ? Number(matchK[1]) * 1000 : suggestionInput.budget;

      const recommendations = recommendSessions({
        sessions: state.sessions,
        courts: state.courts,
        input: {
          sport,
          district: matchedDistrict,
          budgetPerSessionVnd: budget,
          skillLevel: currentPlayerAssessment?.calculatedLevel,
          soloOnly: true,
        },
      }).slice(0, 3);

      if (recommendations.length > 0) {
        pushMessage(
          createMessage(
            "bot",
            "Mình đã phân tích nhu cầu và chọn ra các session phù hợp nhất:",
            recommendations,
          ),
        );
      } else {
        pushMessage(
          createMessage(
            "bot",
            "Mình chưa tìm thấy session phù hợp với yêu cầu hiện tại. Bạn thử nới khu vực hoặc tăng ngân sách nhé.",
          ),
        );
      }
      setQuestion("");
      return;
    }

    pushMessage(createMessage("bot", findBestKnowledgeReply(trimmed)));
    setQuestion("");
  };

  const suggestCourts = () => {
    const recommendations = recommendSessions({
      sessions: state.sessions,
      courts: state.courts,
      input: {
        sport: suggestionInput.sport as "All" | "Badminton" | "Football" | "Tennis",
        district: suggestionInput.district || undefined,
        budgetPerSessionVnd: suggestionInput.budget,
        skillLevel: currentPlayerAssessment?.calculatedLevel,
        soloOnly: suggestionInput.soloOnly,
      },
    }).slice(0, 3);

    pushMessage(
      createMessage(
        "user",
        `Nhờ AI gợi ý sân cho môn ${getSportLabel(suggestionInput.sport)}, ngân sách ${suggestionInput.budget.toLocaleString("vi-VN")}đ`,
      ),
    );

    if (recommendations.length === 0) {
      pushMessage(
        createMessage(
          "bot",
          "Mình chưa tìm được session phù hợp. Bạn có thể đổi quận hoặc tăng ngân sách để AI lọc tốt hơn.",
        ),
      );
      return;
    }

    pushMessage(createMessage("bot", "Đây là các session AI đề xuất cho bạn:", recommendations));
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr] fade-up">
      <Card className="flex h-[680px] flex-col">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-xl font-semibold text-ink">Demo Trợ lý AI NetUp</h2>
            <p className="mt-1 text-sm text-slate-600">
              Nguồn context: <code>CHATBOT_CONTEXT.md</code> + dữ liệu mock thực tế.
            </p>
          </div>
          <Badge tone="success">
            <span className="inline-flex items-center gap-1">
              <FeatureIcon name="ai" className="h-4 w-4" />
              Điểm nhấn AI cho nhà đầu tư
            </span>
          </Badge>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                message.role === "user" ? "ml-auto bg-ink text-white" : "bg-white text-slate-700"
              }`}
            >
              <p>{message.text}</p>
              {message.recommendations ? (
                <div className="mt-2 space-y-2">
                  {message.recommendations.map((item) => (
                    <div key={item.session.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <p className="font-medium text-ink">{item.session.title}</p>
                      <p>
                        {item.court.name} • {item.court.district}
                      </p>
                      <p>{formatVnd(item.session.slotPriceVnd)}/slot</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          <Input
            placeholder="Hỏi về tính năng NetUp hoặc yêu cầu AI gợi ý sân..."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                askQuestion(question);
              }
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => askQuestion(question)}>Gửi câu hỏi</Button>
            {chatbotQuickPrompts.map((prompt) => (
              <Button key={prompt} variant="outline" onClick={() => askQuestion(prompt)}>
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <img
          src={aiHighlight}
          alt="Minh họa AI gợi ý sân theo nhu cầu đầu vào"
          className="w-full rounded-2xl border border-slate-200"
        />

        <Card className="space-y-3">
          <h3 className="font-heading text-lg font-semibold text-ink">Bảng nhập nhanh để AI gợi ý</h3>
          <Select
            label="Môn thể thao"
            value={suggestionInput.sport}
            onChange={(event) => setSuggestionInput((prev) => ({ ...prev, sport: event.target.value }))}
            options={[
              { label: getSportLabel("All"), value: "All" },
              { label: getSportLabel("Badminton"), value: "Badminton" },
              { label: getSportLabel("Football"), value: "Football" },
              { label: getSportLabel("Tennis"), value: "Tennis" },
            ]}
          />
          <Select
            label="Khu vực"
            value={suggestionInput.district}
            onChange={(event) => setSuggestionInput((prev) => ({ ...prev, district: event.target.value }))}
            options={[
              { label: "Tất cả khu vực", value: "" },
              ...districts.map((district) => ({ label: district, value: district })),
            ]}
          />
          <Input
            label="Ngân sách mỗi session (VND)"
            type="number"
            min={50000}
            step={10000}
            value={suggestionInput.budget}
            onChange={(event) =>
              setSuggestionInput((prev) => ({ ...prev, budget: Number(event.target.value) || 0 }))
            }
          />
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-ink"
              checked={suggestionInput.soloOnly}
              onChange={(event) =>
                setSuggestionInput((prev) => ({ ...prev, soloOnly: event.target.checked }))
              }
            />
            Chỉ gợi ý session có ghép lẻ
          </label>
          {currentPlayerAssessment ? (
            <Badge tone="info">
              AI đang áp dụng level: {getSkillLabel(currentPlayerAssessment.calculatedLevel)}
            </Badge>
          ) : (
            <Badge tone="warning">Bạn chưa có level, nên vào phần tự đánh giá trước</Badge>
          )}
          <Button onClick={suggestCourts}>AI gợi ý sân ngay</Button>
        </Card>
      </div>
    </section>
  );
}
