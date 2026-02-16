import { Github, MessageSquare, Twitter } from "lucide-react";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="container mx-auto px-4 md:px-6 text-center text-gray-600">
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" className="hover:text-[#9ef01a] transition-colors">
            <Github size={24} />
          </a>
          <a href="#" className="hover:text-[#9ef01a] transition-colors">
            <Twitter size={24} />
          </a>
          <a href="#" className="hover:text-[#9ef01a] transition-colors">
            <MessageSquare size={24} />
          </a>
        </div>
        <p className="text-sm">
          &copy; {year} PixelVerse. All rights reserved. A new dimension of
          gaming.
        </p>
        <p className="text-xs mt-2">
          Crafted with <span className="text-red-500">&hearts;</span> for the
          Metaverse.
        </p>
      </div>
    </footer>
  );
};
