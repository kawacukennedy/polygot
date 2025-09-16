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

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <Router>
      <div className="App">
        <nav className="bg-gray-800 p-4 text-white">
          <ul className="flex space-x-4">
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
              <Link to="/login" className="hover:text-gray-300">Login</Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-gray-300">Register</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
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
      </div>
    </Router>
  );
}

export default App;