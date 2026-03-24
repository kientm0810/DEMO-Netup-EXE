import { Link } from "react-router-dom";
import { Badge, Button, Card, FeatureIcon } from "../shared/components";
import heroInvestor from "../shared/assets/hero-investor.svg";
import aiHighlight from "../shared/assets/ai-highlight.svg";

const roleCards = [
  {
    title: "Vai trò Người chơi",
    description: "Tìm sân, xem bản đồ slot, đặt ghép lẻ hoặc bao sân, check-in bằng QR.",
    to: "/player/discovery",
    cta: "Xem luồng Người chơi",
    icon: "player" as const,
  },
  {
    title: "Vai trò Chủ sân",
    description: "Theo dõi doanh thu, quản lý sân, kiểm tra booking code và check-in tại quầy.",
    to: "/owner/dashboard",
    cta: "Xem luồng Chủ sân",
    icon: "owner" as const,
  },
  {
    title: "Vai trò Quản trị",
    description: "Điều chỉnh phí nền tảng, phí sàn, bán kính ghép kèo và các quy tắc vận hành.",
    to: "/admin/dashboard",
    cta: "Xem luồng Quản trị",
    icon: "admin" as const,
  },
  {
    title: "Trợ lý AI NetUp",
    description: "Trả lời tính năng theo context và gợi ý sân phù hợp theo nhu cầu đầu vào.",
    to: "/assistant/chatbot",
    cta: "Mở chatbot AI",
    icon: "ai" as const,
  },
];

export function LandingPage() {
  return (
    <section className="space-y-7 fade-up">
      <div className="grid gap-5 rounded-3xl bg-gradient-to-br from-[#272a31] via-[#4b1f28] to-[#7f1d1d] p-6 text-white shadow-float lg:grid-cols-[1.1fr,0.9fr] sm:p-9">
        <div>
        <Badge className="bg-white/15 text-white">NetUp MVP - Bản demo cho nhà đầu tư</Badge>
          <h1 className="mt-4 max-w-3xl font-heading text-3xl font-semibold leading-tight sm:text-5xl">
            Đặt sân nhanh, hiển thị slot rõ ràng, và nổi bật tính năng AI ngay trên giao diện.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-100 sm:text-base">
            Mục tiêu của bản demo: nhà đầu tư chỉ cần xem lướt là hiểu giá trị sản phẩm, thấy được luồng
            sử dụng chính và điểm khác biệt của NetUp.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge className="bg-white/15 text-white">
              <span className="inline-flex items-center gap-1">
                <FeatureIcon name="map" className="h-4 w-4" />
                Bản đồ + tỷ lệ slot
              </span>
            </Badge>
            <Badge className="bg-white/15 text-white">
              <span className="inline-flex items-center gap-1">
                <FeatureIcon name="ai" className="h-4 w-4" />
                AI đề xuất sân
              </span>
            </Badge>
            <Badge className="bg-white/15 text-white">
              <span className="inline-flex items-center gap-1">
                <FeatureIcon name="slot" className="h-4 w-4" />
                QR + Check-in
              </span>
            </Badge>
          </div>
        </div>

        <img
          src={heroInvestor}
          alt="Minh họa bản đồ slot và AI của NetUp"
          className="h-full min-h-[280px] w-full rounded-2xl border border-white/20 object-cover"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roleCards.map((card) => (
          <Card key={card.title} className="flex flex-col gap-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <FeatureIcon name={card.icon} />
            </div>
            <h2 className="font-heading text-xl font-semibold text-ink">{card.title}</h2>
            <p className="min-h-[88px] text-sm text-slate-600">{card.description}</p>
            <Link to={card.to}>
              <Button className="w-full">{card.cta}</Button>
            </Link>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        <Card className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            <FeatureIcon name="spark" className="h-4 w-4" />
            Điểm khác biệt để pitch nhà đầu tư
          </div>
          <h3 className="font-heading text-2xl font-semibold text-ink">AI hiển thị giá trị ngay khi xem demo</h3>
          <p className="text-sm text-slate-600">
            Chatbot có context riêng, trả lời câu hỏi tính năng, và đề xuất session theo môn, khu vực, ngân sách,
            level người chơi. Đây là điểm khác biệt có thể trình bày nhanh trong buổi pitch.
          </p>
          <Link to="/assistant/chatbot">
            <Button>Mở Trợ lý AI</Button>
          </Link>
        </Card>

        <img
          src={aiHighlight}
          alt="Minh họa AI đề xuất sân theo input"
          className="h-full min-h-[260px] w-full rounded-2xl border border-slate-200 object-cover"
        />
      </div>
    </section>
  );
}
