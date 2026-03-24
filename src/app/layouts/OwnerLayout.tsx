import { Outlet } from "react-router-dom";
import { PageTitle, RoleNav } from "../../shared/components";

export function OwnerLayout() {
  return (
    <section>
      <PageTitle
        title="Owner Space"
        description="Theo dõi doanh thu - occupancy, quản lý tài nguyên sân và check-in bằng booking code."
      />
      <RoleNav
        links={[
          { to: "/owner/dashboard", label: "Dashboard" },
          { to: "/owner/courts", label: "Court Management" },
          { to: "/owner/check-in", label: "Check-in" },
        ]}
      />
      <Outlet />
    </section>
  );
}
