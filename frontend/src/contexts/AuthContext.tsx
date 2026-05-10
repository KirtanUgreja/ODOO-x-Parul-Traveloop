import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          setUser(response.data || response.user);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    const { token, user: userData } = response;
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await authService.register(name, email, password);
    const { token, user: newUserData } = response;
    localStorage.setItem('token', token);
    setUser(newUserData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAuthenticated: !!user, 
        login, 
        signup, 
        logout 
      }}
    >
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
