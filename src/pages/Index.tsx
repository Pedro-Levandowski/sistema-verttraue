
import React, { useState } from 'react';
import { Package, Users, Building2, BarChart3, Bug } from 'lucide-react';
import MenuCard from '../components/Layout/MenuCard';
import EstoquePage from '../components/Estoque/EstoquePage';
import VendasPage from '../components/Vendas/VendasPage';
import AfiliadosPage from '../components/Afiliados/AfiliadosPage';
import FornecedoresPage from '../components/Fornecedores/FornecedoresPage';
import DashboardPage from '../components/Dashboard/DashboardPage';
import ApiTestComponent from '../components/Debug/ApiTestComponent';
import { useAuth } from '../contexts/AuthContext';

type CurrentPage = 'menu' | 'estoque' | 'vendas' | 'afiliados' | 'fornecedores' | 'dashboard' | 'debug';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('menu');
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    setCurrentPage('menu');
  };

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

  if (currentPage === 'debug') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-vertttraue-primary">Debug & Testes</h1>
            <button 
              onClick={() => setCurrentPage('menu')}
              className="bg-vertttraue-primary hover:bg-vertttraue-primary/80 text-white px-4 py-2 rounded-lg"
            >
              Voltar ao Menu
            </button>
          </div>
          <ApiTestComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      {/* Header Principal */}
      <header className="bg-vertttraue-primary text-white p-6 shadow-lg">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-normal mb-2" style={{ fontFamily: 'Tenor Sans' }}>vertttraue</h1>
          <p className="text-xl opacity-90">Sistema de Gestão de Estoque</p>
          <p className="text-sm opacity-75 mt-2">🔧 MODO TESTE - Autenticação desabilitada temporariamente</p>
        </div>
      </header>

      {/* Menu Principal */}
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 max-w-7xl mx-auto">
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

          <MenuCard
            title="Debug API"
            icon={Bug}
            color="#dc2626"
            onClick={() => setCurrentPage('debug')}
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={() => setCurrentPage('debug')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg"
          >
            🔧 Testar API
          </button>
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
        <p className="text-sm text-red-600 mt-1">⚠️ Modo de desenvolvimento - Autenticação temporariamente desabilitada</p>
      </footer>
    </div>
  );
};

export default Index;
