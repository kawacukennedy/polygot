import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './Header';
import { AuthContext } from '../contexts/AuthContext';

// Mock AuthContext for testing
const mockAuthContext = {
  isAuthenticated: false,
  user: null,
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  setUser: jest.fn(),
};

const renderWithRouterAndAuth = (ui: React.ReactElement, {
  providerProps = mockAuthContext
} = {}) => {
  return render(
    <AuthContext.Provider value={providerProps}>
      <Router>
        {ui}
      </Router>
    </AuthContext.Provider>
  );
};

describe('Header', () => {
  it('renders PolyglotCodeHub title', () => {
    renderWithRouterAndAuth(<Header toggleTheme={jest.fn()} mode="light" handleDrawerToggle={jest.fn()} />);
    expect(screen.getByText(/PolyglotCodeHub/i)).toBeInTheDocument();
  });

  it('shows login and signup buttons when not authenticated', () => {
    renderWithRouterAndAuth(<Header toggleTheme={jest.fn()} mode="light" handleDrawerToggle={jest.fn()} />);
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    expect(screen.getByText(/Log In/i)).toBeInTheDocument();
    expect(screen.queryByText(/Profile/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Logout/i)).not.toBeInTheDocument();
  });

  it('shows profile and logout buttons when authenticated', () => {
    renderWithRouterAndAuth(<Header toggleTheme={jest.fn()} mode="light" handleDrawerToggle={jest.fn()} />,
      { providerProps: { ...mockAuthContext, isAuthenticated: true, user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user', status: 'active' } } });
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sign Up/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Log In/i)).not.toBeInTheDocument();
  });

  it('shows Admin button when authenticated as admin', () => {
    renderWithRouterAndAuth(<Header toggleTheme={jest.fn()} mode="light" handleDrawerToggle={jest.fn()} />,
      { providerProps: { ...mockAuthContext, isAuthenticated: true, user: { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' } } });
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
  });

  it('toggles theme when theme icon button is clicked', () => {
    const toggleTheme = jest.fn();
    renderWithRouterAndAuth(<Header toggleTheme={toggleTheme} mode="light" handleDrawerToggle={jest.fn()} />);
    const themeToggleButton = screen.getByLabelText(/toggle light/dark mode/i); // Assuming an accessible label
    fireEvent.click(themeToggleButton);
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});
