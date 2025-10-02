import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { User } from '../types/User';
import { loginUser, signupUser } from '../services/api'; // Import API functions

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void; // Add setUser to AuthContextType
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing tokens/user on initial load
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      // In a real app, you'd validate the token with the backend
      // For now, we'll just assume it's valid and set a dummy user
      setUser({ id: '1', name: 'Authenticated User', email: 'user@example.com', role: 'user', status: 'active' });
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginUser(email, password);

      if (response.ok) {
        const data = await response.json();
        // Assuming backend sets httpOnly cookies, so no need to manually set them here
        // If backend returns user data, set it
        setUser(data.user || { id: '1', name: 'Logged In User', email: email, role: 'user', status: 'active' });
        setIsAuthenticated(true);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData.message);
        return false;
      }
    } catch (error) {
      console.error('Network error during login:', error);
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await signupUser(username, email, password);

      if (response.ok) {
        // Assuming backend handles email verification and doesn't return tokens immediately
        return true;
      } else {
        const errorData = await response.json();
        console.error('Signup failed:', errorData.message);
        return false;
      }
    } catch (error) {
      console.error('Network error during signup:', error);
      return false;
    }
  };

  const logout = () => {
    // Invalidate tokens on the backend if necessary
    Cookies.remove('accessToken'); // Remove client-side cookie if any
    Cookies.remove('refreshToken'); // Remove client-side cookie if any
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
