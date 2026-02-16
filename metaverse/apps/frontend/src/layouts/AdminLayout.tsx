import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Image,
  Map,
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
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <nav className="w-64 bg-white shadow-sm flex-shrink-0 border-r border-gray-200">
        <div
          onClick={() => {
            navigate("/");
          }}
          className="cursor-pointer p-6 font-bold text-2xl text-center border-b border-gray-200 text-black"
        >
          MetaVerse Admin
        </div>
        <ul className="mt-6 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all
                  ${
                    isActive
                      ? "bg-[#9ef01a] text-black"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="p-6 absolute bottom-0 w-64">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-all"
          >
            <Settings size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 p-10 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};
