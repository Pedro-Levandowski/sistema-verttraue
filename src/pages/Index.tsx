
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../components/Auth/LoginPage';
import DashboardPage from '../components/Dashboard/DashboardPage';
import EstoquePage from '../components/Estoque/EstoquePage';
import FornecedoresPage from '../components/Fornecedores/FornecedoresPage';
import AfiliadosPage from '../components/Afiliados/AfiliadosPage';
import VendasPage from '../components/Vendas/VendasPage';

type CurrentPage = 'dashboard' | 'estoque' | 'fornecedores' | 'afiliados' | 'vendas';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<CurrentPage>('dashboard');

  // Se não estiver autenticado, mostrar página de login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Se estiver autenticado, mostrar o sistema
  const renderPage = () => {
    switch (currentPage) {
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
};

export default Index;
