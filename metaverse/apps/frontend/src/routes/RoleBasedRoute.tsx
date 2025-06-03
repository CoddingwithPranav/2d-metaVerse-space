import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@/utils/Authhook';

interface RoleBasedRouteProps {
  roleInput: 'Admin' | 'User';
  children: JSX.Element;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ roleInput, children }) => {
  const { role, loading } = useAuth();

  if (loading) {
    return <div>Loading…</div>;
  }

  return role === roleInput ? children : <Navigate to="/" />;
};

export default RoleBasedRoute;
