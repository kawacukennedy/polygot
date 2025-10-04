import React, { useState } from 'react';

const AdminPanelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="flex border-b border-gray-300">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-muted'}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('snippets')}
          className={`px-6 py-3 ${activeTab === 'snippets' ? 'border-b-2 border-primary text-primary' : 'text-muted'}`}
        >
          Snippets
        </button>
        <button
          onClick={() => setActiveTab('executions')}
          className={`px-6 py-3 ${activeTab === 'executions' ? 'border-b-2 border-primary text-primary' : 'text-muted'}`}
        >
          Executions
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-6 py-3 ${activeTab === 'system' ? 'border-b-2 border-primary text-primary' : 'text-muted'}`}
        >
          System
        </button>
      </div>
      <div className="py-6">
        {activeTab === 'users' && <div>Users content</div>}
        {activeTab === 'snippets' && <div>Snippets content</div>}
        {activeTab === 'executions' && <div>Executions content</div>}
        {activeTab === 'system' && <div>System content</div>}
      </div>
    </div>
  );
};

export default AdminPanelPage;
