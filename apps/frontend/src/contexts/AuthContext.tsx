import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { User } from '../types/User';
import { loginUser, signupUser } from '../services/api'; // Import API functions

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void; // Add setUser to AuthContextType
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      // In a real app, you'd validate the token with the backend
      // For now, we'll just assume it's valid and set a dummy user
      setUser({ id: '1', name: 'Authenticated User', email: 'user@example.com', role: 'user', status: 'active' });
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const data = await loginUser(email, password); // loginUser now returns data directly
      // Assuming backend sets httpOnly cookies, so no need to manually set them here
      // If backend returns user data, set it
      setUser(data.user || { id: '1', name: 'Logged In User', email: email, role: 'user', status: 'active' });
      setIsAuthenticated(true);
    } catch (error) {
      throw error; // Re-throw the error from apiCall
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<void> => {
    try {
      await signupUser(username, email, password); // signupUser now returns data directly or throws
      // No need to check response.ok here, apiCall handles it
    } catch (error) {
      throw error; // Re-throw the error from apiCall
    }
  };

  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, setUser }}>
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
