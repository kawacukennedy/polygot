import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      navigate(`/search?q=${debouncedQuery}`);
    }
  }, [debouncedQuery, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is now debounced
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-surface h-15 flex items-center px-4 shadow-md" style={{ height: '60px' }}>
      <button
        className="md:hidden mr-4 focus:outline-none"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        ☰
      </button>
      <div className="flex items-center" style={{ width: '240px' }}>
        <Link to="/" className="text-2xl font-bold text-primary ml-4" style={{ fontSize: '40px' }}>
          Polyglot
        </Link>
        <nav id="nav" className="hidden md:flex ml-5 space-x-5" role="navigation" aria-label="Main navigation">
          <Link to="/" className="text-muted hover:text-primary" tabIndex={10}>
            {t('nav.home')}
          </Link>
          <Link to="/my-snippets" className="text-muted hover:text-primary" tabIndex={11}>
            {t('nav.create')}
          </Link>
          <Link to="/leaderboard" className="text-muted hover:text-primary" tabIndex={12}>
            Leaderboard
          </Link>
          <Link to="/profile" className="text-muted hover:text-primary" tabIndex={13}>
            {t('nav.profile')}
          </Link>
        </nav>
      </div>
      <div className="flex-1"></div>
      <div className="flex items-center mr-4">
        <LanguageSelector />
      </div>
      <div className="flex items-center" style={{ width: '360px' }}>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 px-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-focus-ring"
            aria-label={t('common.search')}
            style={{ width: '360px' }}
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
              aria-label="Open profile menu"
              tabIndex={50}
            >
              <img
                src="https://i.pravatar.cc/36"
                alt="User Avatar"
                className="w-9 h-9 rounded-full"
                style={{ width: '36px', height: '36px' }}
              />
            </button>
            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black opacity-45 backdrop-blur-sm z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                  style={{ zIndex: 999 }}
                ></div>
                <div
                  className="absolute right-0 mt-2 bg-surface rounded-lg shadow-lg py-1 z-dropdown"
                  style={{ width: '220px', zIndex: 1000, animation: 'fade-slide-in 180ms cubic-bezier(.2,.9,.2,1)' }}
                  role="menu"
                  tabIndex={-1}
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-muted hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                    tabIndex={51}
                    role="menuitem"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-muted hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                    tabIndex={52}
                    role="menuitem"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-muted hover:bg-gray-100"
                    tabIndex={53}
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              </>
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
