import React, { useState } from 'react';
import { Package, Users, Building2, BarChart3 } from 'lucide-react';
import MenuCard from '../components/Layout/MenuCard';
import EstoquePage from '../components/Estoque/EstoquePage';
import VendasPage from '../components/Vendas/VendasPage';
import AfiliadosPage from '../components/Afiliados/AfiliadosPage';
import FornecedoresPage from '../components/Fornecedores/FornecedoresPage';
import DashboardPage from '../components/Dashboard/DashboardPage';
import LoginPage from '../components/Auth/LoginPage';
import { useAuth } from '../contexts/AuthContext';

type CurrentPage = 'menu' | 'estoque' | 'vendas' | 'afiliados' | 'fornecedores' | 'dashboard';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('menu');
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setCurrentPage('menu');
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (currentPage === 'estoque') {
    return <EstoquePage onBack={() => setCurrentPage('menu')} />;
  }

  if (currentPage === 'vendas') {
    return <VendasPage onBack={() => setCurrentPage('menu')} />;
  }

  if (currentPage === 'afiliados') {
    return <AfiliadosPage onBack={() => setCurrentPage('menu')} />;
  }

  if (currentPage === 'fornecedores') {
    return <FornecedoresPage onBack={() => setCurrentPage('menu')} />;
  }

  if (currentPage === 'dashboard') {
    return <DashboardPage onBack={() => setCurrentPage('menu')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      {/* Header Principal */}
      <header className="bg-vertttraue-primary text-white p-6 shadow-lg">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-normal mb-2" style={{ fontFamily: 'Tenor Sans' }}>vertttraue</h1>
          <p className="text-xl opacity-90">Sistema de Gestão de Estoque</p>
        </div>
      </header>

      {/* Menu Principal */}
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          <MenuCard
            title="Estoque"
            icon={Package}
            color="#00565F"
            onClick={() => setCurrentPage('estoque')}
          />
          
          <MenuCard
            title="Vendas"
            icon={Package}
            color="#00565F"
            onClick={() => setCurrentPage('vendas')}
          />
          
          <MenuCard
            title="Afiliados"
            icon={Users}
            color="#00565F"
            onClick={() => setCurrentPage('afiliados')}
          />
          
          <MenuCard
            title="Fornecedores"
            icon={Building2}
            color="#00565F"
            onClick={() => setCurrentPage('fornecedores')}
          />

          <MenuCard
            title="Dashboard"
            icon={BarChart3}
            color="#00565F"
            onClick={() => setCurrentPage('dashboard')}
          />
        </div>

        {/* Botão Sair */}
        <div className="flex justify-center mt-8">
          <button 
            onClick={handleLogout}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary/80 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg"
          >
            Sair
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-600">
        <p>&copy; 2025 vertttraue - Sistema de Gestão de Estoque</p>
      </footer>
    </div>
  );
};

export default Index;
