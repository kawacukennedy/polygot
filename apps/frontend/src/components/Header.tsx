
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useTheme from '../hooks/useTheme';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Placeholder for user authentication status and role
  const isAuthenticated = true; // This should come from auth context
  const isAdmin = true; // This should come from auth context

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <header className="bg-[var(--color-background)] shadow-md p-4 flex justify-between items-center relative z-10">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img src="/logo192.png" alt="PolyglotCodeHub Logo" className="h-8 w-8 mr-2" />
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">PolyglotCodeHub</h1>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-4">
        <Link to="/" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors duration-200">Home</Link>
        <Link to="/snippets" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors duration-200">Snippets</Link>
        <Link to="/leaderboard" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors duration-200">Leaderboard</Link>
        <Link to="/profile" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors duration-200">Profile</Link>
        {isAdmin && (
          <Link to="/admin/users" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors duration-200">Admin</Link>
        )}
      </nav>

      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-2 py-1 rounded-full bg-[var(--color-background)] border border-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-[var(--color-text-primary)]"
          />
          <svg className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="p-2 rounded-full focus:outline-none text-[var(--color-text-primary)] hover:bg-[var(--color-text-secondary)]/20 transition-colors duration-200">
          {theme === 'dark' ? '🌞' : '🌜'}
        </button>

        {/* Profile Menu */}
        {isAuthenticated && (
          <div className="relative">
            <button onClick={toggleProfileMenu} className="flex items-center focus:outline-none">
              <img src="https://via.placeholder.com/32" alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-[var(--color-accent)]" />
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--color-background)] rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Link to="/profile" className="block px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-text-secondary)]/10">Your Profile</Link>
                <Link to="/settings" className="block px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-text-secondary)]/10">Settings</Link>
                <button className="block w-full text-left px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-text-secondary)]/10">Sign Out</button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu Button (Hamburger) */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="text-[var(--color-text-primary)] focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[var(--color-background)] shadow-lg py-2">
          <Link to="/" className="block px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-text-secondary)]/10" onClick={toggleMobileMenu}>Home</Link>
          <Link to="/snippets" className="block px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-text-secondary)]/10" onClick={toggleMobileMenu}>Snippets</Link>
          <Link to="/leaderboard" className="block px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-text-secondary)]/10" onClick={toggleMobileMenu}>Leaderboard</Link>
          <Link to="/profile" className="block px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-text-secondary)]/10" onClick={toggleMobileMenu}>Profile</Link>
          {isAdmin && (
            <Link to="/admin/users" className="block px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-text-secondary)]/10" onClick={toggleMobileMenu}>Admin</Link>
          )}
          <div className="px-4 py-2">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-8 pr-2 py-1 rounded-full bg-[var(--color-background)] border border-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-[var(--color-text-primary)]"
            />
            <svg className="w-4 h-4 absolute left-6 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
