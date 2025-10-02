import React, { useEffect, useState } from 'react';
import { fetchAdminUsers } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  created_at: string;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(50);

  useEffect(() => {
    const getAdminUsers = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) {
        setError('Authentication token not found. Please log in as an administrator.');
        setLoading(false);
        return;
      }

      try {
        const usersData = await fetchAdminUsers(token, page, perPage);
        if (usersData.status === 'error') {
          setError(usersData.message || 'Failed to fetch admin users.');
        } else {
          setUsers(usersData.users);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching admin users.');
      } finally {
        setLoading(false);
      }
    };

    getAdminUsers();
  }, [page, perPage]);

  const handlePromote = (userId: string) => {
    console.log(`Promote user ${userId}`);
    // TODO: Implement API call to promote user
  };

  const handleDeactivate = (userId: string) => {
    console.log(`Deactivate user ${userId}`);
    // TODO: Implement API call to deactivate user
  };

  const handleDelete = (userId: string) => {
    console.log(`Delete user ${userId}`);
    // TODO: Implement API call to delete user
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading admin users...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin User Management</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        {users.length === 0 ? (
          <p>No users found or you do not have administrative privileges.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handlePromote(user.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Promote</button>
                    <button onClick={() => handleDeactivate(user.id)} className="text-yellow-600 hover:text-yellow-900 mr-4">Deactivate</button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Basic Pagination Controls */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 border rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">Page {page}</span>
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading || users.length < perPage}
            className="px-4 py-2 border rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
