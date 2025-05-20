import useAuth from '@/utils/Authhook';
import React from 'react';

export const HomePage: React.FC = () =>{
  const { token, role, logout } = useAuth();

  if (!token) {
    return <p>Please log in to view the dashboard.</p>;
  }
  return (
     <div>
          <h1>Welcome to your Dashboard!</h1>
          <p>Your role: {role}</p>
          {role === 'admin' && (
            <button className="bg-red-500 text-white p-2 rounded">
              Go to Admin Panel
            </button>
          )}
          <button onClick={logout}>Logout</button>
        </div>
    );
  }


