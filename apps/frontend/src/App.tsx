import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlaygroundPage from './pages/PlaygroundPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Notification from './components/Notification';
import FirstTimeVisitorOverlay from './components/FirstTimeVisitorOverlay';
import './App.css';

function App() {
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [userXp, setUserXp] = useState(0);
  const [loginStreak, setLoginStreak] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isOffline, setIsOffline] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const gainXp = (amount: number) => {
    setUserXp(prevXp => prevXp + amount);
    showNotification(`Gained ${amount} XP! Total: ${userXp + amount}`, 'info');
  };

  useEffect(() => {
    const lastLoginDate = localStorage.getItem('lastLoginDate');
    const today = new Date().toDateString();

    if (lastLoginDate) {
      const lastLogin = new Date(lastLoginDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastLogin.toDateString() === yesterday.toDateString()) {
        // Logged in yesterday, increment streak
        setLoginStreak(prevStreak => prevStreak + 1);
        showNotification(`Daily login streak: ${loginStreak + 1} days!`, 'success');
      } else if (lastLogin.toDateString() !== today) {
        // Missed a day, reset streak
        setLoginStreak(0);
      }
    } else {
      // First login, start streak
      setLoginStreak(1);
    }
    localStorage.setItem('lastLoginDate', today);
  }, []);

  return (
    <Router>
      <div className="App">
        <nav className="bg-gray-800 p-4 text-white">
          <ul className="flex space-x-4 items-center">
            <li>
              <Link to="/" className="hover:text-gray-300">Home</Link>
            </li>
            <li>
              <Link to="/playground" className="hover:text-gray-300">Playground</Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
            </li>
            <li className="ml-auto flex items-center">
              <span className="text-sm text-gray-300 mr-2">XP: {userXp}</span>
              <span className="text-sm text-gray-300 mr-2">Streak: {loginStreak} 🔥</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-gray-700 text-white text-sm rounded-md p-1"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
              <button
                onClick={() => setIsOffline(prev => !prev)}
                className={`ml-2 px-2 py-1 text-xs rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'}`}
              >
                {isOffline ? 'Offline' : 'Online'}
              </button>
              <Link to="/login" className="hover:text-gray-300 ml-2">Login</Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-gray-300">Register</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage showNotification={showNotification} gainXp={gainXp} />} />
          <Route path="/playground" element={<PlaygroundPage showNotification={showNotification} gainXp={gainXp} />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage showNotification={showNotification} />} />
          <Route path="/register" element={<RegisterPage showNotification={showNotification} />} />
        </Routes>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={clearNotification}
          />
        )}

        <FirstTimeVisitorOverlay onClose={() => {}} />
      </div>
    </Router>
  );
}

export default App;