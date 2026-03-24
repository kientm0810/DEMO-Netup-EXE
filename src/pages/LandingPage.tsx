import { Link } from "react-router-dom";
import { Badge, Button, Card } from "../shared/components";

const roleCards = [
  {
    title: "Player Demo",
    description:
      "Tìm sân/kèo giao lưu, chọn đặt lẻ hay đặt trọn sân, nhận QR thành công và quản lý booking cá nhân.",
    to: "/player/discovery",
    cta: "Vào Player flow",
  },
  {
    title: "Owner Demo",
    description:
      "Theo dõi doanh thu - occupancy, quản lý trạng thái sân, xử lý check-in nhanh bằng booking code mock.",
    to: "/owner/dashboard",
    cta: "Vào Owner flow",
  },
  {
    title: "Admin Demo",
    description:
      "Quan sát sức khỏe nền tảng và điều chỉnh các rule chính: platform fee, floor fee, matching radius.",
    to: "/admin/dashboard",
    cta: "Vào Admin flow",
  },
  {
    title: "Chatbot Demo",
    description:
      "Hỏi đáp tính năng NetUp theo context file và nhận gợi ý sân/session theo yêu cầu đầu vào.",
    to: "/assistant/chatbot",
    cta: "Mở chatbot",
  },
];

export function LandingPage() {
  return (
    <section className="space-y-7 fade-up">
      <div className="rounded-3xl bg-gradient-to-br from-[#272a31] via-[#4b1f28] to-[#7f1d1d] p-6 text-white shadow-float sm:p-9">
        <Badge className="bg-white/15 text-white">MVP Interface Demo</Badge>
        <h1 className="mt-4 max-w-3xl font-heading text-3xl font-semibold leading-tight sm:text-5xl">
          NetUp giúp người chơi đặt sân nhanh, ghép kèo gọn và check-in bằng QR.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-100 sm:text-base">
          Bản demo này mô phỏng luồng chính cho 3 role Player / Owner / Admin theo requirement:
          discovery, booking toggle, giá breakdown, dashboard vận hành và config hệ thống.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roleCards.map((card) => (
          <Card key={card.title} className="flex flex-col gap-4">
            <h2 className="font-heading text-xl font-semibold text-ink">{card.title}</h2>
            <p className="min-h-[88px] text-sm text-slate-600">{card.description}</p>
            <Link to={card.to}>
              <Button className="w-full">{card.cta}</Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
