import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { HomePage } from "../pages/home/HomePage";
import { Profile } from "../pages/user/Profile";
import { ElementsPage } from "../pages/admin/Elements";
import ProtectedRoute from "./ProtectedRoute";
import Authentication from "@/pages/auth/Login";
import MapDashboard from "@/pages/admin/Map";
import Arena from "@/pages/Space/Arena";
import UserSpace from "@/pages/user/userSpace";
import { MapList } from "@/pages/admin/MapList";
import { BackgroundsPage } from "@/pages/admin/Background";
import { AvatarsPage } from "@/pages/admin/Avatar";
import { AdminDashboard } from "@/pages/admin/Dashboard";

export const AppRoutes: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<Authentication />} />
      <Route element={<PublicLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/maps" element={<MapList />} />
        <Route path="/spaces" element={<UserSpace />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/arena/:spaceId" element={<Arena />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
              <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/background" element={<BackgroundsPage />} />
        <Route path="/admin/elements" element={<ElementsPage />} />
        <Route path="/admin/avatars" element={<AvatarsPage />} />
        <Route path="/admin/map" element={<MapDashboard />} />
      </Route>
    </Routes>
  </Router>
);
