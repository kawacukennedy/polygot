
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, toggleMobileMenu }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // In a real application, you would fetch the user's role from an authentication context or API
    const userRole = localStorage.getItem('user_role'); // Placeholder for user role
    if (userRole === 'admin') {
      setIsAdmin(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 bg-light-background dark:bg-dark-background shadow-lg transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'} md:block flex-shrink-0`}
    >
      <div className="flex items-center justify-between p-4 h-16">
        {!isCollapsed && <h2 className="text-lg font-bold">Menu</h2>}
        <button onClick={toggleSidebar} className="p-2 rounded-full focus:outline-none hover:bg-light-text_secondary/20 dark:hover:bg-dark-text_secondary/20 hidden md:block">
          {isCollapsed ? '▶' : '◀'}
        </button>
        <button onClick={toggleMobileMenu} className="md:hidden p-2 rounded-full focus:outline-none hover:bg-light-text_secondary/20 dark:hover:bg-dark-text_secondary/20">
          X
        </button>
      </div>
      <nav className="flex flex-col space-y-2 p-4">
        <Link to="/dashboard" className="flex items-center p-2 rounded-md hover:bg-light-text_secondary/10 dark:hover:bg-dark-text_secondary/10 transition-colors duration-200">
          <span className="mr-3">📊</span> {!isCollapsed && 'Dashboard'}
        </Link>
        <Link to="/my-snippets" className="flex items-center p-2 rounded-md hover:bg-light-text_secondary/10 dark:hover:bg-dark-text_secondary/10 transition-colors duration-200">
          <span className="mr-3">📄</span> {!isCollapsed && 'My Snippets'}
        </Link>
        <Link to="/executions" className="flex items-center p-2 rounded-md hover:bg-light-text_secondary/10 dark:hover:bg-dark-text_secondary/10 transition-colors duration-200">
          <span className="mr-3">🚀</span> {!isCollapsed && 'Executions'}
        </Link>
        <Link to="/analytics" className="flex items-center p-2 rounded-md hover:bg-light-text_secondary/10 dark:hover:bg-dark-text_secondary/10 transition-colors duration-200">
          <span className="mr-3">📈</span> {!isCollapsed && 'Analytics'}
        </Link>
        <Link to="/settings" className="flex items-center p-2 rounded-md hover:bg-light-text_secondary/10 dark:hover:bg-dark-text_secondary/10 transition-colors duration-200">
          <span className="mr-3">⚙️</span> {!isCollapsed && 'Settings'}
        </Link>

        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-light-text_secondary/20 dark:border-dark-text_secondary/20">
            {!isCollapsed && <h2 className="text-lg font-bold mb-2">Admin</h2>}
            <Link to="/admin/users" className="flex items-center p-2 rounded-md hover:bg-light-text_secondary/10 dark:hover:bg-dark-text_secondary/10 transition-colors duration-200">
              <span className="mr-3">👥</span> {!isCollapsed && 'User Management'}
            </Link>
            <Link to="/admin/snippets" className="flex items-center p-2 rounded-md hover:bg-light-text_secondary/10 dark:hover:bg-dark-text_secondary/10 transition-colors duration-200">
              <span className="mr-3">📝</span> {!isCollapsed && 'Snippet Management'}
            </Link>
            <Link to="/admin/executions" className="flex items-center p-2 rounded-md hover:bg-light-text_secondary/10 dark:hover:bg-dark-text_secondary/10 transition-colors duration-200">
              <span className="mr-3">⚙️</span> {!isCollapsed && 'Execution Management'}
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
