import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // import useLocation
import { Home, Menu, X, UserCircle, LogIn, Map, Layers } from "lucide-react";
import useAuth from "@/hooks/Authhook";

export const Navbar: React.FC = () => {
  const { token, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Home", page: "home", icon: Home },
    { name: "Maps", page: "maps", icon: Map, onlyForLoggedIn: true },
    { name: "Spaces", page: "spaces", icon: Layers, onlyForLoggedIn: true },
    {
      name: "Profile",
      page: "profile",
      icon: UserCircle,
      onlyForLoggedIn: true,
    },
  ];

  const isActive = (page: string) => {
    if (page === "home")
      return location.pathname === "/" || location.pathname === "/home";
    return location.pathname.startsWith(`/${page}`);
  };

  const handleNavClick = (page: string) => {
    navigate(`/${page}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => handleNavClick("home")}
            className="text-2xl font-bold text-black hover:opacity-80 transition-opacity"
          >
            MetaVerse
          </button>

          <div className="hidden md:flex space-x-1 items-center">
            {navItems
              .filter((item) => !item.onlyForLoggedIn || token)
              .map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                    isActive(item.page)
                      ? "text-black bg-gray-100"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </button>
              ))}
            <button
              onClick={() => (token ? logout() : handleNavClick("login"))}
              className="ml-4 bg-[#9ef01a] hover:opacity-90 text-black px-6 py-2 rounded-lg font-semibold transition-all"
            >
              {token ? "Logout" : "Login"}
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-black focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems
              .filter((item) => !item.onlyForLoggedIn || token)
              .map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.page)}
                  className={`w-full text-left block px-3 py-2 rounded-lg text-base font-medium flex items-center space-x-3 transition-colors ${
                    isActive(item.page)
                      ? "bg-gray-100 text-black"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </button>
              ))}
          </div>
          <div className="px-4 pt-2 pb-4">
            <button
              onClick={() => (token ? logout() : handleNavClick("login"))}
              className="w-full bg-[#9ef01a] hover:opacity-90 text-black px-6 py-3 rounded-lg font-semibold transition-all"
            >
              {token ? "Logout" : "Login"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
