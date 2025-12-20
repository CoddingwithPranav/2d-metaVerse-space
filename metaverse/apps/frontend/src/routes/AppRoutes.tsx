import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { UserLayout } from "../layouts/UserLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { HomePage } from "../pages/home/HomePage";
import { Profile } from "../pages/user/Profile";
import { AdminDashboard } from "../pages/admin/Dashboard";
import { ElementsPage } from "../pages/admin/Elements";
import { ManageUsersPage } from "../pages/admin/ManageUsers";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";
import Authentication from "@/pages/auth/Login";
import MapDashboard from "@/pages/admin/Map";
import SpaceCreator from "@/pages/admin/SpaceCreator";
import Arena from "@/pages/Space/Arena";
import UserSpace from "@/pages/user/userSpace";
import { MapList } from "@/pages/admin/MapList";
import { BackgroundsPage } from "@/pages/admin/Background";
import { AvatarsPage } from "@/pages/admin/Avatar";

export const AppRoutes: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<Authentication />} />
      {/* public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/maps" element={<MapList />} />
        <Route path="/spaces" element={<UserSpace />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      {/* user routes */}
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/user/spaces" element={<UserSpace />} />
        <Route path="/user/arena/:spaceId" element={<Arena />} />
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
        <Route path="/admin/background" element={<BackgroundsPage />} />
        <Route path="/admin/elements" element={<ElementsPage />} />
        <Route path="/admin/avatars" element={<AvatarsPage />} />
        <Route path="/admin/map" element={<MapDashboard />} />
        <Route path="/admin/space" element={<SpaceCreator />} />
        <Route path="/admin/manage-users" element={<ManageUsersPage />} />
      </Route>
    </Routes>
  </Router>
);
