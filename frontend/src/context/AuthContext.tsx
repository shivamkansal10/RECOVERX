import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import type { User } from '../types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTokenState(null);
    setUserState(null);
    setIsLoading(false);
  };

  const login = async (newToken: string): Promise<User> => {
    localStorage.setItem('token', newToken);
    setTokenState(newToken);
    setIsLoading(true);
    
    try {
      // Request the authenticated user's profile
      // The Axios request interceptor will automatically attach this token from local storage
      const response = await axiosClient.get<any>('/api/users/profile');
      const { password, ...userData } = response.data;
      
      // Store user details in local storage (without password)
      localStorage.setItem('user', JSON.stringify(userData));
      setUserState(userData);
      setIsLoading(false);
      return userData;
    } catch (error) {
      // Clean up token and user state if user profile fetch fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setTokenState(null);
      setUserState(null);
      setIsLoading(false);
      throw error;
    }
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await axiosClient.get<any>('/api/users/profile');
          const { password, ...userData } = response.data;
          
          localStorage.setItem('user', JSON.stringify(userData));
          setUserState(userData);
        } catch (error) {
          console.error('Failed to restore authentication session:', error);
          
          // Clear credentials on errors
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTokenState(null);
          setUserState(null);
        }
      }
      setIsLoading(false);
    };

    bootstrapAuth();
  }, []);

  const refreshUser = async (): Promise<User> => {
    const response = await axiosClient.get<any>('/api/users/profile');
    const { password, ...userData } = response.data;
    localStorage.setItem('user', JSON.stringify(userData));
    setUserState(userData);
    return userData;
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
