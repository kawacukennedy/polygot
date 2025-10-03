import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../contexts/AuthContext';

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;

describe('Header', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockUseAuth.mockReset();
    // Default mock values for unauthenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    });
  });

  it('renders PolyglotCodeHub title', () => {
    render(
      <Router>
        <Header toggleTheme={jest.fn()} mode="light" handleDrawerToggle={jest.fn()} />
      </Router>
    );
    expect(screen.getByText(/PolyglotCodeHub/i)).toBeInTheDocument();
  });

  it('shows login and signup buttons when not authenticated', () => {
    render(
      <Router>
        <Header toggleTheme={jest.fn()} mode="light" handleDrawerToggle={jest.fn()} />
      </Router>
    );
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    expect(screen.getByText(/Log In/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/account of current user/i)).not.toBeInTheDocument(); // Profile icon button
  });

  it('shows profile menu when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user', status: 'active' },
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    });
    render(
      <Router>
        <Header toggleTheme={jest.fn()} mode="light" handleDrawerToggle={jest.fn()} />
      </Router>
    );
    const profileIconButton = screen.getByLabelText(/account of current user/i);
    fireEvent.click(profileIconButton);
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sign Up/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Log In/i)).not.toBeInTheDocument();
  });

  it('shows Admin button in profile menu when authenticated as admin', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' },
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
    });
    render(
      <Router>
        <Header toggleTheme={jest.fn()} mode="light" handleDrawerToggle={jest.fn()} />
      </Router>
    );
    const profileIconButton = screen.getByLabelText(/account of current user/i);
    fireEvent.click(profileIconButton);
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
  });

  it('toggles theme when theme icon button is clicked', () => {
    const toggleTheme = jest.fn();
    render(
      <Router>
        <Header toggleTheme={toggleTheme} mode="light" handleDrawerToggle={jest.fn()} />
      </Router>
    );
    const themeToggleButton = screen.getByLabelText(/toggle light\/dark mode/i); // Assuming an accessible label
    fireEvent.click(themeToggleButton);
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});
