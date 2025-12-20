import React from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Users,
  Box,
  Rocket,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const recentActivities = [
    {
      id: 1,
      type: "User Registered",
      description: 'New user "John Doe" signed up.',
      time: "2 hours ago",
      status: "success",
    },
    {
      id: 2,
      type: "Element Added",
      description: 'New element "Sphere" was created.',
      time: "yesterday",
      status: "info",
    },
    {
      id: 3,
      type: "Map Update Failed",
      description: "Central region map data sync failed.",
      time: "3 days ago",
      status: "error",
    },
    {
      id: 4,
      type: "Admin Login",
      description: 'Admin "Jane Smith" logged in.',
      time: "5 days ago",
      status: "info",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle size={16} className="text-green-400 mr-2" />;
      case "error":
        return <AlertCircle size={16} className="text-red-400 mr-2" />;
      case "info":
      default:
        return <Activity size={16} className="text-blue-400 mr-2" />;
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-700">
      <h2 className="text-3xl font-extrabold mb-6 pb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 border-b border-slate-700">
        {" "}
        {/* Gradient title */}
        Dashboard Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-700 p-6 rounded-lg shadow-md flex items-center justify-between border border-slate-600 transition-transform duration-300 hover:scale-105 hover:border-purple-500">
          <div>
            <p className="text-sm font-medium text-slate-400">Total Users</p>
            <p className="text-3xl font-bold text-cyan-400">1,234</p>
          </div>
          <Users className="h-10 w-10 text-cyan-500 opacity-70" />
        </div>
        <div className="bg-slate-700 p-6 rounded-lg shadow-md flex items-center justify-between border border-slate-600 transition-transform duration-300 hover:scale-105 hover:border-cyan-500">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Elements Created
            </p>
            <p className="text-3xl font-bold text-purple-400">567</p>
          </div>
          <Box className="h-10 w-10 text-purple-500 opacity-70" />
        </div>
        <div className="bg-slate-700 p-6 rounded-lg shadow-md flex items-center justify-between border border-slate-600 transition-transform duration-300 hover:scale-105 hover:border-indigo-500">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Active Sessions
            </p>
            <p className="text-3xl font-bold text-indigo-400">89</p>
          </div>
          <Rocket className="h-10 w-10 text-indigo-500 opacity-70" />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-slate-200 mb-4 flex items-center">
          <Activity className="h-6 w-6 mr-2 text-purple-400" />
          Recent Activity
        </h3>
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-md overflow-hidden">
          <ul className="divide-y divide-slate-700">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <li
                  key={activity.id}
                  className="p-4 flex justify-between items-center hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="text-lg font-medium text-slate-100">
                        {activity.type}
                      </p>
                      <p className="text-sm text-slate-400">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {activity.time}
                  </span>
                </li>
              ))
            ) : (
              <li className="p-4 text-slate-500 text-center">
                No recent activity.
              </li>
            )}
          </ul>
        </div>
      </div>

      <button
        onClick={() => navigate("/admin/dashboard/add")}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
      >
        <PlusCircle className="h-6 w-6 mr-2" />
        Add New Activity
      </button>
    </div>
  );
};
