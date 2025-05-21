import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const Navbar: React.FC = () => (
    <nav className="bg-blue-800 backdrop-blur-md border-b border-white/10 py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center text-xl font-bold text-white">
          <BookOpen className="mr-2 h-5 w-5 text-blue-400" />
          <span className="text-white">My Digital Space</span>
        </Link>
        <div className="space-x-6">
          <Link
            to="/home"
            className="text-gray-300 hover:text-white transition-colors duration-300
                       hover:bg-gray-900/50 px-4 py-2 rounded-full"
          >
            Home
          </Link>
          <Link
            to="/projects"
            className="text-gray-300 hover:text-white transition-colors duration-300
                       hover:bg-gray-900/50 px-4 py-2 rounded-full"
          >
            Projects
          </Link>
          <Link
            to="/blog"
            className="text-gray-300 hover:text-white transition-colors duration-300
                       hover:bg-gray-900/50 px-4 py-2 rounded-full"
          >
            Blog
          </Link>
          <Link
            to="/contact"
            className="text-gray-300 hover:text-white transition-colors duration-300
                       hover:bg-gray-900/50 px-4 py-2 rounded-full"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
);
