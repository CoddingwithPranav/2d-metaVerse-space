import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // import useLocation
import { Home, Menu, X, UserCircle, LogIn, Map, Layers } from 'lucide-react';
import useAuth from '@/utils/Authhook';

export const Navbar: React.FC = () => {
  const { token, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // get current location

  const navItems = [
    { name: 'Home', page: 'home', icon: Home },
    { name: 'Maps', page: 'maps', icon: Map },
    { name: 'Spaces', page: 'spaces', icon: Layers, onlyForLoggedIn: true },
    { name: 'Profile', page: 'profile', icon: UserCircle, onlyForLoggedIn: true },
  ];

  // Helper to check if nav item is active
  const isActive = (page: string) => {
    // Match root for home, otherwise check if path starts with /page
    if (page === 'home') return location.pathname === '/' || location.pathname === '/home';
    return location.pathname.startsWith(`/${page}`);
  };

  const handleNavClick = (page: string) => {
    navigate(`/${page}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          <button onClick={() => handleNavClick('home')} className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 hover:opacity-80 transition-opacity">
            PixelVerse
          </button>

          <div className="hidden md:flex space-x-2 items-center">
            {navItems.filter(item => !item.onlyForLoggedIn || token).map(item => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.page)}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                  isActive(item.page) ? 'text-cyan-400 bg-slate-800' : 'text-slate-300 hover:text-cyan-400'
                }`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </button>
            ))}
            <button
              onClick={() => handleNavClick('login')}
              className="animated-border-button rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 group ml-3"
            >
              <span className="inner-content px-5 py-2.5 text-white font-semibold flex items-center space-x-2">
                {token ? <span onClick={logout}>Logout</span> : <><LogIn size={20} /><span>Login / Sign Up</span></>}
              </span>
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white focus:outline-none">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-slate-800 shadow-xl rounded-b-lg pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.filter(item => !item.onlyForLoggedIn || token).map(item => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.page)}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3 transition-colors ${
                  isActive(item.page) ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
          <div className="px-4 pt-2">
            <button
              onClick={() => handleNavClick('login')}
              className="animated-border-button w-full rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <span className="inner-content w-full px-5 py-3 text-white font-semibold flex items-center justify-center space-x-2">
                {token ? <span onClick={logout}>Logout</span> : <><LogIn size={20} /><span>Login / Sign Up</span></>}
              </span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
