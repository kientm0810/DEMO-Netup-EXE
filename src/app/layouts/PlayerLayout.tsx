import { Outlet } from "react-router-dom";
import { PageTitle, RoleNav } from "../../shared/components";

export function PlayerLayout() {
  return (
    <section>
      <PageTitle
        title="Khu vực Người chơi"
        description="Khám phá sân/session, đặt kèo nhanh, xem QR thành công và quản lý lịch đặt của bạn."
      />
      <RoleNav
        links={[
          { to: "/player/discovery", label: "Khám phá" },
          { to: "/player/bookings", label: "Lịch đặt của tôi" },
          { to: "/player/assessment", label: "Tự đánh giá level" },
        ]}
      />
      <Outlet />
    </section>
  );
}
