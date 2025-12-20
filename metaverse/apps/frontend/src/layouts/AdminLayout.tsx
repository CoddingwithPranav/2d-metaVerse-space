import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Image,
  Map,
  Rocket,
  Users,
  Settings,
  LayoutDashboard,
  Ghost,
} from "lucide-react";
import useAuth from "@/hooks/Authhook";

export const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/elements", label: "Elements", icon: Box },
    { to: "/admin/avatars", label: "Avatars", icon: Ghost },
    { to: "/admin/background", label: "Background", icon: Image },
    { to: "/admin/map", label: "Map", icon: Map },
    { to: "/admin/space", label: "Space", icon: Rocket },
    { to: "/admin/manage-users", label: "Manage Users", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <nav className="w-64 bg-slate-900 shadow-2xl flex-shrink-0 border-r border-slate-800">
        <div
          onClick={() => {
            navigate("/");
          }}
          className="cursor-pointer p-6 font-extrabold text-2xl text-center border-b border-slate-800 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400"
        >
          {" "}
          {/* Gradient title */}
          PixelVerse Admin
        </div>
        <ul className="mt-6 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-lg font-medium rounded-lg mx-3 transition-all duration-200 ease-in-out
                  ${
                    isActive
                      ? "bg-purple-600/30 text-white shadow-lg transform translate-x-1 border border-purple-500"
                      : "text-slate-300 hover:bg-slate-800 hover:text-purple-400"
                  }`
                }
              >
                <Icon className="h-6 w-6 mr-3" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="p-6 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-red-500 text-red-400 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Settings size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
};
