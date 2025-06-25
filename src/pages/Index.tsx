
import React, { useState } from 'react';
import { Package, Users, Building2 } from 'lucide-react';
import MenuCard from '../components/Layout/MenuCard';
import EstoquePage from '../components/Estoque/EstoquePage';
import VendasPage from '../components/Vendas/VendasPage';
import AfiliadosPage from '../components/Afiliados/AfiliadosPage';
import FornecedoresPage from '../components/Fornecedores/FornecedoresPage';

type CurrentPage = 'menu' | 'estoque' | 'vendas' | 'afiliados' | 'fornecedores';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('menu');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      {/* Header Principal */}
      <header className="bg-vertttraue-primary text-white p-6 shadow-lg">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">VERTTTRAUE</h1>
          <p className="text-xl opacity-90">Sistema de Gestão de Estoque</p>
        </div>
      </header>

      {/* Menu Principal */}
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
        </div>

        {/* Botão Sair */}
        <div className="flex justify-center mt-8">
          <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg">
            Sair
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-600">
        <p>&copy; 2024 Vertttraue - Sistema de Gestão de Estoque</p>
      </footer>
    </div>
  );
};

export default Index;
