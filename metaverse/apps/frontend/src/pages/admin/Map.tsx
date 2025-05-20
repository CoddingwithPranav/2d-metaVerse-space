import React from 'react';
import { useNavigate } from 'react-router-dom';

export const MapPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Map</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Map Overview</h3>
        {/* render map here */}
      </div>

      <button
        onClick={() => navigate('/admin/map/add')}
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        Add New Map Item
      </button>
    </div>
  );
};