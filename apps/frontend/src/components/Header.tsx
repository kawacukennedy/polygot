import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-surface h-16 flex items-center justify-between px-4 shadow-md">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-primary mr-8">
          Polyglot
        </Link>
        <nav className="hidden md:flex space-x-6">
          <Link to="/dashboard" className="text-muted hover:text-primary">
            Dashboard
          </Link>
          <Link to="/snippets/new" className="text-muted hover:text-primary">
            New Snippet
          </Link>
          <Link to="/leaderboard" className="text-muted hover:text-primary">
            Leaderboard
          </Link>
        </nav>
      </div>
      <div className="flex items-center">
        <form onSubmit={handleSearch} className="relative mr-4">
          <input
            type="text"
            placeholder="Search snippets, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80 h-10 px-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted">
            🔍
          </button>
        </form>
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center focus:outline-none"
            >
              <img
                src="https://i.pravatar.cc/36"
                alt="User Avatar"
                className="w-9 h-9 rounded-full"
              />
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface rounded-md shadow-lg py-1 z-dropdown">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-muted hover:bg-gray-100"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-muted hover:bg-gray-100"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-muted hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover">
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
