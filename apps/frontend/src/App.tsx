import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import pages
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SnippetEditorPage from './pages/SnippetEditorPage';
import SnippetViewPage from './pages/SnippetViewPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanelPage from './pages/AdminPanelPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import WelcomePage from './pages/WelcomePage';
import SearchPage from './pages/SearchPage'; // Import SearchPage

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="bg-bg min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/snippets/new" element={<SnippetEditorPage />} />
            <Route path="/snippets/:id/edit" element={<SnippetEditorPage />} />
            <Route path="/snippets/:id" element={<SnippetViewPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPanelPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/search" element={<SearchPage />} /> {/* Add route for SearchPage */}
            {/* Redirect to dashboard for root path */}
            <Route path="/" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
