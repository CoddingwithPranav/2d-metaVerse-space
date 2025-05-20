import React from 'react';
import { useZustandAuth } from '../../store/authStore';

export const UserDashboard: React.FC = () => {
  const user = useZustandAuth(state => state.user);
  return (
    <div>
      <h2 className="text-xl font-bold">User Dashboard</h2>
      <p>Hello, {user?.email}</p>
    </div>
  );
};