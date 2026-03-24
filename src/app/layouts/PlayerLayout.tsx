import { Outlet } from "react-router-dom";
import { PageTitle, RoleNav } from "../../shared/components";

export function PlayerLayout() {
  return (
    <section>
      <PageTitle
        title="Player Space"
        description="Khám phá sân/session, đặt kèo nhanh, xem QR thành công và quản lý booking của bạn."
      />
      <RoleNav
        links={[
          { to: "/player/discovery", label: "Discovery" },
          { to: "/player/bookings", label: "My Bookings" },
          { to: "/player/assessment", label: "Self Assessment" },
        ]}
      />
      <Outlet />
    </section>
  );
}
