import { Outlet } from "react-router-dom";
import { PageTitle, RoleNav } from "../../shared/components";

export function PlayerLayout() {
  return (
    <section>
      <PageTitle
        title="Khu vực Người chơi"
        description="Chọn luồng kèo chờ ghép hoặc thuê nguyên sân, xem chi tiết slot và đặt nhanh theo nhu cầu."
      />
      <RoleNav
        links={[
          { to: "/player/discovery", label: "Chọn kiểu đặt sân" },
          { to: "/player/pool-posts", label: "Kèo chờ ghép" },
          { to: "/player/rent-courts", label: "Thuê nguyên sân" },
          { to: "/player/bookings", label: "Lịch đặt của tôi" },
          { to: "/player/assessment", label: "Tự đánh giá level" },
        ]}
      />
      <Outlet />
    </section>
  );
}
