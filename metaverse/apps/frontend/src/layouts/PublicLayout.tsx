import React from 'react';
import { Navbar } from '../components/ui/Navbar';
import { Outlet } from 'react-router-dom';
export const PublicLayout: React.FC = () => (
  <div>
    <Navbar />
    <main className="p-4"><Outlet /></main>
  </div>
);