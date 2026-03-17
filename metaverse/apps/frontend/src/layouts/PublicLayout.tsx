import React from "react";
import { Navbar } from "../components/ui/Navbar";
import { Outlet } from "react-router-dom";
export const PublicLayout: React.FC = () => (
  <div className="bg-white min-h-screen">
    <Navbar />
    <main>
      <Outlet />
    </main>
  </div>
);
