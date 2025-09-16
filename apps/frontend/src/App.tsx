
import React, { useState } from 'react';
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

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  // Placeholder for XP gain logic
  const gainXp = (amount: number) => {
    setUserXp(prevXp => prevXp + amount);
    showNotification(`Gained ${amount} XP! Total: ${userXp + amount}`, 'info');
  };

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
            <li className="ml-auto">
              <span className="text-sm text-gray-300 mr-2">XP: {userXp}</span>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-gray-300">Register</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage showNotification={showNotification} />} />
          <Route path="/playground" element={<PlaygroundPage showNotification={showNotification} />} />
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
