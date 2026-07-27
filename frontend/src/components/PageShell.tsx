import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProfileStore } from "../store/profileStore";

interface PageShellProps {
  children: ReactNode;
}

/* ── SVG icons ── */
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const NAV = [
  { to: "/alerts",    label: "Alerts",     Icon: IconShield },
  { to: "/community", label: "Community",  Icon: IconUsers  },
  { to: "/profile",   label: "My Profile", Icon: IconUser   },
];

export default function PageShell({ children }: PageShellProps) {
  const location = useLocation();
  const { userProfile } = useProfileStore();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path || (path === "/alerts" && location.pathname === "/");

  const currentPage = NAV.find(n => isActive(n.to))?.label ?? "Community Guardian";

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* ── Sidebar ── */}
      <aside
        className="flex-shrink-0 bg-sidebar flex flex-col transition-all duration-200 sticky top-0 h-screen"
        style={{ width: collapsed ? 56 : 224 }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-2.5 pt-6 pb-5 ${collapsed ? "justify-center px-0" : "px-5"}`}>
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <p className="text-indigo-400 text-sm font-semibold leading-tight">Community</p>
              <p className="text-indigo-400 text-xs leading-tight">Guardian</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 space-y-0.5 ${collapsed ? "px-2" : "px-3"}`}>
          {NAV.map(({ to, label, Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={`flex items-center rounded-lg transition-colors ${
                  collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
                } ${
                  active
                    ? "bg-indigo-500/20 text-indigo-500"
                    : "text-slate-500 hover:text-white hover:bg-slate-700"
                }`}
                style={!active ? { "--tw-bg-opacity": 1 } as React.CSSProperties : undefined}
              >
                <span className={`flex-shrink-0 ${active ? "text-indigo-300" : "text-slate-400"}`}>
                  <Icon />
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className={`py-4 border-t border-white/8 ${collapsed ? "flex justify-center" : "px-3"}`}>
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex items-center gap-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-700 ${
              collapsed ? "p-2" : "px-3 py-2 w-full"
            }`}
          >
            {collapsed ? <IconChevronRight /> : (
              <>
                <IconChevronLeft />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-7 h-14 flex items-center justify-between">
            <p className="text-slate-500 text-sm font-medium">{currentPage}</p>

            {/* Avatar — always visible */}
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              {userProfile ? (
                <>
                  <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    {userProfile.name}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                    <IconUser />
                  </span>
                  <span className="text-sm text-slate-400 group-hover:text-slate-600">Set up profile</span>
                </>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
