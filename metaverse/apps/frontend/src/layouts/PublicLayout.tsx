import React from 'react';
import { Navbar } from '../components/ui/Navbar';
import { Outlet } from 'react-router-dom'; // Import Outlet

export const PublicLayout: React.FC = ({ children }:any) => (
  <div>
    <Navbar />
    <main className="p-4"><Outlet /></main>
  </div>
);