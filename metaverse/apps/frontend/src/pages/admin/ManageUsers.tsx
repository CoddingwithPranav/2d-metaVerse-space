import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import table components
import { Edit, Trash2 } from "lucide-react"; // Import icons

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const ManageUsersPage: React.FC = () => {
  // Dummy user data
  const dummyUsers: User[] = [
    { id: "1", name: "Alice Smith", email: "alice@example.com", role: "Admin" },
    { id: "2", name: "Bob Johnson", email: "bob@example.com", role: "Editor" },
    {
      id: "3",
      name: "Charlie Brown",
      email: "charlie@example.com",
      role: "Viewer",
    },
    {
      id: "4",
      name: "Diana Prince",
      email: "diana@example.com",
      role: "Editor",
    },
    { id: "5", name: "Eve Adams", email: "eve@example.com", role: "Viewer" },
  ];

  // Placeholder functions for user actions
  const handleEditUser = (userId: string) => {
    console.log(`Editing user: ${userId}`);
    // navigate(`/admin/manage-users/edit/${userId}`); // Example navigation
  };

  const handleDeleteUser = (userId: string) => {
    console.log(`Deleting user: ${userId}`);
    // Implement delete logic, e.g., show a confirmation dialog
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-950 p-4">
      <Card className="w-full max-w-4xl bg-slate-800 text-slate-50 border-slate-700 shadow-xl rounded-lg">
        <CardHeader className="pb-6 border-b border-slate-700">
          <CardTitle className="text-3xl font-extrabold text-center text-purple-400 flex items-center justify-center gap-3">
            Manage Users
          </CardTitle>
          <CardDescription className="text-center text-slate-400 mt-2">
            View, add, edit, or remove users from your system.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4 text-slate-200">
            Current Users
          </h3>

          {dummyUsers.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              No users found. Click "Add New User" to get started!
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-700">
              <Table>
                <TableHeader className="bg-slate-700">
                  <TableRow>
                    <TableHead className="w-[100px] text-slate-300">
                      ID
                    </TableHead>
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Role</TableHead>
                    <TableHead className="text-right text-slate-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="even:bg-slate-700/[0.3] hover:bg-slate-700/[0.5] transition-colors"
                    >
                      <TableCell className="font-medium text-slate-300">
                        {user.id}
                      </TableCell>
                      <TableCell className="text-slate-200">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-slate-200">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-slate-200">
                        {user.role}
                      </TableCell>
                      <TableCell className="text-right flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user.id)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit {user.name}</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete {user.name}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* <CardFooter className="pt-6 border-t border-slate-700 flex justify-end">
          <Button
            onClick={() => navigate('/admin/manage-users/add')}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
          >
            <UserPlus className="h-5 w-5" /> Add New User
          </Button>
        </CardFooter> */}
      </Card>
    </div>
  );
};
