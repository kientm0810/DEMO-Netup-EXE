import { useMemo, useState } from "react";
import { useAppStore } from "../../app/providers/AppStoreProvider";
import { Badge, Button, Card, Input, Select } from "../../shared/components";
import { formatVnd, recommendSessions, type SessionRecommendation } from "../../shared/utils";
import { chatbotKnowledge, chatbotQuickPrompts } from "../../mocks";

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
    "Mình chưa có rule rõ cho câu này trong context demo. Bạn có thể hỏi về booking mode, check-in QR, admin config, map view hoặc self-assessment."
  );
}

export function AssistantChatbotPage() {
  const { state, currentPlayerAssessment } = useAppStore();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-bot",
      role: "bot",
      text: "Chào bạn, mình là NetUp Assistant (demo). Mình có thể giải thích tính năng web và gợi ý sân theo nhu cầu.",
    },
  ]);

  const [suggestionInput, setSuggestionInput] = useState({
    sport: "All",
    district: "",
    budget: currentPlayerAssessment?.budgetPerSessionVnd ?? 130000,
    soloOnly: true,
  });

  const districts = useMemo(() => Array.from(new Set(state.courts.map((court) => court.district))), [state.courts]);

  const pushMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const askQuestion = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    pushMessage(createMessage("user", trimmed));
    const normalized = trimmed.toLowerCase();
    const suggestionIntent =
      normalized.includes("goi y") ||
      normalized.includes("gợi ý") ||
      normalized.includes("de xuat") ||
      normalized.includes("đề xuất") ||
      normalized.includes("recommend") ||
      normalized.includes("suggest");

    if (suggestionIntent) {
      const sport =
        normalized.includes("badminton")
          ? "Badminton"
          : normalized.includes("football")
            ? "Football"
            : normalized.includes("tennis")
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
            "Mình đã đọc yêu cầu và chọn ra các session phù hợp nhất theo câu hỏi của bạn:",
            recommendations,
          ),
        );
      } else {
        pushMessage(
          createMessage(
            "bot",
            "Mình chưa tìm thấy session đúng tiêu chí trong câu hỏi này. Bạn thử đổi khu vực hoặc ngân sách.",
          ),
        );
      }
      setQuestion("");
      return;
    }

    const answer = findBestKnowledgeReply(trimmed);
    pushMessage(createMessage("bot", answer));
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
        `Gợi ý sân cho môn ${suggestionInput.sport}, ngân sách ${suggestionInput.budget.toLocaleString("vi-VN")}đ`,
      ),
    );

    if (recommendations.length === 0) {
      pushMessage(
        createMessage(
          "bot",
          "Mình chưa tìm được session phù hợp với tiêu chí hiện tại. Bạn thử nới khu vực hoặc tăng ngân sách nhé.",
        ),
      );
      return;
    }

    pushMessage(createMessage("bot", "Đây là các session mình đề xuất cho bạn:", recommendations));
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr] fade-up">
      <Card className="flex h-[640px] flex-col">
        <h2 className="font-heading text-xl font-semibold text-ink">NetUp Chatbot Demo</h2>
        <p className="mt-1 text-sm text-slate-600">
          Context file: <code>CHATBOT_CONTEXT.md</code> + knowledge base local trong mock data.
        </p>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
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
            placeholder="Hỏi về tính năng hoặc cách dùng NetUp..."
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

      <Card className="space-y-3">
        <h3 className="font-heading text-lg font-semibold text-ink">Quick Suggestion Panel</h3>
        <Select
          label="Sport"
          value={suggestionInput.sport}
          onChange={(event) => setSuggestionInput((prev) => ({ ...prev, sport: event.target.value }))}
          options={[
            { label: "All", value: "All" },
            { label: "Badminton", value: "Badminton" },
            { label: "Football", value: "Football" },
            { label: "Tennis", value: "Tennis" },
          ]}
        />
        <Select
          label="District"
          value={suggestionInput.district}
          onChange={(event) => setSuggestionInput((prev) => ({ ...prev, district: event.target.value }))}
          options={[{ label: "Any", value: "" }, ...districts.map((district) => ({ label: district, value: district }))]}
        />
        <Input
          label="Budget/session (VND)"
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
          <Badge tone="info">Áp dụng level: {currentPlayerAssessment.calculatedLevel}</Badge>
        ) : (
          <Badge tone="warning">Chưa có level, nên điền self-assessment trước</Badge>
        )}

        <Button onClick={suggestCourts}>Gợi ý sân</Button>
      </Card>
    </section>
  );
}
