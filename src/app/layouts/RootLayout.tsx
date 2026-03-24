import { NavLink, Outlet } from "react-router-dom";
import { cn } from "../../shared/utils";

const entryLinks = [
  { to: "/player/discovery", label: "Người chơi" },
  { to: "/owner/dashboard", label: "Chủ sân" },
  { to: "/admin/dashboard", label: "Quản trị" },
  { to: "/assistant/chatbot", label: "Trợ lý AI" },
];

export function RootLayout() {
  return (
    <div className="relative min-h-screen bg-[#f3f4f6] text-ink">
      <div className="pointer-events-none absolute inset-0 bg-noise-grid bg-[size:24px_24px] opacity-40" />
      <div className="pointer-events-none absolute -top-28 right-0 h-[300px] w-[300px] rounded-full bg-red-300/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[280px] w-[280px] rounded-full bg-slate-300/35 blur-3xl" />

      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <NavLink to="/" className="font-heading text-xl font-semibold tracking-tight text-ink">
            NetUp MVP Demo
          </NavLink>
          <nav className="hidden items-center gap-2 sm:flex">
            {entryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition",
                    isActive ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
