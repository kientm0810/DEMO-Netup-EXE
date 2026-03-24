import { Outlet } from "react-router-dom";
import { PageTitle, RoleNav } from "../../shared/components";

export function AdminLayout() {
  return (
    <section>
      <PageTitle
        title="Khu vực Quản trị"
        description="Điều phối quy tắc nền tảng: phí nền tảng, phí sàn, bán kính ghép kèo và cấu hình rủi ro."
      />
      <RoleNav
        links={[
          { to: "/admin/dashboard", label: "Bảng điều khiển" },
          { to: "/admin/config", label: "Cấu hình hệ thống" },
        ]}
      />
      <Outlet />
    </section>
  );
}
