"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function UsersList() {
  const users = useQuery(api.users.getAllUsers);
  const deleteUser = useMutation(api.users.deleteUser);

  if (!users) {
    return <div className="text-gray-400">Loading users...</div>;
  }

  const handleDelete = async (userId: Id<"users">, name: string) => {
    try {
        if(!confirm(`Are you sure you want to delete ${name}?`)) return;
        
        await deleteUser({ userId });
        toast.success("User deleted successfully");
    } catch (error) {
        toast.error("Failed to delete user");
        console.error(error);
    }
  };

  return (
    <div className="w-full mt-6 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-900/50">
        <h3 className="font-semibold text-gray-200">System Users ({users.length})</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="bg-gray-950 text-gray-300 uppercase font-medium">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr 
                key={user._id} 
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-200">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    user.usersType === 'admin' 
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {user.usersType}
                  </span>
                </td>
                <td className="px-6 py-4">{user.type}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(user._id, user.name)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
