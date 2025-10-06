import React, { useState, useEffect } from 'react';
import { getUsersAdmin } from '../services/api';

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
        const data = await getUsersAdmin() as any;
        setUsers(data);
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
    return <div className="text-[var(--color-text-secondary)]">Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-[var(--color-text-primary)]">Admin User Management</h1>
      <div className="bg-[var(--color-background)] shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-[var(--color-text-secondary)]/30">
          <thead className="bg-[var(--color-background)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-text-secondary)]/20">
            {users.map(user => (
              <tr key={user.id} className="text-[var(--color-text-primary)]">
                <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handlePromote(user.id)} className="text-[var(--color-accent)] hover:underline mr-4">Promote</button>
                  <button onClick={() => handleDeactivate(user.id)} className="text-yellow-600 hover:underline mr-4">Deactivate</button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:underline">Delete</button>
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
