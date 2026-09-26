import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/live", label: "Live" },
  { to: "/demonlist", label: "Demonlist" },
  { to: "/patch-notes", label: "Patch Notes" },
  { to: "/daily", label: "Daily/Weekly" },
  { to: "/updates", label: "Updates" },
  { to: "/leaks", label: "Leaks" },
  { to: "/upcoming", label: "Upcoming" },
];

function navClass({ isActive }) {
  return [
    "px-2.5 py-1.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
    isActive
      ? "border-signal-amber text-white"
      : "border-transparent text-slate-400 hover:text-slate-200 hover:border-ink-600",
  ].join(" ");
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-[3px] bg-signal-amber" />
      <header className="border-b border-white/10 bg-ink-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-5">
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <span className="h-6 w-6 bg-signal-amber flex items-center justify-center">
              <span className="h-2.5 w-2.5 bg-ink-950" />
            </span>
            <span className="font-display font-semibold text-lg tracking-tight text-white uppercase">
              GDNews
            </span>
          </NavLink>
          <nav className="flex items-center gap-3 overflow-x-auto scrollbar-thin">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <NavLink
            to="/is-colon-a-furry"
            className="ml-auto shrink-0 text-xs italic text-slate-600 hover:text-slate-400 transition-colors hidden md:block"
          >
            is Colon a furry?
          </NavLink>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 py-5 mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 justify-between">
          <span>GDNews is a fan-made news hub, not affiliated with RobTop Games.</span>
          <span>Demonlist data via Pointercrate. Level data via GDBrowser.</span>
        </div>
      </footer>
    </div>
  );
}
