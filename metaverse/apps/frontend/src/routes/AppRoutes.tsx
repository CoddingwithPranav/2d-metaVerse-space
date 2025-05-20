import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { UserLayout } from '../layouts/UserLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { HomePage } from '../pages/home/HomePage';
import { UserDashboard } from '../pages/user/Dashboard';
import { Profile } from '../pages/user/Profile';
import { AdminDashboard } from '../pages/admin/Dashboard';
import { ElementsPage } from '../pages/admin/Elements';
import { ManageUsersPage } from '../pages/admin/ManageUsers';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';
import Authentication from '@/pages/auth/Login';
import MapDashboard from '@/pages/admin/Map';
import SpaceCreator from '@/pages/admin/SpaceCreator';
import Arena from '@/pages/Space/Arena';

export const AppRoutes: React.FC = () => (
  <Router>
    <Routes>
      {/* public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/login" element={<Authentication />} />
      </Route>

      {/* user routes */}
      <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/profile" element={<Profile />} />
      </Route>

      {/* admin routes */}
      <Route
        element={
          <ProtectedRoute>
            <RoleBasedRoute roleInput="Admin">
              <AdminLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/elements" element={<ElementsPage />} />
        <Route path="/admin/map" element={<MapDashboard />} />
        <Route path="/admin/space" element={<SpaceCreator />} />
        <Route path="/admin/manage-users" element={<ManageUsersPage />} />
      </Route>
    </Routes>
  </Router>
);