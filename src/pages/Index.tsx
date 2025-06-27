
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../components/Auth/LoginPage';
import DashboardPage from '../components/Dashboard/DashboardPage';
import EstoquePage from '../components/Estoque/EstoquePage';
import FornecedoresPage from '../components/Fornecedores/FornecedoresPage';
import AfiliadosPage from '../components/Afiliados/AfiliadosPage';
import VendasPage from '../components/Vendas/VendasPage';
import ApiTestComponent from '../components/Debug/ApiTestComponent';

type CurrentPage = 'dashboard' | 'estoque' | 'fornecedores' | 'afiliados' | 'vendas' | 'debug';

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
      case 'debug':
        return (
          <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray p-4">
            <div className="mb-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="bg-vertttraue-primary text-white px-4 py-2 rounded hover:bg-vertttraue-primary/80"
              >
                ← Voltar ao Dashboard
              </button>
            </div>
            <ApiTestComponent />
          </div>
        );
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return renderPage();
};

export default Index;
