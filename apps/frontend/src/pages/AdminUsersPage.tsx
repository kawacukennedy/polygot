import React, { useState, useEffect } from 'react';
import { fetchAdminUsers } from '../services/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('session_token');

      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAdminUsers(token);
        if (data.status === 'error') {
          setError(data.message);
        } else {
          setUsers(data);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  const handlePromote = (userId: string) => {
    console.log(`Promote user with ID: ${userId}`);
    // Implement API call to promote user
  };

  const handleDeactivate = (userId: string) => {
    console.log(`Deactivate user with ID: ${userId}`);
    // Implement API call to deactivate user
  };

  const handleDelete = (userId: string) => {
    if (window.confirm(`Are you sure you want to delete user ${userId}?`)) {
      console.log(`Delete user with ID: ${userId}`);
      // Implement API call to delete user
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin User Management</h1>
      <div className="bg-light-background dark:bg-dark-background shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handlePromote(user.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Promote</button>
                  <button onClick={() => handleDeactivate(user.id)} className="text-yellow-600 hover:text-yellow-900 mr-4">Deactivate</button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
