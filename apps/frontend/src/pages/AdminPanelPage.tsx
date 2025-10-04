import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  createdAt: string;
}

interface Snippet {
  id: string;
  title: string;
  author: string;
  language: string;
  visibility: string;
}

interface Execution {
  id: string;
  snippetId: string;
  status: string;
  executedAt: string;
}

interface SystemLog {
  timestamp: string;
  level: string;
  message: string;
}

const AdminPanelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const { addToast } = useToast();

  const fetchData = async (endpoint: string, setData: Function) => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setData(data);
      } else {
        setError(true);
        addToast(`Failed to load data from ${endpoint}.`, 'error');
      }
    } catch (err) {
      setError(true);
      addToast(`Network error while fetching data from ${endpoint}.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchData('/api/admin/users', setUsers);
    } else if (activeTab === 'snippets') {
      fetchData('/api/admin/snippets', setSnippets);
    } else if (activeTab === 'executions') {
      fetchData('/api/admin/executions', setExecutions);
    } else if (activeTab === 'system') {
      fetchData('/api/admin/logs', setSystemLogs);
    }
  }, [activeTab]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-danger mb-4">Failed to load admin data.</p>
        <button
          onClick={() => fetchData(`/api/admin/${activeTab}`, activeTab === 'users' ? setUsers : activeTab === 'snippets' ? setSnippets : activeTab === 'executions' ? setExecutions : setSystemLogs)}
          className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover"
        >
          Retry
        </button>
      </div>
    );
  }

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
        {activeTab === 'users' && (
          <div className="bg-surface rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Username</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200">
                    <td className="p-4">{user.id}</td>
                    <td className="p-4">{user.username}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.role}</td>
                    <td className="p-4">{user.status}</td>
                    <td className="p-4">{new Date(user.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'snippets' && (
          <div className="bg-surface rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4 text-left">Author</th>
                  <th className="p-4 text-left">Language</th>
                  <th className="p-4 text-left">Visibility</th>
                </tr>
              </thead>
              <tbody>
                {snippets.map((snippet) => (
                  <tr key={snippet.id} className="border-b border-gray-200">
                    <td className="p-4">{snippet.id}</td>
                    <td className="p-4">{snippet.title}</td>
                    <td className="p-4">{snippet.author}</td>
                    <td className="p-4">{snippet.language}</td>
                    <td className="p-4">{snippet.visibility}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'executions' && (
          <div className="bg-surface rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Snippet ID</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Executed At</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((execution) => (
                  <tr key={execution.id} className="border-b border-gray-200">
                    <td className="p-4">{execution.id}</td>
                    <td className="p-4">{execution.snippetId}</td>
                    <td className="p-4">{execution.status}</td>
                    <td className="p-4">{new Date(execution.executedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'system' && (
          <div className="bg-surface rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 text-left">Timestamp</th>
                  <th className="p-4 text-left">Level</th>
                  <th className="p-4 text-left">Message</th>
                </tr>
              </thead>
              <tbody>
                {systemLogs.map((log, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-4">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4">{log.level}</td>
                    <td className="p-4">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanelPage;
