
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
  // MODO TEMPORÁRIO: Sempre logado para testes
  const [token, setToken] = useState<string | null>('temporary-token');
  const [userName, setUserName] = useState<string | null>('Admin Teste');

  useEffect(() => {
    // TEMPORÁRIO: Sempre definir como logado
    console.log('🔧 MODO TESTE: Usuário automaticamente logado');
    setToken('temporary-token');
    setUserName('Admin Teste');
  }, []);

  const login = (newToken: string, newUserName: string) => {
    console.log('Login executado com:', { newToken, newUserName });
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
    isAuthenticated: true, // TEMPORÁRIO: Sempre true para testes
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
