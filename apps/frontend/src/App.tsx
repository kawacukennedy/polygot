import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Alert, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import './i18n'; // Initialize i18n

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
import SearchPage from './pages/SearchPage';
import MySnippetsPage from './pages/MySnippetsPage';
import ExecutionsPage from './pages/ExecutionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PrivacyPage from './pages/PrivacyPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GlobalShortcuts from './components/GlobalShortcuts';

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip links for accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      {isOffline && (
        <Alert variant="destructive" className="rounded-none">
          <AlertDescription className="flex items-center justify-between">
            <span>You are offline — some features are unavailable</span>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Reconnect
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <GlobalShortcuts />
      <Header onMenuClick={handleDrawerToggle} />
      <div className="flex flex-1">
        <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
        <main id="main" className="flex-1 p-6" tabIndex={-1}>
           <Routes>
             <Route path="/signup" element={<SignUpPage />} />
             <Route path="/login" element={<LoginPage />} />
             <Route path="/verify-email" element={<VerifyEmailPage />} />
             <Route path="/forgot-password" element={<ForgotPasswordPage />} />
             <Route path="/reset-password" element={<ResetPasswordPage />} />
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
             <Route path="/search" element={<SearchPage />} />
             <Route path="/my-snippets" element={<MySnippetsPage />} />
             <Route path="/executions" element={<ExecutionsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              <Route path="/" element={<DashboardPage />} />
           </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
