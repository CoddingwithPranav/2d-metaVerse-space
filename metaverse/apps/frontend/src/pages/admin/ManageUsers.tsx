import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ManageUsersPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">User List</h3>
        {/* render user list here, you could reuse your Users component */}
      </div>

      <button
        onClick={() => navigate('/admin/manage-users/add')}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Add New User
      </button>
    </div>
  );
};