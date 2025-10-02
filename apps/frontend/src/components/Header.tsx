
import React from 'react';
import { Link } from 'react-router-dom';
import useTheme from '../hooks/useTheme';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-light-background dark:bg-dark-background shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center">
        <img src="/logo192.png" alt="PolyglotCodeHub Logo" className="h-8 w-8 mr-4" />
        <h1 className="text-xl font-bold text-light-text_primary dark:text-dark-text_primary">PolyglotCodeHub</h1>
      </div>
      <nav className="hidden md:flex items-center space-x-4">
        <Link to="/" className="hover:text-light-accent dark:hover:text-dark-accent">Home</Link>
        <Link to="/snippets" className="hover:text-light-accent dark:hover:text-dark-accent">Snippets</Link>
        <Link to="/leaderboard" className="hover:text-light-accent dark:hover:text-dark-accent">Leaderboard</Link>
        <Link to="/profile" className="hover:text-light-accent dark:hover:text-dark-accent">Profile</Link>
      </nav>
      <div className="flex items-center">
        <button onClick={toggleTheme} className="mr-4 p-2 rounded-full focus:outline-none">
          {theme === 'dark' ? '🌞' : '🌜'}
        </button>
        {/* Placeholder for Profile Menu */}
        <div className="w-8 h-8 bg-light-accent dark:bg-dark-accent rounded-full"></div>
      </div>
    </header>
  );
};

export default Header;
