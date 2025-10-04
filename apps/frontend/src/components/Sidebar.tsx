import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, handleDrawerToggle }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'My Snippets', icon: '📝', path: '/my-snippets' },
    { label: 'Executions', icon: '▶️', path: '/executions' },
    { label: 'Analytics', icon: '📈', path: '/analytics' },
    { label: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  const sidebarContent = (
    <div className={`h-full bg-surface transition-all duration-200 ease-out ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <button onClick={() => setCollapsed(!collapsed)} className="focus:outline-none">
          {collapsed ? '▶️' : '◀️'}
        </button>
      </div>
      <nav className="mt-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className="flex items-center py-2 px-4 text-muted hover:bg-gray-100"
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 bg-black opacity-50 z-40 ${mobileOpen ? 'block' : 'hidden'}`}
          onClick={handleDrawerToggle}
        ></div>
        <div
          className={`fixed inset-y-0 left-0 bg-surface w-64 z-50 transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
