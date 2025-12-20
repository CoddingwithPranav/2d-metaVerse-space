import { Github, MessageSquare, Twitter } from "lucide-react";

// Footer Component (No changes)
export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="container mx-auto px-4 md:px-6 text-center text-slate-500">
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" className="hover:text-purple-400 transition-colors">
            <Github size={24} />
          </a>
          <a href="#" className="hover:text-cyan-400 transition-colors">
            <Twitter size={24} />
          </a>
          <a href="#" className="hover:text-purple-400 transition-colors">
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
