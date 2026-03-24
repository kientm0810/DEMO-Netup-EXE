import { NavLink } from "react-router-dom";
import { cn } from "../utils/cn";

export interface RoleNavLink {
  to: string;
  label: string;
}

interface RoleNavProps {
  links: RoleNavLink[];
}

export function RoleNav({ links }: RoleNavProps) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition",
              isActive ? "bg-ink text-white" : "bg-white text-slate-600 hover:bg-slate-100",
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
