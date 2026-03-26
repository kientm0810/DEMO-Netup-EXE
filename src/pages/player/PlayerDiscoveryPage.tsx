import { Link } from "react-router-dom";
import { Button, Card, FeatureIcon } from "../../shared/components";

const playerFlows = [
  {
    title: "Kèo chờ ghép",
    description:
      "Xem các post dạng pool theo slot trống, tham gia nhanh hoặc tự mở pool mới để chờ người khác vào.",
    to: "/player/pool-posts",
    cta: "Vào trang kèo chờ ghép",
    icon: "slot" as const,
  },
  {
    title: "Thuê nguyên sân",
    description:
      "Xem danh sách sân trước, bấm vào từng sân để mở các khung giờ và đặt thuê toàn bộ sân theo nhu cầu.",
    to: "/player/rent-courts",
    cta: "Vào trang thuê nguyên sân",
    icon: "map" as const,
  },
];

export function PlayerDiscoveryPage() {
  return (
    <section className="space-y-4 fade-up">
      <Card className="border-red-100 bg-gradient-to-r from-white to-red-50">
        <h2 className="font-heading text-2xl font-semibold text-ink">Chọn kiểu đặt sân</h2>
        <p className="mt-2 text-sm text-slate-700">
          Bạn có thể bắt đầu từ luồng <strong>Kèo chờ ghép</strong> hoặc luồng{" "}
          <strong>Thuê nguyên sân</strong>. Mỗi post tương ứng một khung giờ của sân.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {playerFlows.map((flow) => (
          <Card key={flow.to} className="space-y-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <FeatureIcon name={flow.icon} />
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold text-ink">{flow.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{flow.description}</p>
            </div>
            <Link to={flow.to}>
              <Button className="w-full">{flow.cta}</Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
