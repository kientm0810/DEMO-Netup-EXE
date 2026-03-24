import { Outlet } from "react-router-dom";
import { PageTitle, RoleNav } from "../../shared/components";

export function AdminLayout() {
  return (
    <section>
      <PageTitle
        title="Admin Space"
        description="Điều phối platform fee, floor fee, matching radius và các rule vận hành mock."
      />
      <RoleNav
        links={[
          { to: "/admin/dashboard", label: "Dashboard" },
          { to: "/admin/config", label: "Config" },
        ]}
      />
      <Outlet />
    </section>
  );
}
