import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/live", label: "Live Now" },
  { to: "/demonlist", label: "Demonlist" },
  { to: "/updates", label: "Updates" },
  { to: "/leaks", label: "Leaks" },
  { to: "/upcoming", label: "Upcoming" },
];

function navClass({ isActive }) {
  return [
    "px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
    isActive
      ? "bg-white/10 text-white"
      : "text-slate-400 hover:text-white hover:bg-white/5",
  ].join(" ");
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-base-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <span className="h-8 w-8 rounded-lg bg-gd-gradient shadow-glow" />
            <span className="font-display font-bold text-lg tracking-tight text-white">
              GD<span className="gradient-text">Wire</span>
            </span>
          </NavLink>
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 justify-between">
          <span>GDWire is a fan-made news hub, not affiliated with RobTop Games.</span>
          <span>Demonlist data via Pointercrate.</span>
        </div>
      </footer>
    </div>
  );
}
