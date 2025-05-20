import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ElementsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Elements</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Elements List</h3>
        {/* render elements list here */}
      </div>

      <button
        onClick={() => navigate('/admin/elements/add')}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Add New Element
      </button>
    </div>
  );
};