
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Layout/Header';
import MenuCard from '../Layout/MenuCard';

interface DashboardPageProps {
  onNavigate: (page: 'dashboard' | 'estoque' | 'fornecedores' | 'afiliados' | 'vendas' | 'debug') => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { userName, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-vertttraue-primary mb-2">
              Sistema Vertttraue
            </h1>
            <p className="text-gray-600">
              Bem-vindo, {userName}! Selecione uma opção para continuar.
            </p>
          </div>
          <Button 
            onClick={logout} 
            variant="outline"
            className="hover:bg-red-50 hover:border-red-300"
          >
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MenuCard
            title="Estoque"
            description="Gerenciar produtos, conjuntos e kits"
            icon="📦"
            onClick={() => onNavigate('estoque')}
          />
          
          <MenuCard
            title="Fornecedores"
            description="Cadastrar e gerenciar fornecedores"
            icon="🏭"
            onClick={() => onNavigate('fornecedores')}
          />
          
          <MenuCard
            title="Afiliados"
            description="Gerenciar rede de afiliados"
            icon="👥"
            onClick={() => onNavigate('afiliados')}
          />
          
          <MenuCard
            title="Vendas"
            description="Registrar e acompanhar vendas"
            icon="💰"
            onClick={() => onNavigate('vendas')}
          />
          
          <MenuCard
            title="Debug API"
            description="Testar conectividade e APIs"
            icon="🔧"
            onClick={() => onNavigate('debug')}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
