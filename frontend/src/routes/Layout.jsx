import { Outlet, NavLink, useLocation } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/70 backdrop-blur">
        <div className="relative bg-gradient-to-r from-brand-100/60 via-accent-100/50 to-transparent">
          <div className="bg-grid absolute inset-0 pointer-events-none opacity-30" />
          <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 shadow-card" />
              <div className="text-lg font-semibold tracking-tight">CreditSea</div>
            </div>
            <nav className="flex items-center gap-1 text-sm">
              <Tab to="/" label="Upload" active={pathname === "/"} />
              <Tab to="/reports" label="Reports" active={pathname.startsWith("/reports")} />
            </nav>
            <div className="hidden sm:block">
              <Button variant="ghost">Help</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="py-8 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} CreditSea — MERN Assignment
      </footer>
    </div>
  );
}

function Tab({ to, label, active }) {
  return (
    <NavLink
      to={to}
      className={`rounded-full px-3 py-1.5 transition ${
        active
          ? "bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-soft"
          : "hover:bg-brand-50"
      }`}
    >
      {label}
    </NavLink>
  );
}
