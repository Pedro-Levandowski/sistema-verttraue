
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { Package, Factory, Users, DollarSign, TrendingUp } from 'lucide-react';
import MenuCard from '../Layout/MenuCard';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useAffiliates } from '../../hooks/useAffiliates';
import { useSales } from '../../hooks/useSales';
import { useKits } from '../../hooks/useKits';
import { useConjuntos } from '../../hooks/useConjuntos';

interface DashboardPageProps {
  onNavigate: (page: 'dashboard' | 'estoque' | 'fornecedores' | 'afiliados' | 'vendas') => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { userName, logout } = useAuth();
  const { products } = useProducts();
  const { suppliers } = useSuppliers();
  const { affiliates } = useAffiliates();
  const { sales } = useSales();
  const { kits } = useKits();
  const { conjuntos } = useConjuntos();

  // Calcular estatísticas
  const totalProducts = products.length + kits.length + conjuntos.length;
  const totalSuppliers = suppliers.length;
  const activeAffiliates = affiliates.filter(a => a.ativo).length;
  
  // Corrigir cálculo das vendas totais
  const totalSales = sales.reduce((total, sale) => {
    const saleValue = Number(sale.valor_total || sale.total || 0);
    return total + (isNaN(saleValue) ? 0 : saleValue);
  }, 0);

  // Alterar para estoque baixo < 3 unidades
  const lowStockProducts = products.filter(p => p.estoque_site < 3).length;

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

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Produtos/Kits/Conjuntos</p>
                <p className="text-2xl font-bold text-vertttraue-primary">{totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Fornecedores</p>
                <p className="text-2xl font-bold text-vertttraue-primary">{totalSuppliers}</p>
              </div>
              <Factory className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Afiliados Ativos</p>
                <p className="text-2xl font-bold text-vertttraue-primary">{activeAffiliates}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Vendas Totais</p>
                <p className="text-2xl font-bold text-vertttraue-primary">
                  R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Alertas - alterado para menos de 3 unidades */}
        {lowStockProducts > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
              <p className="text-yellow-800">
                <strong>Atenção:</strong> {lowStockProducts} produto(s) com estoque baixo (menos de 3 unidades)
              </p>
            </div>
          </div>
        )}

        {/* Menu Principal - Removido Debug API */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <MenuCard
            title="Estoque"
            icon={Package}
            color="#3b82f6"
            onClick={() => onNavigate('estoque')}
          />
          
          <MenuCard
            title="Fornecedores"
            icon={Factory}
            color="#10b981"
            onClick={() => onNavigate('fornecedores')}
          />
          
          <MenuCard
            title="Afiliados"
            icon={Users}
            color="#8b5cf6"
            onClick={() => onNavigate('afiliados')}
          />
          
          <MenuCard
            title="Vendas"
            icon={DollarSign}
            color="#f59e0b"
            onClick={() => onNavigate('vendas')}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
