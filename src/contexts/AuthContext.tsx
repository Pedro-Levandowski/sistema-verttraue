
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  userName: string | null;
  isAuthenticated: boolean;
  login: (token: string, userName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUserName = localStorage.getItem('userName');
    
    if (savedToken) {
      setToken(savedToken);
      setUserName(savedUserName);
    }
  }, []);

  const login = (newToken: string, newUserName: string) => {
    setToken(newToken);
    setUserName(newUserName);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userName', newUserName);
  };

  const logout = () => {
    setToken(null);
    setUserName(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
  };

  const value = {
    token,
    userName,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
