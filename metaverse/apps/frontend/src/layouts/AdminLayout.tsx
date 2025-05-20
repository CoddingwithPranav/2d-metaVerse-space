import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/elements', label: 'Elements' },
    { to: '/admin/map', label: 'Map' },
    { to: '/admin/manage-users', label: 'Manage Users' },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <nav className="w-64 bg-gray-800 text-white flex-shrink-0">
        <div className="p-6 font-bold text-xl border-b border-gray-700">
          Admin Panel
        </div>
        <ul className="mt-4">
          {navItems.map(({ to, label }) => (
            <li key={to} className="mb-2">
              <NavLink
                to={to}
                className={({ isActive }:any) =>
                  `block px-6 py-3 hover:bg-gray-700 ${
                    isActive ? 'bg-gray-900' : ''
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};