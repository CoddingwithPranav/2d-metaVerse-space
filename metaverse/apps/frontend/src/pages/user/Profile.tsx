import React from 'react';
import { useZustandAuth } from '../../store/authStore';

export const Profile: React.FC = () => {
  const user = useZustandAuth(state => state.user);
  return (
    <div>
      <h2 className="text-xl font-bold">Profile</h2>
      <p>Email: {user?.email}</p>
    </div>
  );
};