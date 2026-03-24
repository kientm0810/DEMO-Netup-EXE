import { Outlet } from "react-router-dom";
import { PageTitle, RoleNav } from "../../shared/components";

export function OwnerLayout() {
  return (
    <section>
      <PageTitle
        title="Khu vực Chủ sân"
        description="Theo dõi doanh thu, quản lý tài nguyên sân và quét vào sân bằng mã đặt."
      />
      <RoleNav
        links={[
          { to: "/owner/dashboard", label: "Tổng quan" },
          { to: "/owner/courts", label: "Quản lý sân" },
          { to: "/owner/check-in", label: "Quét vào sân" },
        ]}
      />
      <Outlet />
    </section>
  );
}
