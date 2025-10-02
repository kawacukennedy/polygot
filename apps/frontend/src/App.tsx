
import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SnippetsPage from './pages/SnippetsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import SnippetEditorPage from './pages/SnippetEditorPage';
import ExecuteSnippetPage from './pages/ExecuteSnippetPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSnippetsPage from './pages/AdminSnippetsPage';
import AdminExecutionsPage from './pages/AdminExecutionsPage';
import Notification from './components/Notification';
import './App.css';

function App() {
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  }, []);

  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-light-background dark:bg-dark-background">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/snippets" element={<SnippetsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/profile" element={<ProfilePage showNotification={showNotification} />} />
              <Route path="/snippets/new" element={<SnippetEditorPage showNotification={showNotification} />} />
              <Route path="/snippets/run/:id" element={<ExecuteSnippetPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/snippets" element={<AdminSnippetsPage />} />
              <Route path="/admin/executions" element={<AdminExecutionsPage />} />
              <Route path="/dashboard" element={<div>Dashboard Page</div>} />
              <Route path="/my-snippets" element={<div>My Snippets Page</div>} />
              <Route path="/executions" element={<div>Executions Page</div>} />
              <Route path="/analytics" element={<div>Analytics Page</div>} />
              <Route path="/settings" element={<div>Settings Page</div>} />
            </Routes>
          </main>
        </div>
        <Footer />
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={clearNotification}
          />
        )}
      </div>
    </Router>
  );
}

export default App;

