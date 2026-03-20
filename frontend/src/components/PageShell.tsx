import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProfileStore } from "../store/profileStore";

interface PageShellProps {
  children: ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  const location = useLocation();
  const { userProfile } = useProfileStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">
            Community Guardian
          </h1>
          <p className="text-xs text-gray-500 mt-1">Digital Wellbeing</p>
        </div>
        <nav className="mt-8 px-4 space-y-1">
          <Link
            to="/alerts"
            className={`block px-4 py-3 rounded-lg font-medium transition ${
              isActive("/alerts")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            🚨 Alerts
          </Link>
          <Link
            to="/community"
            className={`block px-4 py-3 rounded-lg font-medium transition ${
              isActive("/community")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            👥 Community
          </Link>
          <Link
            to="/profile"
            className={`block px-4 py-3 rounded-lg font-medium transition ${
              isActive("/profile")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            👤 My Profile
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Community Guardian
            </h2>
            {userProfile ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
              >
                <span className="text-lg">👤</span>
                <span className="font-medium">{userProfile.name}</span>
              </Link>
            ) : (
              <Link
                to="/profile"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Profile
              </Link>
            )}
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
