import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@/utils/Authhook';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    // while we’re reading localStorage…
    return <div>Loading…</div>;
  }
  return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;