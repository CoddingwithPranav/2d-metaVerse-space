import React from "react";
import { Navbar } from "../components/ui/Navbar";
import { Outlet } from "react-router-dom";
import useAuth from "@/hooks/Authhook";

export const UserLayout: React.FC = () => {
  const { token } = useAuth();

  if (!token) {
    return <p>Please log in to view the dashboard.</p>;
  }
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
