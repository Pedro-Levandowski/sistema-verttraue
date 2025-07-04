
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/Auth/LoginPage';
import DashboardPage from './components/Dashboard/DashboardPage';
import EstoquePage from './components/Estoque/EstoquePage';
import FornecedoresPage from './components/Fornecedores/FornecedoresPage';
import AfiliadosPage from './components/Afiliados/AfiliadosPage';
import VendasPage from './components/Vendas/VendasPage';
import { useAuth } from './contexts/AuthContext';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

type Page = 'dashboard' | 'estoque' | 'fornecedores' | 'afiliados' | 'vendas';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'estoque':
        return <EstoquePage onBack={() => setCurrentPage('dashboard')} />;
      case 'fornecedores':
        return <FornecedoresPage onBack={() => setCurrentPage('dashboard')} />;
      case 'afiliados':
        return <AfiliadosPage onBack={() => setCurrentPage('dashboard')} />;
      case 'vendas':
        return <VendasPage onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return renderPage();
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
