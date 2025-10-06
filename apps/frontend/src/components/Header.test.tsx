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

  it('renders Polyglot title', () => {
    render(
      <Router>
        <Header onMenuClick={jest.fn()} />
      </Router>
    );
    expect(screen.getByText(/Polyglot/i)).toBeInTheDocument();
  });

  it('shows login button when not authenticated', () => {
    render(
      <Router>
        <Header onMenuClick={jest.fn()} />
      </Router>
    );
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
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
        <Header onMenuClick={jest.fn()} />
      </Router>
    );
    const profileIconButton = screen.getByLabelText(/account of current user/i);
    fireEvent.click(profileIconButton);
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign out/i)).toBeInTheDocument();
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
  });
});
