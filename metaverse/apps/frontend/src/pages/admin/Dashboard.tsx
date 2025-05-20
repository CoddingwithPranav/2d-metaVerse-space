import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      {/* List Section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Recent Activity</h3>
        {/* render your list of activities here */}
      </div>

      {/* Add New Button */}
      <button
        onClick={() => navigate('/admin/dashboard/add')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add New Activity
      </button>
    </div>
  );
};