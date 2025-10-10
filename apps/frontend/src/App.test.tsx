import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock contexts
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({ user: null, login: jest.fn(), logout: jest.fn() }),
}));

jest.mock('./contexts/ToastContext', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useToast: () => ({ addToast: jest.fn() }),
}));

jest.mock('./contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('./contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

test('renders app with header', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  // Check if header is rendered
  expect(screen.getByRole('banner')).toBeInTheDocument();
});

test('renders skip link for accessibility', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  const skipLink = screen.getByText('Skip to main content');
  expect(skipLink).toBeInTheDocument();
  expect(skipLink).toHaveAttribute('href', '#main');
});
