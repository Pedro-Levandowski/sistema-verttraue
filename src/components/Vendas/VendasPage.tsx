
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '../Layout/Header';
import VendaModal from './VendaModal';
import VendaDetalhesModal from './VendaDetalhesModal';
import { useSales } from '../../hooks/useSales';
import { useProducts } from '../../hooks/useProducts';
import { useAffiliates } from '../../hooks/useAffiliates';
import { useKits } from '../../hooks/useKits';
import { useConjuntos } from '../../hooks/useConjuntos';
import { Sale } from '../../types';

interface VendasPageProps {
  onBack: () => void;
}

const VendasPage: React.FC<VendasPageProps> = ({ onBack }) => {
  const { sales, loading: salesLoading, error: salesError, createSale } = useSales();
  const { products } = useProducts();
  const { affiliates } = useAffiliates();
  const { kits } = useKits();
  const { conjuntos } = useConjuntos();
  
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [showVendaDetalhesModal, setShowVendaDetalhesModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = sales.filter(sale =>
    (sale.id && sale.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sale.afiliado_nome && sale.afiliado_nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleShowSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowVendaDetalhesModal(true);
  };

  const handleSaveSale = async (saleData: any) => {
    try {
      await createSale(saleData);
      console.log('✅ Venda registrada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao registrar venda:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vertttraue-white to-vertttraue-gray">
      <Header
        title="Gestão de Vendas"
        onBack={onBack}
        actions={
          <Button
            onClick={() => setShowVendaModal(true)}
            className="bg-vertttraue-primary hover:bg-vertttraue-primary/80"
            disabled={salesLoading}
          >
            Nova Venda
          </Button>
        }
      />

      <div className="container mx-auto p-6">
        {/* Indicador de carregamento */}
        {salesLoading && (
          <Alert className="mb-4">
            <AlertDescription>Carregando vendas do banco de dados...</AlertDescription>
          </Alert>
        )}

        {/* Indicador de erro */}
        {salesError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              ❌ Erro ao conectar com o backend: {salesError}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar vendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-vertttraue-primary">
            Histórico de Vendas ({sales.length})
          </h2>
          
          {sales.length === 0 && !salesLoading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma venda encontrada no banco de dados.</p>
              <p className="text-sm">Registre a primeira venda clicando no botão acima.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID Venda</th>
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Afiliado</th>
                    <th className="text-left p-2">Total</th>
                    <th className="text-left p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-xs">{sale.id}</td>
                      <td className="p-2">
                        {sale.data_venda ? new Date(sale.data_venda).toLocaleDateString('pt-BR') : 'N/A'}
                      </td>
                      <td className="p-2">{sale.afiliado_nome || '-'}</td>
                      <td className="p-2 font-bold text-vertttraue-primary">
                        R$ {(sale.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleShowSaleDetails(sale)}
                          className="hover:bg-vertttraue-primary hover:text-white"
                        >
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredSales.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma venda encontrada para "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      <VendaModal
        isOpen={showVendaModal}
        onClose={() => setShowVendaModal(false)}
        onSave={handleSaveSale}
        products={products}
        conjuntos={conjuntos}
        kits={kits}
        affiliates={affiliates}
      />

      <VendaDetalhesModal
        isOpen={showVendaDetalhesModal}
        onClose={() => setShowVendaDetalhesModal(false)}
        sale={selectedSale}
        products={products}
        conjuntos={conjuntos}
        kits={kits}
      />
    </div>
  );
};

export default VendasPage;
