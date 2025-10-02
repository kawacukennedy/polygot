
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // In a real application, you would fetch the user's role from an authentication context or API
    const userRole = localStorage.getItem('user_role'); // Placeholder for user role
    if (userRole === 'admin') {
      setIsAdmin(true);
    }
  }, []);

  return (
    <aside className="w-64 bg-light-background dark:bg-dark-background p-4 shadow-md hidden md:block">
      <nav className="flex flex-col space-y-2">
        <h2 className="text-lg font-bold mb-4">Menu</h2>
        <Link to="/dashboard" className="hover:text-light-accent dark:hover:text-dark-accent">Dashboard</Link>
        <Link to="/my-snippets" className="hover:text-light-accent dark:hover:text-dark-accent">My Snippets</Link>
        <Link to="/executions" className="hover:text-light-accent dark:hover:text-dark-accent">Executions</Link>
        <Link to="/analytics" className="hover:text-light-accent dark:hover:text-dark-accent">Analytics</Link>
        <Link to="/settings" className="hover:text-light-accent dark:hover:text-dark-accent">Settings</Link>

        {isAdmin && (
          <>
            <h2 className="text-lg font-bold mt-4 mb-2">Admin</h2>
            <Link to="/admin/users" className="hover:text-light-accent dark:hover:text-dark-accent">User Management</Link>
            <Link to="/admin/snippets" className="hover:text-light-accent dark:hover:text-dark-accent">Snippet Management</Link>
            <Link to="/admin/executions" className="hover:text-light-accent dark:hover:text-dark-accent">Execution Management</Link>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
